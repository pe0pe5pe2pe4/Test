// ============================================================
// 企業抽出 / pick-companies.ts
// 仕様書 section 4-4「タイプ → 企業抽出」。
//   1. company_tags で typeCode に紐づく承認済み企業を取得
//   2. 質問のフィルタ（visibility / scale_type / location_type）で絞る
//   3. weight 降順 + 軽いジッター → 上位3社
//   4. 3社に満たない場合は filters を1つずつ緩めて母数を確保
// Supabase が設定されていればDBから、無ければローカルseedから取得する。
// ============================================================

import type { CompanyFilter } from "@/lib/diagnosis-core";
import type { Company } from "@/lib/types";
import { getSupabase } from "@/lib/supabase";
import { LOCAL_COMPANIES } from "@/lib/local-data";

interface Weighted {
  company: Company;
  weight: number;
}

// 決定的な擬似乱数（mulberry32）。同じ seed なら同じ並びになる。
// 結果画面と OGP 画像で同じ3社を出すために使う。
function makeRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// フィルタを緩める優先順（後ろのキーほど最後まで残す＝重要）。
// location は希望度が低いので最初に緩め、scale_type（尖り/堅実）は最後まで残す。
const RELAX_ORDER: (keyof CompanyFilter)[] = [
  "location_type",
  "product_field",
  "visibility",
  "scale_type",
];

// 1社が1つのフィルタ条件を満たすか。
// location_type の "regional" は「地方もOK＝制限なし（都市も地方も可）」という
// 仕様の意図（地方を“解禁”する）に合わせ、常に true 扱いにする。
function matchesOne(company: Company, key: keyof CompanyFilter, value: string): boolean {
  if (key === "location_type" && value === "regional") return true;
  return (company as unknown as Record<string, unknown>)[key] === value;
}

function applyFilters(rows: Weighted[], filters: CompanyFilter): Weighted[] {
  const keys = Object.keys(filters) as (keyof CompanyFilter)[];
  return rows.filter((r) =>
    keys.every((k) => {
      const v = filters[k];
      return v === undefined || matchesOne(r.company, k, v);
    })
  );
}

// weight 降順 + 軽いジッターで上位 n 社。
// seed があれば決定的、無ければ Math.random で毎回シャッフル。
function topWithJitter(rows: Weighted[], n: number, rng: () => number): Company[] {
  return [...rows]
    .map((r) => ({ r, score: r.weight + rng() * 0.9 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.r.company);
}

// フィルタを段階的に緩めながら、最低 want 社を確保して返す。
function selectWithRelax(
  pool: Weighted[],
  filters: CompanyFilter,
  want: number,
  rng: () => number
): Company[] {
  const active: CompanyFilter = { ...filters };
  let filtered = applyFilters(pool, active);

  for (const key of RELAX_ORDER) {
    if (filtered.length >= want) break;
    if (active[key] !== undefined) {
      delete active[key];
      filtered = applyFilters(pool, active);
    }
  }

  // 緩めても足りなければ、タイプ一致の全母数から補充（仕様: まず3社を揃える）。
  const base = filtered.length >= want ? filtered : pool;
  return topWithJitter(base, want, rng);
}

const WANT = 3;

// ---------- Supabase から取得 ----------
async function pickFromSupabase(
  typeCode: string,
  filters: CompanyFilter,
  rng: () => number
): Promise<Company[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  // 承認済み × 該当タイプの企業を、weight 付きで取得（仕様の鉄則: approved のみ）。
  const { data, error } = await supabase
    .from("companies")
    .select("*, company_tags!inner(type_code, weight)")
    .eq("status", "approved")
    .eq("company_tags.type_code", typeCode);

  if (error || !data) return null;

  const pool: Weighted[] = data.map((row: Record<string, unknown>) => {
    const tags = (row.company_tags as { type_code: string; weight: number }[]) ?? [];
    const tag = tags.find((t) => t.type_code === typeCode);
    const { company_tags: _omit, ...company } = row;
    void _omit;
    return { company: company as unknown as Company, weight: tag?.weight ?? 1 };
  });

  return selectWithRelax(pool, filters, WANT, rng);
}

// ---------- ローカル seed から取得 ----------
function pickFromLocal(typeCode: string, filters: CompanyFilter, rng: () => number): Company[] {
  const pool: Weighted[] = LOCAL_COMPANIES.filter(
    (c) => c.status === "approved" && c.tags.some((t) => t.type_code === typeCode)
  ).map((c) => ({
    company: c,
    weight: c.tags.find((t) => t.type_code === typeCode)?.weight ?? 1,
  }));

  return selectWithRelax(pool, filters, WANT, rng);
}

export interface PickResult {
  companies: Company[];
  source: "supabase" | "local";
}

// seed を渡すと結果が決定的になる（結果画面とOGP画像で同じ3社を出すため）。
export async function pickCompanies(
  typeCode: string,
  filters: CompanyFilter,
  seed?: string
): Promise<PickResult> {
  const rng = seed ? makeRng(`${typeCode}:${seed}`) : Math.random;
  const fromDb = await pickFromSupabase(typeCode, filters, rng);
  if (fromDb !== null) {
    return { companies: fromDb, source: "supabase" };
  }
  return { companies: pickFromLocal(typeCode, filters, rng), source: "local" };
}
