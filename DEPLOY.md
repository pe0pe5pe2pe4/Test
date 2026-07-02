# デプロイ手順（Step 9）

Supabase（DB）→ Vercel（アプリ）→ Edge Function（自動収集）の順に設定する。
所要 30 分程度。アカウント操作が必要な箇所は人間の作業。

## 1. Supabase プロジェクト作成

1. https://supabase.com → New project（リージョンは Tokyo 推奨）
2. ダッシュボード → SQL Editor で以下を **この順に** 実行:
   1. `supabase/migrations/0001_init_schema.sql` … テーブル定義
   2. `supabase/migrations/0002_seed_types.sql` … 毒舌タイプ5種
   3. `supabase/seed/0003_seed_companies.sql` … 初期20社（承認済み）
   4. `supabase/migrations/0004_rls.sql` … ★RLS。**公開前に必ず実行**
3. Settings → API から控える:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` キー → `SUPABASE_SERVICE_ROLE_KEY`（**秘密**）

## 2. Vercel デプロイ

1. https://vercel.com → Add New → Project → この GitHub リポジトリを Import
   （Framework は Next.js が自動検出される。ビルド設定は変更不要）
2. Environment Variables に設定:

   | 変数 | 値 |
   |------|-----|
   | `NEXT_PUBLIC_SUPABASE_URL` | 手順1のURL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anonキー |
   | `SUPABASE_SERVICE_ROLE_KEY` | service_roleキー |
   | `ADMIN_TOKEN` | `openssl rand -hex 24` などで生成した長いランダム値 |
   | `NEXT_PUBLIC_SITE_URL` | `https://<プロジェクト名>.vercel.app`（独自ドメインならそれ） |

3. Deploy。完了後に動作確認:
   - `/` → 診断できるか
   - `/result?a=0011010` → 企業3社と出典リンクが出るか
   - `/api/og?a=0011010` → シェア画像が出るか（日本語表示を確認）
   - `/admin?token=<ADMIN_TOKEN>` → 承認画面が開くか
   - X の [Card Validator](https://cards-dev.twitter.com/validator) で結果URLのOGP表示を確認

## 3. Edge Function（AI自動収集、Step 7）

ローカルに [Supabase CLI](https://supabase.com/docs/guides/cli) を入れて:

```bash
supabase login
supabase link --project-ref <プロジェクトref>   # URLのサブドメイン部分

# Claude API キーを登録（https://console.anthropic.com で取得）
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# デプロイ
supabase functions deploy collect-companies
```

手動テスト実行:

```bash
curl -X POST "https://<プロジェクトref>.supabase.co/functions/v1/collect-companies" \
  -H "Authorization: Bearer <anonキー>"
```

実行後に `/admin?token=…` を開くと、出典フィルタを通った候補が
「承認待ち」に並ぶ（承認するまで診断には出ない）。

### 週1回の自動実行（cron）

SQL Editor で（`<プロジェクトref>` と `<anonキー>` を置換）:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'collect-companies-weekly',
  '0 21 * * 0',  -- 毎週月曜 6:00 JST (= 日曜 21:00 UTC)
  $$
  select net.http_post(
    url := 'https://<プロジェクトref>.supabase.co/functions/v1/collect-companies',
    headers := '{"Authorization": "Bearer <anonキー>"}'::jsonb
  );
  $$
);
```

## 4. 運用ループ（あなたの手作業は承認クリックだけ）

1. 週1で Edge Function が候補を集め、出典の無い数字は自動破棄
2. `/admin?token=…` で出典リンクを開いて事実確認 → ✅承認 / 🗑却下
3. 承認した企業だけが診断に登場する
4. ユーザー投稿（`/submit`）も同じ画面に流れてくる

## トラブルシューティング

- **OGP画像が文字化け/豆腐**: 初回リクエストで Google Fonts から TTF を取得している。
  Vercel の関数リージョンからの外部fetchが失敗している場合はリトライで直ることが多い
- **企業が3社出ない**: 承認済み（approved）の企業が該当タイプに足りない。
  `/admin` で承認数を増やすか、`src/data/companies.json` にタグを追加して再投入
- **`/admin` が401**: URLの `?token=` と Vercel の `ADMIN_TOKEN` の一致を確認
