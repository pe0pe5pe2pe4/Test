import { ImageResponse } from "next/og";
import { COLORS, SITE_NAME, formatSalary } from "@/lib/brand";
import { resolveResult } from "@/lib/resolve-result";

// 仕様書 section 7「シェア画像（バズの起爆装置）」。
// 画像に必ず入れる: 毒舌タイプ名・自虐一言・企業名と年収（数字）・アプリ名。
export const runtime = "nodejs";

const WIDTH = 1200;
const HEIGHT = 630;

// 日本語フォントを Google Fonts から取得。
// satori が読めるのは ttf/otf（woff2 不可）。css2 を text 指定なし・標準UAで叩くと
// gstatic の静的 .ttf URL が返るので、それを取得する（/l/font サブセットは非対応形式）。
// 全文字を含む完全版TTFのため、起動後1回だけ取得してメモリにキャッシュする。
let fontCache: Promise<ArrayBuffer | null> | null = null;

function loadJpFont(): Promise<ArrayBuffer | null> {
  if (!fontCache) {
    fontCache = (async () => {
      try {
        const css = await (
          await fetch("https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700")
        ).text();
        const url = css.match(/url\((https:\/\/[^)]+\.(?:ttf|otf))\)/)?.[1];
        if (!url) return null;
        return await (await fetch(url)).arrayBuffer();
      } catch {
        return null;
      }
    })();
  }
  return fontCache;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const a = searchParams.get("a") ?? "";

  const { type, companies } = await resolveResult(a);

  const clamp = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  const typeName = type?.display_name ?? SITE_NAME;
  const roast = clamp(type?.roast ?? "毒舌診断で、知らない優良企業に出会おう。", 40);
  const emoji = type?.emoji_or_icon ?? "🏢";
  const top = companies[0];
  const companyLine = top
    ? top.avg_salary != null
      ? `${top.name}（平均年収 ${formatSalary(top.avg_salary)}）`
      : top.name
    : "";
  const otherNames = companies.slice(1).map((c) => c.name).join("・");

  const font = await loadJpFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: COLORS.ink,
          color: COLORS.paper,
          padding: "64px 72px",
          fontFamily: font ? "NotoJP" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: COLORS.accent, fontWeight: 700 }}>
          {SITE_NAME}
        </div>

        <div style={{ display: "flex", alignItems: "center", marginTop: 28 }}>
          <div style={{ fontSize: 96, marginRight: 24 }}>{emoji}</div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: COLORS.paper,
              opacity: 0.7,
            }}
          >
            あなたの毒舌タイプ
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.25,
            marginTop: 12,
          }}
        >
          {typeName}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 26,
            lineHeight: 1.45,
            color: COLORS.paper,
            opacity: 0.8,
            marginTop: 18,
            maxWidth: 1056,
          }}
        >
          {roast}
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div style={{ display: "flex", fontSize: 24, color: COLORS.accent, fontWeight: 700 }}>
            あなたに刺さる知らない優良企業
          </div>
          {companyLine && (
            <div style={{ display: "flex", fontSize: 36, fontWeight: 700, marginTop: 10 }}>
              {companyLine}
            </div>
          )}
          {otherNames && (
            <div style={{ display: "flex", fontSize: 26, opacity: 0.75, marginTop: 8 }}>
              ほか {otherNames}
            </div>
          )}
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: font
        ? [{ name: "NotoJP", data: font, weight: 700, style: "normal" }]
        : undefined,
    }
  );
}
