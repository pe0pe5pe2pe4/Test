import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Step 8: 承認/却下のワンクリック処理。
// ADMIN_TOKEN の一致を検証し、service_role で status を更新する。

export async function POST(req: Request) {
  const form = await req.formData();
  const token = String(form.get("token") ?? "");
  const id = String(form.get("id") ?? "");
  const action = String(form.get("action") ?? "");

  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken || token !== adminToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!id || (action !== "approve" && action !== "reject")) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ error: "supabase not configured" }, { status: 503 });
  }

  const update =
    action === "approve"
      ? { status: "approved", approved_at: new Date().toISOString() }
      : { status: "rejected" };

  const { error } = await supabase.from("companies").update(update).eq("id", id);
  if (error) {
    return NextResponse.json({ error: "update failed" }, { status: 500 });
  }

  // 承認画面に戻る（トークン付き）
  const url = new URL(req.url);
  return NextResponse.redirect(new URL(`/admin?token=${encodeURIComponent(token)}`, url.origin), 303);
}
