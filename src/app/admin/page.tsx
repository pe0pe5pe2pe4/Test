import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Company } from "@/lib/types";

// Step 8: 承認画面（あなたの唯一の手作業）。
// pending の企業を一覧表示し、出典リンクを開いて事実確認 → 承認/却下をワンクリック。
// アクセスは /admin?token=<ADMIN_TOKEN>。リンクを知る本人だけが使う前提の簡易保護。

export const dynamic = "force-dynamic";

interface Submission {
  id: string;
  company_name: string;
  note: string | null;
  ai_checked: boolean;
  ai_result: Record<string, unknown> | null;
  created_at: string;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? "";
  const adminToken = process.env.ADMIN_TOKEN;

  if (!adminToken) {
    return (
      <Shell>
        <p className="font-bold">ADMIN_TOKEN が未設定です。</p>
        <p className="mt-2 text-sm text-ink/60">
          環境変数 ADMIN_TOKEN を設定すると承認画面が有効になります（DEPLOY.md参照）。
        </p>
      </Shell>
    );
  }
  if (token !== adminToken) {
    return (
      <Shell>
        <p className="font-bold">認証エラー</p>
        <p className="mt-2 text-sm text-ink/60">/admin?token=… の形式でアクセスしてください。</p>
      </Shell>
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return (
      <Shell>
        <p className="font-bold">Supabase（service role）が未設定です。</p>
        <p className="mt-2 text-sm text-ink/60">
          SUPABASE_SERVICE_ROLE_KEY を設定してください（DEPLOY.md参照）。
        </p>
      </Shell>
    );
  }

  const [{ data: pendingData }, { data: subsData }] = await Promise.all([
    supabase
      .from("companies")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("user_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  const pending = (pendingData ?? []) as Company[];
  const submissions = (subsData ?? []) as Submission[];

  return (
    <Shell>
      <h1 className="text-2xl font-black">承認画面</h1>
      <p className="mt-1 text-sm text-ink/60">
        出典リンクを開いて事実確認 → クリック、だけ。承認するまで診断には出ません。
      </p>

      <h2 className="mt-8 text-lg font-black">
        承認待ちの企業 <span className="text-accent">{pending.length}</span> 件
      </h2>
      <div className="mt-4 space-y-4">
        {pending.length === 0 && (
          <p className="rounded-xl border-2 border-dashed border-ink/15 p-5 text-sm text-ink/50">
            承認待ちはありません。収集バッチが動くとここに並びます。
          </p>
        )}
        {pending.map((c) => (
          <article key={c.id} className="rounded-2xl border-2 border-ink/10 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black">{c.name}</h3>
                <p className="mt-0.5 text-xs text-ink/50">
                  {c.source_origin ?? "?"} / {c.product_field} / {c.visibility} / {c.scale_type} / {c.location_type}
                </p>
              </div>
            </div>

            <dl className="mt-3 space-y-1 text-sm">
              <Row label="接点">{c.familiar_hook}</Row>
              <Row label="シェア">
                {c.share_highlight}{" "}
                <SourceA href={c.share_source} />
              </Row>
              <Row label="年収">
                {c.avg_salary != null ? `約${c.avg_salary}万円 ` : "なし "}
                <SourceA href={c.salary_source} />
              </Row>
              {c.one_liner && <Row label="一言">{c.one_liner}</Row>}
            </dl>

            <div className="mt-4 flex gap-3">
              <DecideButton id={c.id} token={token} action="approve" label="✅ 承認" />
              <DecideButton id={c.id} token={token} action="reject" label="🗑 却下" />
            </div>
          </article>
        ))}
      </div>

      <h2 className="mt-10 text-lg font-black">ユーザー投稿（直近20件）</h2>
      <div className="mt-4 space-y-3">
        {submissions.length === 0 && (
          <p className="rounded-xl border-2 border-dashed border-ink/15 p-5 text-sm text-ink/50">
            まだ投稿はありません。
          </p>
        )}
        {submissions.map((s) => (
          <article key={s.id} className="rounded-xl border-2 border-ink/10 bg-white p-4 text-sm">
            <p className="font-bold">
              {s.company_name}
              <span className="ml-2 text-xs font-normal text-ink/50">
                {s.ai_checked ? "AIチェック済" : "未チェック"}
              </span>
            </p>
            {s.note && <p className="mt-1 text-ink/70">{s.note}</p>}
            {s.ai_result && (
              <pre className="mt-2 overflow-x-auto rounded-lg bg-paper p-2 text-xs text-ink/70">
                {JSON.stringify(s.ai_result, null, 2)}
              </pre>
            )}
          </article>
        ))}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto max-w-2xl px-6 py-12">{children}</main>;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-12 shrink-0 font-bold text-ink/50">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

function SourceA({ href }: { href: string | null }) {
  if (!href) return <span className="text-accent">（出典なし！）</span>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="font-semibold text-accent underline underline-offset-2"
    >
      出典 ↗
    </a>
  );
}

function DecideButton({
  id,
  token,
  action,
  label,
}: {
  id: string;
  token: string;
  action: "approve" | "reject";
  label: string;
}) {
  return (
    <form method="POST" action="/api/admin/decide" className="flex-1">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="action" value={action} />
      <button
        type="submit"
        className={`w-full rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
          action === "approve"
            ? "bg-ink text-paper hover:bg-ink/80"
            : "border-2 border-ink/15 text-ink/60 hover:border-ink/30"
        }`}
      >
        {label}
      </button>
    </form>
  );
}
