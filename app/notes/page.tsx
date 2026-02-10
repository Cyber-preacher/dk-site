// app/notes/page.tsx
import Link from "next/link";
import NoteCard from "@/components/NoteCard";
import { getAllNotes, isLongForm } from "@/lib/notes";
import type { Metadata, Route } from "next";

export const metadata: Metadata = { title: "Notes — Zettelkasten" };

type NoteItem = ReturnType<typeof getAllNotes>[number];
type SearchParams = {
  q?: string | string[];
  tag?: string | string[];
};

function toTagList(raw: string | string[] | undefined): string[] {
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const out: string[] = [];

  for (const value of values) {
    for (const part of value.split(",")) {
      const tag = part.trim();
      if (tag) out.push(tag);
    }
  }

  return [...new Set(out)];
}

function buildNotesHref(q: string, tags: string[]): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  for (const tag of tags) params.append("tag", tag);
  const qs = params.toString();
  return qs ? `/notes?${qs}` : "/notes";
}

export default async function NotesPage({
  // Next 15: searchParams is async — must be awaited
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const qRaw = (sp.q ?? "") as string | string[];
  const tagRaw = sp.tag as string | string[] | undefined;
  const q = (Array.isArray(qRaw) ? qRaw[0] : qRaw).trim();
  const selectedTags = toTagList(tagRaw);
  const selectedTagsLower = selectedTags.map((t) => t.toLowerCase());

  const notes = getAllNotes();

  // Tag counts
  const tagCounts = new Map<string, number>();
  for (const n of notes) {
    for (const t of n.tags || []) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }
  const tagsSorted: Array<[string, number]> = Array.from(
    tagCounts.entries(),
  ).sort((a: [string, number], b: [string, number]) => b[1] - a[1]);

  const ql = q.toLowerCase();

  const filtered: NoteItem[] = notes.filter((n: NoteItem) => {
    const matchesQ =
      !ql ||
      n.title.toLowerCase().includes(ql) ||
      (n.excerpt?.toLowerCase().includes(ql) ?? false) ||
      n.content.toLowerCase().includes(ql);

    const matchesTag =
      selectedTagsLower.length === 0 ||
      selectedTagsLower.every((selectedTag: string) =>
        (n.tags || []).some((t: string) => t.toLowerCase() === selectedTag),
      );

    return matchesQ && matchesTag;
  });
  const longPosts = filtered.filter((n: NoteItem) => isLongForm(n));
  const shortNotes = filtered.filter((n: NoteItem) => !isLongForm(n));

  return (
    <div>
      <h1 className="text-5xl leading-none">Notes</h1>

      {/* Search form (GET) */}
      <form
        method="get"
        action="/notes"
        className="cp-panel mt-6 flex flex-wrap items-center gap-3 p-4"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search title, excerpt, body…"
          className="cp-input w-full px-3 py-2 md:w-96"
        />
        {/* preserve selected tags when searching */}
        {selectedTags.map((selectedTag: string) => (
          <input
            key={selectedTag}
            type="hidden"
            name="tag"
            value={selectedTag}
          />
        ))}
        <button type="submit" className="cp-btn px-3 py-2">
          Search
        </button>
        {(q || selectedTags.length > 0) && (
          <Link href="/notes" className="cp-btn-ghost px-3 py-2">
            Clear
          </Link>
        )}
      </form>

      {/* Tags cloud */}
      {tagsSorted.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tagsSorted.map(([t, count]: [string, number]) => {
            const tl = t.toLowerCase();
            const active = selectedTagsLower.includes(tl);
            const nextTags = active
              ? selectedTags.filter(
                  (selectedTag: string) => selectedTag.toLowerCase() !== tl,
                )
              : [...selectedTags, t];
            const href = buildNotesHref(q, nextTags);
            return (
              <Link
                key={t}
                href={href as Route}
                className={`${active ? "cp-chip-active" : "cp-chip"} px-3 py-1`}
              >
                #{t} <span className="opacity-60">({count})</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Long posts */}
      <section className="mt-8">
        <p className="cp-kicker">Long Posts</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {longPosts.map((n: NoteItem) => (
            <NoteCard
              key={n.slug}
              note={{
                slug: n.slug,
                title: n.title,
                date: n.date,
                tags: n.tags,
                readingTime: n.readingTime,
                excerpt: n.excerpt,
                type: n.type,
                hasPage: n.hasPage,
              }}
            />
          ))}
          {longPosts.length === 0 && (
            <p className="cp-subtitle col-span-full text-sm">
              No long posts matched this filter. Mark a note with{" "}
              <code>type: "article"</code> or <code>type: "essay"</code> to
              enable a dedicated page.
            </p>
          )}
        </div>
      </section>

      {/* Short notes */}
      <section className="mt-10">
        <p className="cp-kicker">Short Notes</p>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          {shortNotes.map((n: NoteItem) => (
            <NoteCard
              key={n.slug}
              note={{
                slug: n.slug,
                title: n.title,
                date: n.date,
                tags: n.tags,
                readingTime: n.readingTime,
                excerpt: n.excerpt,
                type: n.type,
                hasPage: n.hasPage,
              }}
            />
          ))}
          {shortNotes.length === 0 && (
            <p className="cp-subtitle col-span-full text-sm">
              No short notes matched this filter.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
