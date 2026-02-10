// lib/notes.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import slugify from "slugify";

export type NoteType = "note" | "article" | "essay";

export interface Note {
  slug: string;
  title: string;
  date?: string; // normalized to ISO "YYYY-MM-DD"
  tags?: string[];
  links?: string[]; // outgoing slugs
  content: string;
  readingTime?: string;
  excerpt?: string;
  type: NoteType;
  hasPage: boolean;
  backlinks?: { slug: string; title: string }[];
}

export interface NoteSummary {
  slug: string;
  title: string;
  date?: string;
  tags?: string[];
  readingTime?: string;
  excerpt?: string;
  type: NoteType;
  hasPage: boolean;
  searchText: string;
}

const NOTES_DIR = path.join(process.cwd(), "content", "notes");

type ParsedRecord = {
  slug: string;
  title: string;
  date?: string;
  tags: string[];
  links: string[];
  content: string;
  readingTime: string;
  excerpt?: string;
  type: NoteType;
  hasPage: boolean;
};

type NotesIndex = {
  notes: Note[];
  summaries: NoteSummary[];
  bySlug: Map<string, Note>;
  summaryBySlug: Map<string, NoteSummary>;
  slugMap: Record<string, string>;
};

let cachedIndex: NotesIndex | null = null;
let cachedKey = "";

function toSlug(input: string) {
  return slugify(input, { lower: true, strict: true });
}

function normalizeType(raw: unknown, content: string): NoteType {
  if (typeof raw === "string") {
    const value = raw.trim().toLowerCase();
    if (value === "essay") return "essay";
    if (value === "article" || value === "post" || value === "long")
      return "article";
    if (value === "note" || value === "idea" || value === "short")
      return "note";
  }

  const words = content.split(/\s+/).filter(Boolean).length;
  return words >= 280 ? "article" : "note";
}

export function isLongForm(note: Pick<Note, "type">): boolean {
  return note.type === "article" || note.type === "essay";
}

function getFileEntries(): Array<{
  file: string;
  fullPath: string;
  mtimeMs: number;
  size: number;
}> {
  if (!fs.existsSync(NOTES_DIR)) return [];

  return fs
    .readdirSync(NOTES_DIR)
    .filter((file) => file.endsWith(".md"))
    .sort()
    .map((file) => {
      const fullPath = path.join(NOTES_DIR, file);
      const stat = fs.statSync(fullPath);
      return { file, fullPath, mtimeMs: stat.mtimeMs, size: stat.size };
    });
}

function computeCacheKey(
  entries: Array<{ file: string; mtimeMs: number; size: number }>,
): string {
  return entries.map((e) => `${e.file}:${e.mtimeMs}:${e.size}`).join("|");
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

function buildIndex(
  entries: Array<{ file: string; fullPath: string }>,
): NotesIndex {
  const raw: ParsedRecord[] = entries.map(({ file, fullPath }) => {
    const rawMd = fs.readFileSync(fullPath, "utf-8");
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
    const type = normalizeType(data.type, content);

    return {
      slug,
      title,
      date: normalizeDate(data.date),
      tags,
      links,
      content,
      readingTime: rt,
      excerpt,
      type,
      hasPage: isLongForm({ type } as Pick<Note, "type">),
    };
  });

  // Map titles to slugs to resolve [[Title]] references
  const titleToSlug: Record<string, string> = {};
  for (const n of raw) titleToSlug[n.title.toLowerCase()] = n.slug;

  for (const n of raw) {
    n.links = (n.links || []).map(
      (l) => titleToSlug[l.toLowerCase?.() ?? l] || toSlug(l),
    );
  }

  // Build backlinks from resolved outgoing links
  const backlinks: Record<string, { slug: string; title: string }[]> = {};
  for (const n of raw) {
    for (const target of n.links || []) {
      (backlinks[target] ??= []).push({ slug: n.slug, title: n.title });
    }
  }

  // Sort: newest date first, then title
  const t = (d?: string) => (d ? new Date(d).getTime() : 0);
  raw.sort((a, b) => {
    const dt = t(b.date) - t(a.date);
    if (dt !== 0) return dt;
    return a.title.localeCompare(b.title);
  });

  const notes: Note[] = raw.map((n) => ({
    ...n,
    backlinks: backlinks[n.slug] || [],
  }));

  const summaries: NoteSummary[] = notes.map((n) => ({
    slug: n.slug,
    title: n.title,
    date: n.date,
    tags: n.tags,
    readingTime: n.readingTime,
    excerpt: n.excerpt,
    type: n.type,
    hasPage: n.hasPage,
    searchText: [
      n.title,
      n.excerpt || "",
      (n.tags || []).join(" "),
      // Keep a compact body slice for list search, without carrying full content in list UIs.
      n.content.slice(0, 1200),
    ]
      .join("\n")
      .toLowerCase(),
  }));

  const bySlug = new Map<string, Note>();
  const summaryBySlug = new Map<string, NoteSummary>();
  const slugMap: Record<string, string> = {};

  for (const n of notes) {
    bySlug.set(n.slug, n);
    slugMap[n.title.toLowerCase()] = n.slug;
    slugMap[n.slug.toLowerCase()] = n.slug;
  }

  for (const s of summaries) summaryBySlug.set(s.slug, s);

  return { notes, summaries, bySlug, summaryBySlug, slugMap };
}

function getIndex(): NotesIndex {
  const entries = getFileEntries();
  const key = computeCacheKey(entries);

  if (cachedIndex && key === cachedKey) {
    return cachedIndex;
  }

  cachedIndex = buildIndex(entries);
  cachedKey = key;
  return cachedIndex;
}

function cloneNote(note: Note): Note {
  return {
    ...note,
    tags: note.tags ? [...note.tags] : [],
    links: note.links ? [...note.links] : [],
    backlinks: note.backlinks ? note.backlinks.map((b) => ({ ...b })) : [],
  };
}

function cloneSummary(summary: NoteSummary): NoteSummary {
  return {
    ...summary,
    tags: summary.tags ? [...summary.tags] : [],
  };
}

export function getAllNotes(): Note[] {
  return getIndex().notes.map(cloneNote);
}

export function getAllNoteSummaries(): NoteSummary[] {
  return getIndex().summaries.map(cloneSummary);
}

export function getLongFormNoteSummaries(): NoteSummary[] {
  return getIndex()
    .summaries.filter((n) => isLongForm(n))
    .map(cloneSummary);
}

export function getNoteBySlug(slug: string): Note | null {
  const note = getIndex().bySlug.get(slug);
  return note ? cloneNote(note) : null;
}

export function getNoteSummaryBySlug(slug: string): NoteSummary | null {
  const summary = getIndex().summaryBySlug.get(slug);
  return summary ? cloneSummary(summary) : null;
}

export function getSlugMap(): Record<string, string> {
  return { ...getIndex().slugMap };
}
