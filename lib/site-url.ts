export function getSiteUrl(){
  const configured=process.env.NEXT_PUBLIC_SITE_URL?.trim();

  const raw=
    configured ||
    (process.env.VERCEL_ENV==="production"
      ? "https://numwan.net"
      : process.env.VERCEL_URL || "http://localhost:3000");

  const normalized=raw.startsWith("http://") || raw.startsWith("https://")
    ? raw
    : "https://"+raw;

  return normalized.replace(/\/$/,"");
}
