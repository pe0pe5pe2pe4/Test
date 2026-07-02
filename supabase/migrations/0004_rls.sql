-- ============================================================
-- 0004_rls.sql
-- Row Level Security。anon キーはブラウザに公開されるため、
-- 「診断に必要な読み取り」と「投稿の書き込み」だけを許可する。
-- 管理操作（承認・却下、pending閲覧）は service_role キー（サーバ専用）が
-- RLSをバイパスして行う。
-- ============================================================

alter table companies        enable row level security;
alter table company_tags     enable row level security;
alter table types            enable row level security;
alter table user_submissions enable row level security;

-- 診断は承認済み企業のみ参照できる（仕様の鉄則: approved のみ表に出す）
create policy companies_select_approved
  on companies for select
  to anon, authenticated
  using (status = 'approved');

-- タグは承認済み企業のものだけ見える（結合経由の情報漏れ防止）
create policy company_tags_select_approved
  on company_tags for select
  to anon, authenticated
  using (
    exists (
      select 1 from companies c
      where c.id = company_tags.company_id and c.status = 'approved'
    )
  );

-- 毒舌タイプ定義は全件公開
create policy types_select_all
  on types for select
  to anon, authenticated
  using (true);

-- ユーザー投稿は書き込みのみ（内容の閲覧は管理者=service_roleだけ）
create policy user_submissions_insert_only
  on user_submissions for insert
  to anon, authenticated
  with check (
    status = 'pending'
    and ai_checked = false
    and ai_result is null
  );
