import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// service_role キーを使うサーバ専用クライアント（RLSをバイパスする）。
// 承認画面（Step 8）などの管理操作にのみ使用し、クライアントには絶対に露出させない。
// SUPABASE_SERVICE_ROLE_KEY は NEXT_PUBLIC_ を付けないこと。

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceKey) return null;
  if (!adminClient) {
    adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false },
    });
  }
  return adminClient;
}
