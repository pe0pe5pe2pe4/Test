import { cache } from "react";
import { decodeAnswers, runDiagnosis } from "@/lib/diagnosis-core";
import { pickCompanies } from "@/lib/pick-companies";
import { getType } from "@/lib/get-type";
import type { Company, TypeDef } from "@/lib/types";

export interface ResolvedResult {
  type: TypeDef | null;
  worstType: TypeDef | null;
  companies: Company[];
  source: "supabase" | "local";
}

// 共有URLの回答文字列(a)から、結果画面に必要な一式をまとめて解決する。
// seed に answers を使うので、何度呼んでも同じ3社になる（OGP画像と一致）。
// React cache() で同一リクエスト内（generateMetadata とページ本体）の重複実行を排除。
export const resolveResult = cache(async (a: string): Promise<ResolvedResult> => {
  const selected = decodeAnswers(a);
  const { typeCode, filters } = runDiagnosis(selected);

  // タイプ定義と企業抽出は独立なので並列に取得する。
  const [type, pick] = await Promise.all([
    getType(typeCode),
    pickCompanies(typeCode, filters, a),
  ]);
  const worstType = type ? await getType(type.worst_match) : null;

  return { type, worstType, companies: pick.companies, source: pick.source };
});
