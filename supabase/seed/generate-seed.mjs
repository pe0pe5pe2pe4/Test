// ============================================================
// generate-seed.mjs
// src/data/*.json を単一ソースとして Supabase 投入SQLを生成する。
//   - src/data/types.json     -> supabase/migrations/0002_seed_types.sql
//   - src/data/companies.json -> supabase/seed/0003_seed_companies.sql
// 使い方:  node supabase/seed/generate-seed.mjs
// データを更新したら本スクリプトを再実行してSQLを作り直す。
// ============================================================
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const companiesPath = resolve(here, "../../src/data/companies.json");
const typesPath = resolve(here, "../../src/data/types.json");
const companiesOut = resolve(here, "0003_seed_companies.sql");
const typesOut = resolve(here, "../migrations/0002_seed_types.sql");

const q = (v) => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return `'${String(v).replace(/'/g, "''")}'`;
};

// ---------- 0002_seed_types.sql ----------
{
  const { types } = JSON.parse(await readFile(typesPath, "utf8"));
  const L = [];
  L.push("-- ============================================================");
  L.push("-- 0002_seed_types.sql  ※自動生成。手で編集せず src/data/types.json を更新して再生成すること。");
  L.push("-- 仕様書 section 6「毒舌タイプ初期セット」。最初はこの5つで開始。");
  L.push("-- 制約: ディスの対象は架空のタイプのみ。実在の職業・企業はディスらない。");
  L.push('--       "MBTI" 等の公式名称は使わず独自タイプ名のみ（仕様書 section 10）。');
  L.push("-- ============================================================");
  L.push("");
  L.push("insert into types (code, display_name, roast, love_followup, worst_match, worst_match_line, emoji_or_icon)");
  L.push("values");
  const rows = types.map(
    (t) =>
      "  (" +
      [
        q(t.code),
        q(t.display_name),
        q(t.roast),
        q(t.love_followup),
        q(t.worst_match),
        q(t.worst_match_line),
        q(t.emoji_or_icon ?? null),
      ].join(", ") +
      ")"
  );
  L.push(rows.join(",\n"));
  L.push("on conflict (code) do update set");
  L.push("  display_name     = excluded.display_name,");
  L.push("  roast            = excluded.roast,");
  L.push("  love_followup    = excluded.love_followup,");
  L.push("  worst_match      = excluded.worst_match,");
  L.push("  worst_match_line = excluded.worst_match_line,");
  L.push("  emoji_or_icon    = excluded.emoji_or_icon;");
  L.push("");
  await writeFile(typesOut, L.join("\n"), "utf8");
  console.log(`Wrote ${typesOut} (${types.length} types)`);
}

const { companies } = JSON.parse(await readFile(companiesPath, "utf8"));
const outPath = companiesOut;

const lines = [];
lines.push("-- ============================================================");
lines.push("-- 0003_seed_companies.sql  ※自動生成。手で編集せず companies.json を更新して再生成すること。");
lines.push("-- グローバルニッチトップ100選ベースの初期20社（仕様書 section 5 第1層）。");
lines.push("-- status は approved 投入（初期投入分は出典確認済み扱い）。source_origin = 'gnt100'。");
lines.push("-- ============================================================");
lines.push("");

for (const c of companies) {
  lines.push("with ins as (");
  lines.push("  insert into companies");
  lines.push("    (name, familiar_hook, share_highlight, share_source, avg_salary, salary_source,");
  lines.push("     one_liner, product_field, visibility, scale_type, is_listed, location_type,");
  lines.push("     status, source_origin, approved_at)");
  lines.push("  values");
  lines.push(
    "    (" +
      [
        q(c.name),
        q(c.familiar_hook),
        q(c.share_highlight),
        q(c.share_source),
        q(c.avg_salary ?? null),
        q(c.salary_source ?? null),
        q(c.one_liner ?? null),
        q(c.product_field),
        q(c.visibility),
        q(c.scale_type),
        q(c.is_listed ?? true),
        q(c.location_type),
        q("approved"),
        q("gnt100"),
        "now()",
      ].join(", ") +
      ")"
  );
  lines.push("  on conflict do nothing");
  lines.push("  returning id");
  lines.push(")");
  const tagRows = (c.tags || [])
    .map((t) => `  (${q(t.type_code)}, ${q(t.weight ?? 1)})`)
    .join(",\n");
  lines.push("insert into company_tags (company_id, type_code, weight)");
  lines.push("select ins.id, t.type_code, t.weight");
  lines.push("from ins");
  lines.push("cross join (values");
  lines.push(tagRows);
  lines.push(") as t(type_code, weight)");
  lines.push("on conflict (company_id, type_code) do nothing;");
  lines.push("");
}

await writeFile(outPath, lines.join("\n"), "utf8");
console.log(`Wrote ${outPath} (${companies.length} companies)`);
