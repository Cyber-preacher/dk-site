export function getSiteUrl() {
  // Prefer server-side SITE_URL, fallback to NEXT_PUBLIC_SITE_URL for compatibility.
  const raw =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";
  return raw.endsWith("/") ? raw.slice(0, -1) : raw;
}
