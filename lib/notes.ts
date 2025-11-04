// lib/notes.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import slugify from "slugify";

export interface Note {
  slug: string;
  title: string;
  date?: string;
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

export function getAllNotes(): Note[] {
  if (!fs.existsSync(NOTES_DIR)) return [];
  const files = fs.readdirSync(NOTES_DIR).filter(f => f.endsWith(".md"));
  const raw = files.map(file => {
    const full = path.join(NOTES_DIR, file);
    const rawMd = fs.readFileSync(full, "utf-8");
    const { data, content } = matter(rawMd);
    const title = (data.title as string) || path.basename(file, ".md");
    const slug = (data.slug as string) || toSlug(title);
    const tags = (data.tags as string[] | undefined) ?? [];
    const linksFromFrontmatter = (data.links as string[] | undefined) ?? [];
    const linksFromBody = extractWikiLinks(content);
    const links = [...new Set([...linksFromFrontmatter, ...linksFromBody])]
      .map(l => toSlug(l));
    const rt = readingTime(content).text;
    const excerpt =
      (data.excerpt as string | undefined) ||
      content.split("\n").filter(Boolean).slice(0, 3).join(" ");

    return {
      slug,
      title,
      date: data.date as string | undefined,
      tags,
      links,
      content,
      readingTime: rt,
      excerpt,
    } as Note;
  });

  // Map titles to slugs, normalize links
  const titleToSlug: Record<string, string> = {};
  for (const n of raw) titleToSlug[n.title.toLowerCase()] = n.slug;

  for (const n of raw) {
    n.links = (n.links || []).map(l => titleToSlug[l] || l);
  }

  // Backlinks
  const backlinks: Record<string, { slug: string; title: string }[]> = {};
  for (const n of raw) {
    for (const target of n.links || []) {
      (backlinks[target] ??= []).push({ slug: n.slug, title: n.title });
    }
  }
  for (const n of raw) n.backlinks = backlinks[n.slug] || [];

  // Sort newest date first, then title
  raw.sort((a, b) => {
    if (a.date && b.date) return b.date.localeCompare(a.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return a.title.localeCompare(b.title);
  });

  return raw;
}

export function getNoteBySlug(slug: string): Note | null {
  return getAllNotes().find(n => n.slug === slug) || null;
}

export function getSlugMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const n of getAllNotes()) {
    map[n.title.toLowerCase()] = n.slug;
    map[n.slug.toLowerCase()] = n.slug;
  }
  return map;
}
