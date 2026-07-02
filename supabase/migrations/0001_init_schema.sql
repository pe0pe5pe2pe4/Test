-- ============================================================
-- 0001_init_schema.sql
-- 仕様書 section 3 「データベース設計」に対応。
-- companies / company_tags / types / user_submissions の4テーブル。
-- ============================================================

-- ---------- 3-1. companies（企業マスタ）----------
create table if not exists companies (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,                        -- 会社名
  familiar_hook   text not null,                        -- 身近な接点「駅で毎日見るアレ」
  share_highlight text not null,                        -- シェアの目玉「ホームドア国内95%」
  share_source    text not null,                        -- ★シェアの出典URL（必須）
  avg_salary      integer,                              -- 平均年収（万円）
  salary_source   text,                                 -- ★年収の出典URL（有報など）
  one_liner       text,                                 -- 一言キャッチ
  product_field   text not null,                        -- car / electronics / material / food / infra
  visibility      text not null,                        -- product（完成品）/ component（部品素材）
  scale_type      text not null,                        -- niche_top（尖り）/ stable（堅実）
  is_listed       boolean default true,                 -- 上場 / 非上場
  location_type   text not null,                        -- urban / regional
  status          text not null default 'pending',      -- pending / approved / rejected
  source_origin   text,                                 -- 'gnt100'（国の選定）/ 'ai_batch' / 'user'
  created_at      timestamptz default now(),
  approved_at     timestamptz,
  -- 鉄則: DBに入る数字は全て出典付き。出典なしの数字は破棄（仕様書 section 10）。
  constraint share_needs_source check (share_highlight = '' or share_source <> ''),
  constraint salary_needs_source check (avg_salary is null or salary_source is not null)
);

-- 承認済みだけ診断に使う（仕様書の鉄則）
create index if not exists idx_companies_approved
  on companies(status) where status = 'approved';

-- ---------- 3-2. company_tags（タイプ適性の紐付け：多対多）----------
create table if not exists company_tags (
  company_id uuid references companies(id) on delete cascade,
  type_code  text not null,                             -- 後述のタイプコード（例 'loud_sales'）
  weight     integer not null default 1,                -- そのタイプへの適性の強さ 1-3
  primary key (company_id, type_code),
  constraint weight_range check (weight between 1 and 3)
);

create index if not exists idx_company_tags_type on company_tags(type_code);

-- ---------- 3-3. types（毒舌タイプ定義）----------
create table if not exists types (
  code             text primary key,                    -- 'loud_sales'
  display_name     text not null,                       -- 「声のデカさとノリだけで内定勝ち取った人」
  roast            text not null,                        -- 自虐解説（ディス）
  love_followup    text not null,                        -- 愛のフォロー1行
  worst_match      text not null,                        -- 相性最悪タイプのcode
  worst_match_line text not null,                        -- 煽り文
  emoji_or_icon    text                                  -- 結果画面のビジュアル
);

-- ---------- 3-4. user_submissions（ユーザー投稿企業）----------
create table if not exists user_submissions (
  id           uuid primary key default gen_random_uuid(),
  company_name text not null,
  note         text,                                     -- 投稿者コメント
  ai_checked   boolean default false,                    -- AIが出典チェック済みか
  ai_result    jsonb,                                    -- AIが見つけた出典・タグ案
  status       text default 'pending',
  created_at   timestamptz default now()
);
