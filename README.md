# 知らない優良企業診断（MVP / Step 1〜5）

毒舌な7つの質問に答えると、あなたに刺さる「知らない優良企業」3社に出会える診断アプリ。
仕様書 `spec.md` と `diagnosis-core.ts` に沿って、**実装の順序 Step 1〜5**（＝「触ってバズるか試せる」MVPの線引き）までを実装したもの。

> このアプリの核：**主役は企業との出会い**。毒舌タイプは入口（バズの装置）。
> 年収・シェアの数字は**必ず出典付き**で、出典のないデータはDBに入れない。

## 実装済み（Step 1〜5）

| Step | 内容 | 場所 |
|------|------|------|
| 1 | Supabaseスキーマ（companies / company_tags / types / user_submissions）＋ 毒舌タイプ5種の初期投入 | `supabase/migrations/` |
| 2 | グローバルニッチトップ100選ベースの初期20社を投入 | `src/data/companies.json` → `supabase/seed/0003_seed_companies.sql` |
| 3 | 診断フロント（質問7問 → スコアリング → タイプ判定 → 企業3社抽出） | `src/app/diagnosis/`, `src/lib/` |
| 4 | 結果画面（毒舌タイプ表示・自虐・愛のフォロー・企業カード・相性最悪タイプ煽り） | `src/app/result/`, `src/components/` |
| 5 | シェア画像（動的OGP / `next/og`） | `src/app/api/og/route.tsx` |

Step 6〜9（ユーザー投稿フォーム・AI自動収集バッチ・承認画面・Vercelデプロイ）はMVP対象外で未実装。
スキーマ（`user_submissions` 等）は将来の Step 6〜8 を見越して用意済み。

## 技術スタック（仕様書 section 2）

- Next.js 14（App Router）+ TypeScript
- Tailwind CSS
- Supabase（PostgreSQL）
- 動的OGP生成：`next/og`（`@vercel/og` 相当）
- ホスティング想定：Vercel

## セットアップ

```bash
npm install
cp .env.example .env.local   # 値は任意（未設定でもローカルデータで動く）
npm run dev                  # http://localhost:3000
```

**Supabase なしでも動く**：環境変数が未設定の場合は `src/data/*.json` を
フォールバックデータとして使い、診断〜結果〜シェア画像まで一通り動作する
（仕様書のMVP線引き「まず触れる状態」を満たすため）。

### Supabase に接続する場合（Step 1 の実体）

1. Supabase プロジェクトを作成
2. SQL を順に実行（SQL Editor か `supabase db` で）
   - `supabase/migrations/0001_init_schema.sql`
   - `supabase/migrations/0002_seed_types.sql`
   - `supabase/seed/0003_seed_companies.sql`
3. `.env.local` に接続情報を設定

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://your-domain   # OGP絶対URL用（任意）
```

環境変数があれば `companies` / `types` は Supabase から取得し、
診断には **`status = 'approved'` の企業のみ**を使う（仕様の鉄則）。

## データの単一ソース

企業・タイプのマスタは `src/data/*.json` を**唯一の正**として管理する。
編集後はジェネレーターでSQLを作り直す：

```bash
node supabase/seed/generate-seed.mjs
# -> supabase/migrations/0002_seed_types.sql   （types.json から）
# -> supabase/seed/0003_seed_companies.sql      （companies.json から）
```

これによりアプリのフォールバックデータとDB投入SQLが常に一致する。

> 初期20社の年収・シェアは出典URL（各社IR等）付きのサンプル値。
> 本番運用では Step 8 の承認フローで出典を確認してから `approved` にする想定。

## 診断ロジック（仕様書 section 4 / `diagnosis-core.ts`）

7問の回答 → 軸スコア集計 → 決定木でタイプ判定。各問のフィルタ
（visibility / scale_type / location_type）で企業を絞り込み、`company_tags.weight`
降順＋ジッターで上位3社を抽出。**3社に満たない場合はフィルタを1つずつ緩めて母数を確保**
（`src/lib/pick-companies.ts`）。

結果画面とOGP画像で同じ3社が出るよう、抽出のジッターは回答文字列をシードに**決定的**にしている。

## 仕様書 section 10「絶対に守る制約」への対応

- **企業が主役・タイプは入口** → 結果画面は企業3社を主役に配置、タイプは入口の演出
- **数字は全て出典付き** → 企業カードは年収・シェアに出典リンクを併記。DB制約でも担保（`0001_init_schema.sql` の CHECK）
- **毒舌の後に愛のフォロー** → 各タイプに `love_followup` を必須化、結果画面で必ず表示
- **ディス対象は架空のタイプのみ** → 実在の職業・企業名はディスらない文面
- **"MBTI"等の公式名称は不使用** → 独自タイプ名のみ

## ディレクトリ構成

```
src/
  app/
    page.tsx              トップ（診断スタート）
    diagnosis/page.tsx    質問7問（クライアント）
    result/page.tsx       結果画面（サーバ／OGPメタデータ生成）
    api/og/route.tsx      シェア画像（動的OGP）
  components/
    CompanyCard.tsx       企業カード（出典リンク付き）
    ShareButton.tsx       Xシェア／リンクコピー
  lib/
    diagnosis-core.ts     仕様の診断コア（質問・採点・判定）＋ 回答エンコード
    pick-companies.ts     企業抽出（フィルタ緩和・決定的ジッター）
    resolve-result.ts     回答→タイプ・企業・相性をまとめて解決
    get-type.ts           タイプ取得（Supabase or ローカル）
    supabase.ts           クライアント（未設定なら null）
    local-data.ts         フォールバックデータ整形
    site-url.ts           絶対URL解決
    types.ts              ドメイン型
  data/
    companies.json        初期20社（単一ソース）
    types.json            毒舌タイプ5種（単一ソース）
supabase/
  migrations/             スキーマ＋タイプ投入SQL
  seed/                   企業投入SQL＋ジェネレーター
```
