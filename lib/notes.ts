// lib/notes.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import slugify from "slugify";

export interface Note {
  slug: string;
  title: string;
  date?: string; // normalized to ISO "YYYY-MM-DD"
  tags?: string[];
  links?: string[]; // outgoing slugs
  content: string;
  readingTime?: string;
  excerpt?: string;
  backlinks?: { slug: string; title: string }[];
}

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

function toSlug(input: string) {
  return slugify(input, { lower: true, strict: true });
}

function extractWikiLinks(md: string): string[] {
  const out: string[] = [];
  const re = /\[\[([^\]]+)\]\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md))) {
    const body = m[1];
    const target = body.split("|")[0].trim();
    out.push(target);
  }
  return out;
}

/** Normalize various front-matter date shapes into a compact ISO string (YYYY-MM-DD). */
function normalizeDate(d: unknown): string | undefined {
  if (!d) return undefined;
  const asDate = new Date(d as any);
  if (!Number.isNaN(asDate.getTime())) {
    // return just the date part (no time)
    return asDate.toISOString().slice(0, 10);
  }
  // Last resort if user put a non-parseable string: keep it as-is (won't break rendering).
  if (typeof d === "string" && d.trim()) return d.trim();
  return undefined;
}

export function getAllNotes(): Note[] {
  if (!fs.existsSync(NOTES_DIR)) return [];
  const files = fs.readdirSync(NOTES_DIR).filter((f) => f.endsWith(".md"));

  const raw: Note[] = files.map((file) => {
    const full = path.join(NOTES_DIR, file);
    const rawMd = fs.readFileSync(full, "utf-8");
    const { data, content } = matter(rawMd);

    const title = (data.title as string) || path.basename(file, ".md");
    const slug = (data.slug as string) || toSlug(title);
    const tags = (data.tags as string[] | undefined) ?? [];

    const linksFromFM = (data.links as string[] | undefined) ?? [];
    const linksFromBody = extractWikiLinks(content);
    const links = [...new Set([...linksFromFM, ...linksFromBody])];

    const rt = readingTime(content).text;
    const excerpt =
      (data.excerpt as string | undefined) ||
      content.split("\n").filter(Boolean).slice(0, 3).join(" ");

    return {
      slug,
      title,
      date: normalizeDate(data.date),
      tags,
      links,
      content,
      readingTime: rt,
      excerpt,
    };
  });

  // Map titles to slugs to resolve [[Title]] to actual slug
  const titleToSlug: Record<string, string> = {};
  for (const n of raw) titleToSlug[n.title.toLowerCase()] = n.slug;

  for (const n of raw) {
    n.links = (n.links || [])
      .map((l) => titleToSlug[l.toLowerCase?.() ?? l] || toSlug(l));
  }

  // Build backlinks
  const backlinks: Record<string, { slug: string; title: string }[]> = {};
  for (const n of raw) {
    for (const target of n.links || []) {
      (backlinks[target] ??= []).push({ slug: n.slug, title: n.title });
    }
  }
  for (const n of raw) n.backlinks = backlinks[n.slug] || [];

  // Sort: newest date first (by numeric time), then title
  const t = (d?: string) => (d ? new Date(d).getTime() : 0);
  raw.sort((a, b) => {
    const dt = t(b.date) - t(a.date);
    if (dt !== 0) return dt;
    return a.title.localeCompare(b.title);
  });

  return raw;
}

export function getNoteBySlug(slug: string): Note | null {
  return getAllNotes().find((n) => n.slug === slug) || null;
}

export function getSlugMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const n of getAllNotes()) {
    map[n.title.toLowerCase()] = n.slug;
    map[n.slug.toLowerCase()] = n.slug;
  }
  return map;
}
