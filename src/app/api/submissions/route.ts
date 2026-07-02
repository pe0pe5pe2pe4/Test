import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

// Step 6: ユーザー投稿（「この会社入れて」）を user_submissions に書き込む。
// RLS により anon は INSERT のみ可能（閲覧は管理者だけ）。

const MAX_NAME = 100;
const MAX_NOTE = 500;

export async function POST(req: Request) {
  let body: { company_name?: string; note?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const companyName = (body.company_name ?? "").trim();
  const note = (body.note ?? "").trim();

  if (!companyName) {
    return NextResponse.json({ error: "会社名は必須です" }, { status: 400 });
  }
  if (companyName.length > MAX_NAME || note.length > MAX_NOTE) {
    return NextResponse.json({ error: "入力が長すぎます" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    // ローカル開発（Supabase未接続）では受け付けだけ成功扱いにしない：
    // 投稿が消えると期待を裏切るため、明示的に未対応と返す。
    return NextResponse.json(
      { error: "投稿の受付は現在準備中です" },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("user_submissions").insert({
    company_name: companyName,
    note: note || null,
  });

  if (error) {
    return NextResponse.json({ error: "保存に失敗しました" }, { status: 500 });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
