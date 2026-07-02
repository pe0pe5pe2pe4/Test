// ============================================================
// collect-companies / Supabase Edge Function (Deno)
// 仕様書 section 5「データ自動収集パイプライン」の第2層＋第3層。
//   A) Claude API に「身近な接点×高シェア×出典URL付き」の企業候補を出させ、
//      出典フィルタ（5-2 正確性の生命線）を通った候補だけ
//      companies に status='pending', source_origin='ai_batch' で保存する。
//   B) user_submissions の未チェック分に出典チェックを行い ai_result に格納する。
// 承認は人間の仕事（Step 8 の /admin でワンクリック）。ここでは絶対に approved にしない。
//
// デプロイ:  supabase functions deploy collect-companies
// 秘密情報:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// cron 起動: DEPLOY.md 参照（pg_cron + pg_net で週1回呼び出す）
// ============================================================

import { createClient } from "npm:@supabase/supabase-js@2";

const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-sonnet-5";
const CANDIDATES_PER_RUN = 5;

interface AICompanyCandidate {
  name: string;
  familiar_hook: string;
  share_highlight: string;
  share_source: string | null;
  avg_salary: number | null;
  salary_source: string | null;
  one_liner: string;
  product_field: string;
  visibility: "product" | "component";
  scale_type: "niche_top" | "stable";
  location_type: "urban" | "regional";
  type_tags: { type_code: string; weight: number }[];
}

// ---------- 出典フィルタ（仕様 5-2）----------
// 公的・報道・IR系のドメインだけを「軽く信頼できる出典」とみなす。
// 出典URLが無い・信頼ドメイン外の数字は to_review にすらしない（破棄）。
const TRUSTED =
  /\.go\.jp\/|nikkei\.com\/|irbank\.net\/|\/ir\/|\/ir$|edinet|toyokeizai\.net\//;

function autoFilter(c: AICompanyCandidate): "to_review" | "discard" {
  if (!c.share_source || !TRUSTED.test(c.share_source)) return "discard";
  if (c.avg_salary != null && (!c.salary_source || !TRUSTED.test(c.salary_source))) {
    return "discard";
  }
  return "to_review";
}

// ---------- Claude API ----------
async function askClaude(prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": Deno.env.get("ANTHROPIC_API_KEY") ?? "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

function extractJson<T>(text: string): T | null {
  const match = text.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as T;
  } catch {
    return null;
  }
}

// ---------- A) 新規候補の生成 ----------
async function generateCandidates(
  supabase: ReturnType<typeof createClient>
): Promise<{ inserted: number; discarded: number }> {
  const { data: existing } = await supabase.from("companies").select("name");
  const knownNames = new Set((existing ?? []).map((r: { name: string }) => r.name));

  const prompt = `あなたは就活生向け企業データベースの調査員です。
日本の「知名度は低いが世界シェア・国内シェアが高い優良企業（BtoB中心）」を${CANDIDATES_PER_RUN}社挙げてください。
以下は除外: ${[...knownNames].join("、") || "なし"}

各社について次のJSON配列のみを出力（説明文なし）:
[{
 "name": "正式社名",
 "familiar_hook": "就活生の日常との接点を1行で（例: 駅で毎日見るアレ）",
 "share_highlight": "シェアの目玉を1行で（例: ○○で世界シェア約7割）",
 "share_source": "シェアの根拠が確認できるURL（会社IR・官公庁・報道。見つからなければnull）",
 "avg_salary": 平均年収の整数(万円)またはnull,
 "salary_source": "年収の出典URL（有価証券報告書ベースのページ。無ければnull）",
 "one_liner": "一言キャッチ",
 "product_field": "car|electronics|material|food|infra|machine|medical のいずれか",
 "visibility": "product|component",
 "scale_type": "niche_top|stable",
 "location_type": "urban|regional",
 "type_tags": [{"type_code": "loud_sales|comm_disorder_tech|money_machine|clock_out_ghost|world_class_hidden", "weight": 1-3}]
}]

鉄則: 出典URLが確認できない数字は avg_salary=null にする。実在しない会社・確信のない数字は出さない。`;

  const text = await askClaude(prompt);
  const candidates = extractJson<AICompanyCandidate[]>(text) ?? [];

  let inserted = 0;
  let discarded = 0;

  for (const c of candidates) {
    if (!c?.name || knownNames.has(c.name) || autoFilter(c) === "discard") {
      discarded++;
      continue;
    }
    const { data: row, error } = await supabase
      .from("companies")
      .insert({
        name: c.name,
        familiar_hook: c.familiar_hook,
        share_highlight: c.share_highlight,
        share_source: c.share_source,
        avg_salary: c.avg_salary,
        salary_source: c.salary_source,
        one_liner: c.one_liner,
        product_field: c.product_field,
        visibility: c.visibility,
        scale_type: c.scale_type,
        location_type: c.location_type,
        status: "pending",          // ★人間の承認を経るまで診断には出ない
        source_origin: "ai_batch",
      })
      .select("id")
      .single();

    if (error || !row) {
      discarded++;
      continue;
    }
    if (c.type_tags?.length) {
      await supabase.from("company_tags").insert(
        c.type_tags.map((t) => ({
          company_id: row.id,
          type_code: t.type_code,
          weight: Math.min(3, Math.max(1, t.weight | 0)),
        }))
      );
    }
    inserted++;
  }
  return { inserted, discarded };
}

// ---------- B) ユーザー投稿の出典チェック ----------
async function checkSubmissions(
  supabase: ReturnType<typeof createClient>
): Promise<number> {
  const { data: pending } = await supabase
    .from("user_submissions")
    .select("id, company_name, note")
    .eq("ai_checked", false)
    .limit(5);

  let checked = 0;
  for (const sub of pending ?? []) {
    const prompt = `「${sub.company_name}」という日本企業について調査してください。投稿者メモ: ${sub.note ?? "なし"}
次のJSONのみ出力:
{"exists": true/false, "share_highlight": "シェアの目玉1行 or null", "share_source": "出典URL or null", "avg_salary": 整数(万円) or null, "salary_source": "出典URL or null", "verdict": "worth_adding|not_notable|unknown"}
出典URLが確認できない数字は null にすること。`;

    try {
      const text = await askClaude(prompt);
      const result = extractJson<Record<string, unknown>>(text);
      await supabase
        .from("user_submissions")
        .update({ ai_checked: true, ai_result: result })
        .eq("id", sub.id);
      checked++;
    } catch {
      // 失敗した投稿は未チェックのまま次回リトライ
    }
  }
  return checked;
}

// ---------- エントリポイント ----------
Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const gen = await generateCandidates(supabase);
    const checked = await checkSubmissions(supabase);
    return Response.json({ ok: true, ...gen, submissions_checked: checked });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
});
