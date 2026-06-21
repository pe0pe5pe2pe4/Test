import { decodeAnswers, runDiagnosis } from "@/lib/diagnosis-core";
import { pickCompanies } from "@/lib/pick-companies";
import { getType } from "@/lib/get-type";
import type { Company, TypeDef } from "@/lib/types";

export interface ResolvedResult {
  answers: string;
  type: TypeDef | null;
  worstType: TypeDef | null;
  companies: Company[];
  source: "supabase" | "local";
}

// 共有URLの回答文字列(a)から、結果画面に必要な一式をまとめて解決する。
// seed に answers を使うので、何度呼んでも同じ3社になる（OGP画像と一致）。
export async function resolveResult(a: string): Promise<ResolvedResult> {
  const selected = decodeAnswers(a);
  const { typeCode, filters } = runDiagnosis(selected);

  const type = await getType(typeCode);
  const worstType = type ? await getType(type.worst_match) : null;
  const { companies, source } = await pickCompanies(typeCode, filters, a);

  return { answers: a, type, worstType, companies, source };
}
