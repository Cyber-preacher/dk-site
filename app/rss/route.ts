// app/rss/route.ts
import { getLongFormNoteSummaries } from "@/lib/notes";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-static";

type NoteItem = ReturnType<typeof getLongFormNoteSummaries>[number];

export async function GET() {
  const notes = getLongFormNoteSummaries().slice(0, 50);
  const site = getSiteUrl();

  const items = notes
    .map((n: NoteItem) => {
      const url = `${site}/notes/${n.slug}`;
      return `
  <item>
    <title>${escapeXml(n.title)}</title>
    <link>${url}</link>
    <guid>${url}</guid>
    <description>${escapeXml(n.excerpt || "")}</description>
    ${n.date ? `<pubDate>${new Date(n.date).toUTCString()}</pubDate>` : ""}
  </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Dato — Notes</title>
    <link>${site}</link>
    <description>Public library of thoughts</description>
    ${items}
  </channel>
  </rss>`;

  // Use the Web Response — no need to import from "next/server"
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}

function escapeXml(str: string) {
  return str.replace(/[<>&'"]/g, (c) => {
    const map: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    };
    return map[c];
  });
}
