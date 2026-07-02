import type { Company } from "@/lib/types";
import { formatSalary } from "@/lib/brand";

// 企業カード（結果画面の主役）。
// 仕様の鉄則: 数字には必ず出典リンクを添える（出典なしは表示しない）。
export function CompanyCard({ company, rank }: { company: Company; rank: number }) {
  return (
    <article className="rounded-2xl border-2 border-ink/10 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-black text-white">
          {rank}
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-black leading-tight">{company.name}</h3>
          {company.one_liner && (
            <p className="mt-0.5 text-sm text-ink/60">{company.one_liner}</p>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-ink/80">
        <span className="font-bold text-ink">身近な接点：</span>
        {company.familiar_hook}
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-paper p-3">
          <p className="text-xs font-bold text-ink/50">シェアの目玉</p>
          <p className="mt-1 text-sm font-semibold leading-snug">
            {company.share_highlight}
          </p>
          <SourceLink href={company.share_source} />
        </div>

        <div className="rounded-xl bg-paper p-3">
          <p className="text-xs font-bold text-ink/50">平均年収</p>
          {company.avg_salary != null ? (
            <>
              <p className="mt-1 text-sm font-semibold">
                {formatSalary(company.avg_salary)}
              </p>
              {company.salary_source && <SourceLink href={company.salary_source} />}
            </>
          ) : (
            <p className="mt-1 text-sm text-ink/40">非公開</p>
          )}
        </div>
      </div>
    </article>
  );
}

function SourceLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 inline-block text-xs font-semibold text-accent underline underline-offset-2"
    >
      出典 ↗
    </a>
  );
}
