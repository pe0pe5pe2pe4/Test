import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: SITE_NAME,
  description:
    "毒舌な7つの質問に答えると、あなたに刺さる「知らない優良企業」に出会える診断アプリ。",
  openGraph: {
    title: SITE_NAME,
    description: "毒舌診断であなたに刺さる知らない優良企業に出会おう。",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="font-sans">{children}</body>
    </html>
  );
}
