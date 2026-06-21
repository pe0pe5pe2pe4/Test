import type { TypeDef } from "@/lib/types";
import { getSupabase } from "@/lib/supabase";
import { getLocalType } from "@/lib/local-data";

// 毒舌タイプ定義を取得。Supabase 優先、無ければローカル seed。
export async function getType(code: string): Promise<TypeDef | null> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase
      .from("types")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (!error && data) return data as TypeDef;
  }
  return getLocalType(code);
}
