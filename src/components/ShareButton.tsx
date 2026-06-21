"use client";

import { useState } from "react";

// 結果をXでシェア。Web Share API があればそれ、無ければX intent にフォールバック。
export function ShareButton({
  shareUrl,
  text,
}: {
  shareUrl: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const nav = typeof navigator !== "undefined" ? navigator : undefined;
    if (nav?.share) {
      try {
        await nav.share({ title: "知らない優良企業診断", text, url: shareUrl });
        return;
      } catch {
        // ユーザーがキャンセルした等。フォールバックへ。
      }
    }
    const intent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  }

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={onShare}
        className="w-full rounded-full bg-ink px-6 py-4 text-center text-base font-bold text-paper shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
      >
        結果をシェアする
      </button>
      <button
        onClick={onCopy}
        className="w-full rounded-full border-2 border-ink/15 px-6 py-3 text-center text-sm font-bold text-ink/70 transition-colors hover:border-ink/30"
      >
        {copied ? "リンクをコピーしました ✓" : "結果リンクをコピー"}
      </button>
    </div>
  );
}
