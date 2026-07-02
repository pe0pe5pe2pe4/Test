"use client";

import { useState } from "react";
import { SITE_NAME } from "@/lib/brand";
import { pillPrimary, pillSecondary } from "@/components/ui";

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
    if (navigator.share) {
      try {
        await navigator.share({ title: SITE_NAME, text, url: shareUrl });
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
      <button onClick={onShare} className={`w-full px-6 py-4 text-base ${pillPrimary}`}>
        結果をシェアする
      </button>
      <button onClick={onCopy} className={`w-full px-6 ${pillSecondary}`}>
        {copied ? "リンクをコピーしました ✓" : "結果リンクをコピー"}
      </button>
    </div>
  );
}
