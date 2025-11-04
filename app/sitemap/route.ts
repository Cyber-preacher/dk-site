import { getAllNotes } from "@/lib/notes";

export const dynamic = "force-static";

// derive the note item type
type NoteItem = ReturnType<typeof getAllNotes>[number];

export async function GET() {
  const site = process.env.SITE_URL || "http://localhost:3000";

  const staticUrls = [
    { loc: `${site}/`, priority: 1.0 },
    { loc: `${site}/notes`, priority: 0.8 },
    { loc: `${site}/about`, priority: 0.5 },
  ];

  const noteUrls = getAllNotes().map((n: NoteItem) => ({
    loc: `${site}/notes/${n.slug}`,
    priority: 0.6,
    lastmod: n.date ? new Date(n.date).toISOString() : undefined,
  }));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...noteUrls]
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

  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
