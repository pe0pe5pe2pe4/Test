import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <p className="mb-4 text-sm font-semibold tracking-widest text-accent">
        毒舌キャリア診断
      </p>
      <h1 className="text-3xl font-black leading-tight sm:text-4xl">
        知らない優良企業診断
      </h1>
      <p className="mt-6 text-base leading-relaxed text-ink/70">
        毒舌な7つの質問に答えるだけ。
        <br />
        あなたに刺さる「知らない優良企業」を3社、見つけ出します。
      </p>

      <Link
        href="/diagnosis"
        className="mt-10 inline-flex items-center justify-center rounded-full bg-ink px-10 py-4 text-lg font-bold text-paper shadow-lg transition-transform hover:scale-[1.03] active:scale-95"
      >
        診断スタート（約30秒）
      </Link>

      <ul className="mt-12 space-y-2 text-left text-sm text-ink/60">
        <li>・全国に名前は知られてなくても、世界シェアを握る会社が主役</li>
        <li>・年収やシェアの数字は、すべて出典付きのものだけ</li>
        <li>・最後に毒舌タイプとシェア画像が出ます</li>
      </ul>
    </main>
  );
}
