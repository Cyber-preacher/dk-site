// app/sitemap/route.ts
import { getAllNotes, type Note } from "@/lib/notes";

export async function GET() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const notes = getAllNotes();

  const urls: Array<{ loc: string; priority: number; lastmod?: string }> = [
    { loc: `${site}/`, priority: 1.0 },
    { loc: `${site}/about`, priority: 0.8 },
    { loc: `${site}/notes`, priority: 0.9 },
    ...notes.map((n: Note) => ({
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
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
