const EXPECTED_PROJECT_REF = "xtoernoovaaflszdutnj";
const FALLBACK_URL = "https://xtoernoovaaflszdutnj.supabase.co";
const FALLBACK_PUBLISHABLE_KEY = "sb_publishable_m2AqJ9h3LY5G5Ev3HbR08w_1rISukOg";

export function getPublicSupabaseConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();

  const url =
    envUrl && envUrl.includes(EXPECTED_PROJECT_REF)
      ? envUrl
      : FALLBACK_URL;

  const key =
    envKey === FALLBACK_PUBLISHABLE_KEY
      ? envKey
      : FALLBACK_PUBLISHABLE_KEY;

  return { url, key };
}
