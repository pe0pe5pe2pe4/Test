import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Supabase クライアント。環境変数が無い場合は null を返し、
// 呼び出し側はローカルのフォールバックデータ（seed-*.ts）に切り替える。
// これにより Step 1 のSupabase未接続でも診断フロントが動作する。

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey, {
      auth: { persistSession: false },
    });
  }
  return client;
}
