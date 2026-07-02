"use client";

import Link from "next/link";
import { useState } from "react";
import { pillPrimary, pillSecondary } from "@/components/ui";

type Status = "idle" | "sending" | "done" | "error";

// Step 6: ユーザー投稿フォーム。「うちの会社も知られてないけど凄い」を集める群衆ソーシング。
export default function SubmitPage() {
  const [companyName, setCompanyName] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_name: companyName, note }),
      });
      if (res.ok) {
        setStatus("done");
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setMessage(data?.error ?? "送信に失敗しました");
      setStatus("error");
    } catch {
      setMessage("通信に失敗しました");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl">📮</div>
        <h1 className="mt-4 text-2xl font-black">投稿ありがとう！</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/70">
          AIが出典（シェア・年収の裏付け）を探して、
          <br />
          確認が取れた会社だけ診断に登場します。
        </p>
        <Link href="/" className={`mt-10 inline-block px-10 py-4 text-base ${pillPrimary}`}>
          トップへ戻る
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <h1 className="text-2xl font-black leading-snug">
        「この会社、知られてないけど凄い」
        <br />
        を教えてください
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink/60">
        世界シェアを握ってるのに誰も知らない会社、ありますよね。
        出典が確認できた会社だけ、診断に追加されます。
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <label className="block">
          <span className="text-sm font-bold">会社名（必須）</span>
          <input
            type="text"
            required
            maxLength={100}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="例: ○○精機"
            className="mt-2 w-full rounded-xl border-2 border-ink/10 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-accent"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold">推しポイント（任意）</span>
          <textarea
            maxLength={500}
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例: ○○の部品で世界シェア7割らしい。地味だけど給料もいい"
            className="mt-2 w-full rounded-xl border-2 border-ink/10 bg-white px-4 py-3 text-base outline-none transition-colors focus:border-accent"
          />
        </label>

        {status === "error" && (
          <p className="text-sm font-bold text-accent">{message}</p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className={`w-full px-6 py-4 text-base disabled:opacity-50 ${pillPrimary}`}
        >
          {status === "sending" ? "送信中…" : "この会社を推す"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/" className={`inline-block px-8 ${pillSecondary}`}>
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
