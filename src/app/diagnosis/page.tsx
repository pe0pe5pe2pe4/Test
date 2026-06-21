"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QUESTIONS, encodeAnswers } from "@/lib/diagnosis-core";

export default function DiagnosisPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const question = QUESTIONS[step];
  const total = QUESTIONS.length;
  const progress = Math.round((step / total) * 100);

  function choose(choiceIndex: number) {
    const next = [...answers.slice(0, step), choiceIndex];
    if (step + 1 >= total) {
      router.push(`/result?a=${encodeAnswers(next)}`);
      return;
    }
    setAnswers(next);
    setStep(step + 1);
  }

  function back() {
    if (step === 0) {
      router.push("/");
      return;
    }
    setStep(step - 1);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col px-6 py-10">
      {/* 進捗バー */}
      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-ink/50">
        <button onClick={back} className="hover:text-ink">
          ← 戻る
        </button>
        <span>
          Q{step + 1} / {total}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
        <div
          className="h-full rounded-full bg-accent transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 質問 */}
      <div className="mt-12 flex flex-1 flex-col">
        <h2 className="text-2xl font-black leading-snug sm:text-3xl">
          {question.text}
        </h2>

        <div className="mt-10 space-y-4">
          {question.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => choose(i)}
              className="block w-full rounded-2xl border-2 border-ink/10 bg-white px-6 py-5 text-left text-lg font-bold shadow-sm transition-all hover:border-accent hover:bg-accent/5 active:scale-[0.99]"
            >
              {choice.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-10 text-center text-xs text-ink/40">
        直感でサクッと。深く考えなくて大丈夫。
      </p>
    </main>
  );
}
