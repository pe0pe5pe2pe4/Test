import type { Metadata } from "next";
import Link from "next/link";
import { CompanyCard } from "@/components/CompanyCard";
import { ShareButton } from "@/components/ShareButton";
import { pillSecondary } from "@/components/ui";
import { SITE_NAME } from "@/lib/brand";
import { resolveResult } from "@/lib/resolve-result";
import { getSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type SearchParams = { a?: string };

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const a = searchParams.a ?? "";
  const { type, companies } = await resolveResult(a);
  if (!type) return { title: "診断結果" };

  const site = getSiteUrl();
  // OG画像は回答文字列 a だけから決定的に再現できる（resolveResult が a をシードに使う）。
  const ogImage = `${site}/api/og?a=${encodeURIComponent(a)}`;
  const title = `私は「${type.display_name}」でした`;
  const description = `刺さる知らない優良企業：${companies
    .map((c) => c.name)
    .join("・")}｜${SITE_NAME}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const a = searchParams.a ?? "";
  const { type, worstType, companies, source } = await resolveResult(a);

  if (!type) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-bold">診断結果を読み込めませんでした。</p>
        <Link href="/diagnosis" className="mt-6 font-bold text-accent underline">
          もう一度診断する
        </Link>
      </main>
    );
  }

  const site = getSiteUrl();
  const shareUrl = a ? `${site}/result?a=${a}` : `${site}/`;
  const shareText = `私は「${type.display_name}」でした。あなたに刺さる${SITE_NAME} ${type.emoji_or_icon ?? ""}`;

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      {/* 結果①②: 毒舌タイプ + 自虐 + 愛のフォロー */}
      <section className="rounded-3xl bg-ink p-8 text-center text-paper shadow-xl">
        <p className="text-xs font-semibold tracking-widest text-paper/60">
          あなたの毒舌タイプ
        </p>
        <div className="mt-4 text-6xl">{type.emoji_or_icon}</div>
        <h1 className="mt-4 text-2xl font-black leading-snug">
          {type.display_name}
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-paper/80">{type.roast}</p>
        <div className="mt-5 rounded-2xl bg-accent/20 px-4 py-3">
          <p className="text-sm font-bold leading-relaxed text-paper">
            {type.love_followup}
          </p>
        </div>
      </section>

      {/* 結果③: 主役の企業3社 */}
      <section className="mt-12">
        <h2 className="text-xl font-black">
          あなたに刺さる「知らない優良企業」
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          世界シェアを握るのに、名前は意外と知られていない会社たち。
        </p>
        <div className="mt-6 space-y-5">
          {companies.length > 0 ? (
            companies.map((c, i) => (
              <CompanyCard key={c.id} company={c} rank={i + 1} />
            ))
          ) : (
            <p className="rounded-2xl border-2 border-dashed border-ink/15 p-6 text-center text-sm text-ink/50">
              条件に合う企業がまだ登録されていません。
            </p>
          )}
        </div>
      </section>

      {/* 結果④: 相性最悪タイプ煽り */}
      {worstType && (
        <section className="mt-12 rounded-2xl border-2 border-accent/30 bg-accent/5 p-5">
          <p className="text-xs font-bold tracking-widest text-accent">
            相性最悪タイプ
          </p>
          <p className="mt-2 text-base font-black">
            {worstType.emoji_or_icon} {worstType.display_name}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">
            {type.worst_match_line}
          </p>
        </section>
      )}

      {/* アクション */}
      <section className="mt-12">
        <ShareButton shareUrl={shareUrl} text={shareText} />
        <div className="mt-4 flex gap-3">
          <Link href="/diagnosis" className={`flex-1 px-4 ${pillSecondary}`}>
            もう一回診断する
          </Link>
          <Link href="/" className={`flex-1 px-4 ${pillSecondary}`}>
            トップへ
          </Link>
        </div>
        <p className="mt-6 text-center text-sm text-ink/60">
          知られてないけど凄い会社、知ってる？{" "}
          <Link href="/submit" className="font-bold text-accent underline underline-offset-2">
            この会社を推す
          </Link>
        </p>
      </section>

      <p className="mt-10 text-center text-[11px] leading-relaxed text-ink/40">
        企業の数字は各社の出典リンク先に基づくサンプル値です。
        {source === "local" && "（Supabase未接続のためローカルデータで表示中）"}
      </p>
    </main>
  );
}
