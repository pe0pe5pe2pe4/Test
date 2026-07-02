// Supabase 未接続時に使うローカルフォールバック。
// src/data/*.json を読み、DBと同じ形（Company / TypeDef）に整形する。
// これにより環境変数なしでも「触ってバズるか試せる」状態（仕様書のMVP線引き）を満たす。

import companiesJson from "@/data/companies.json";
import typesJson from "@/data/types.json";
import type { Company, CompanyTag, TypeDef } from "@/lib/types";

interface SeedCompany extends Omit<Company, "id" | "status" | "source_origin"> {
  tags: CompanyTag[];
}

export interface LocalCompany extends Company {
  tags: CompanyTag[];
}

// 初期投入分の共通ポリシー（承認済み・GNT100由来）は companies.json の defaults が単一ソース。
const { defaults } = companiesJson;

export const LOCAL_COMPANIES: LocalCompany[] = (
  companiesJson.companies as unknown as SeedCompany[]
).map((c, i) => ({
  ...c,
  id: `seed-${i + 1}`,
  status: defaults.status,
  source_origin: defaults.source_origin,
  tags: c.tags ?? [],
}));

const LOCAL_TYPES: TypeDef[] = typesJson.types as unknown as TypeDef[];

export function getLocalType(code: string): TypeDef | null {
  return LOCAL_TYPES.find((t) => t.code === code) ?? null;
}
