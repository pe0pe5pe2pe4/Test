import { headers } from "next/headers";

// 絶対URL（OGP画像やシェアURLに使う）を解決する。
// 優先: NEXT_PUBLIC_SITE_URL → リクエストの host ヘッダ → localhost。
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  try {
    const h = headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host) {
      const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
      return `${proto}://${host}`;
    }
  } catch {
    // headers() が使えない文脈（ビルド時など）はフォールバック。
  }
  return "http://localhost:3000";
}
