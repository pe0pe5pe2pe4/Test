import type { TypeDef } from "@/lib/types";
import { getSupabase } from "@/lib/supabase";
import { getLocalType } from "@/lib/local-data";

// types はほぼ静的な5行のマスタなので、サーバインスタンスごとに全件を一度だけ取得して
// メモリに載せる。取得失敗はキャッシュせず（次回再試行）、その呼び出しはローカル seed で応える。
let typesPromise: Promise<Map<string, TypeDef> | null> | null = null;

function loadTypes(): Promise<Map<string, TypeDef> | null> {
  if (!typesPromise) {
    typesPromise = (async () => {
      const supabase = getSupabase();
      if (!supabase) return null;
      const { data, error } = await supabase.from("types").select("*");
      if (error || !data) {
        typesPromise = null;
        return null;
      }
      return new Map((data as TypeDef[]).map((t) => [t.code, t]));
    })();
  }
  return typesPromise;
}

// 毒舌タイプ定義を取得。Supabase 優先、無ければローカル seed。
export async function getType(code: string): Promise<TypeDef | null> {
  const fromDb = (await loadTypes())?.get(code);
  return fromDb ?? getLocalType(code);
}
