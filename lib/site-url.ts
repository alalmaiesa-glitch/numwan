export function getSiteUrl(){
  const raw=
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000";

  const normalized=raw.startsWith("http://") || raw.startsWith("https://")
    ? raw
    : "https://"+raw;

  return normalized.replace(/\/$/,"");
}
