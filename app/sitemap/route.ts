// app/sitemap/route.ts
import { getLongFormNoteSummaries, type NoteSummary } from "@/lib/notes";
import { getSiteUrl } from "@/lib/site";

export async function GET() {
  const site = getSiteUrl();

  const notes = getLongFormNoteSummaries();

  const urls: Array<{ loc: string; priority: number; lastmod?: string }> = [
    { loc: `${site}/`, priority: 1.0 },
    { loc: `${site}/notes`, priority: 0.9 },
    ...notes.map((n: NoteSummary) => ({
      loc: `${site}/notes/${n.slug}`,
      priority: 0.9,
      lastmod: n.date || undefined,
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `
  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""}
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
