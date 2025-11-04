export function getSiteUrl() {
  // Set SITE_URL in prod (e.g., https://dk.example.com)
  return process.env.SITE_URL || "http://localhost:3000";
}
