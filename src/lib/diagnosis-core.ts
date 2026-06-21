// ============================================================
// 診断エンジン コア実装 / diagnosis-core.ts
// 仕様書 spec.md の section 4 を実際のコードに落としたもの。
// 質問データ・スコア集計・タイプ判定の純粋ロジック（クライアント/サーバ両用）。
// ============================================================

// ---------- 型定義 ----------
export type Axis =
  | "social" | "specialist" | "shosha" | "domestic"
  | "sales" | "tech" | "making" | "high_income" | "stable_life";

export interface CompanyFilter {
  product_field?: "car" | "electronics" | "material" | "food" | "infra";
  visibility?: "product" | "component";
  scale_type?: "niche_top" | "stable";
  location_type?: "urban" | "regional";
}

export interface Choice {
  label: string;                       // 画面に出る選択肢テキスト
  axes: Partial<Record<Axis, number>>; // 加算する軸スコア
  filters?: CompanyFilter;             // 企業抽出に効くフィルタ
}

export interface Question {
  id: string;
  text: string;
  choices: Choice[];
}

// ---------- 質問データ（7問・カジュアル毒舌）----------
export const QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "金曜の夜、上司に飲み誘われたら？",
    choices: [
      { label: "よっしゃ行きます！", axes: { social: 1, sales: 1 } },
      { label: "すいません予定が…（即帰宅）", axes: { specialist: 1, stable_life: 1 } },
    ],
  },
  {
    id: "q2",
    text: "言葉が通じない国に2週間ひとり出張。どう？",
    choices: [
      { label: "楽しそう、行く", axes: { shosha: 2, social: 1 } },
      { label: "無理、日本がいい", axes: { domestic: 1 } },
    ],
  },
  {
    id: "q3",
    text: "仕事で一番テンション上がる瞬間は？",
    choices: [
      { label: "でかい契約を決めた瞬間", axes: { sales: 2 } },
      { label: "難しい問題を解いた瞬間", axes: { tech: 2 } },
      { label: "いい物を作り上げた瞬間", axes: { making: 2 } },
    ],
  },
  {
    id: "q4",
    text: "興味があるのはどっち？",
    choices: [
      { label: "目に見える製品・機械", axes: {}, filters: { visibility: "product" } },
      { label: "目に見えない素材・部品・システム", axes: {}, filters: { visibility: "component" } },
    ],
  },
  {
    id: "q5",
    text: "どっちに惹かれる？",
    choices: [
      { label: "世界シェアを取る尖った会社", axes: {}, filters: { scale_type: "niche_top" } },
      { label: "国内で堅実な会社", axes: { domestic: 1 }, filters: { scale_type: "stable" } },
    ],
  },
  {
    id: "q6",
    text: "究極の二択。",
    choices: [
      { label: "年収1000万・激務", axes: { high_income: 1 } },
      { label: "年収600万・定時帰り", axes: { stable_life: 1 } },
    ],
  },
  {
    id: "q7",
    text: "地方勤務、あり？",
    choices: [
      { label: "都市部がいい", axes: {}, filters: { location_type: "urban" } },
      // 地方OKを選ぶと、地方の優良企業が抽出対象に解禁される
      { label: "地方もOK", axes: {}, filters: { location_type: "regional" } },
    ],
  },
];

// ---------- スコア集計 ----------
export function tallyScores(selected: Choice[]): Record<Axis, number> {
  const base: Record<Axis, number> = {
    social: 0, specialist: 0, shosha: 0, domestic: 0,
    sales: 0, tech: 0, making: 0, high_income: 0, stable_life: 0,
  };
  for (const c of selected) {
    for (const [axis, v] of Object.entries(c.axes)) {
      base[axis as Axis] += v ?? 0;
    }
  }
  return base;
}

// ---------- フィルタ集約 ----------
export function collectFilters(selected: Choice[]): CompanyFilter {
  return selected.reduce<CompanyFilter>((acc, c) => ({ ...acc, ...(c.filters ?? {}) }), {});
}

// ---------- タイプ判定（決定木の簡略版）----------
// 仕様書 section 6 の5タイプに対応
export function decideType(s: Record<Axis, number>): string {
  if (s.sales >= 2 && s.social >= 1) return "loud_sales";              // 商社・営業
  if (s.tech >= 2 && s.specialist >= 1) return "comm_disorder_tech";   // 技術・研究
  if (s.high_income >= 1 && (s.tech >= 1 || s.sales >= 1)) return "money_machine"; // 高収入ハード
  if (s.stable_life >= 1 && s.domestic >= 1) return "clock_out_ghost"; // インフラ・安定
  if (s.making >= 2) return "world_class_hidden";                      // ものづくりニッチトップ
  return "world_class_hidden";                                         // フォールバック
}

// ---------- 全体を束ねるエントリポイント ----------
export interface DiagnosisResult {
  typeCode: string;
  scores: Record<Axis, number>;
  filters: CompanyFilter;
}

export function runDiagnosis(selectedChoices: Choice[]): DiagnosisResult {
  const scores = tallyScores(selectedChoices);
  const filters = collectFilters(selectedChoices);
  const typeCode = decideType(scores);
  return { typeCode, scores, filters };
}

// ---------- 回答エンコード（共有URL用）----------
// 各問の選択インデックスを連結した文字列（例 "0101010"）にする。
export function encodeAnswers(indices: number[]): string {
  return indices.join("");
}

// 文字列を選択インデックス配列に戻し、対応する Choice を引く。
// 不正・長さ不足は無視して取れた分だけ返す（堅牢化）。
export function decodeAnswers(encoded: string | null | undefined): Choice[] {
  if (!encoded) return [];
  const out: Choice[] = [];
  for (let i = 0; i < QUESTIONS.length && i < encoded.length; i++) {
    const idx = Number(encoded[i]);
    const q = QUESTIONS[i];
    if (Number.isInteger(idx) && idx >= 0 && idx < q.choices.length) {
      out.push(q.choices[idx]);
    }
  }
  return out;
}
