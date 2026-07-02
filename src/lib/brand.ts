// アプリ名・ブランドカラー・表記ヘルパーの単一ソース。
// Tailwind テーマ（tailwind.config.ts）と OGP 画像（api/og）の両方がここを参照する。

export const SITE_NAME = "知らない優良企業診断";

export const COLORS = {
  ink: "#1a1a1a",
  paper: "#faf8f4",
  accent: "#ff5a36",
} as const;

// 年収表記（「約1,200万円」）。企業カードとOGP画像で表記を揃える。
export function formatSalary(avgSalary: number): string {
  return `約${avgSalary.toLocaleString("ja-JP")}万円`;
}
