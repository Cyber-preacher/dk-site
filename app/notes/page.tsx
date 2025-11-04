// app/notes/page.tsx
import Link from "next/link";
import NoteCard from "@/components/NoteCard";
import { getAllNotes } from "@/lib/notes";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Notes — Zettelkasten" };

type NoteItem = ReturnType<typeof getAllNotes>[number];
type SearchParams = {
  q?: string | string[];
  tag?: string | string[];
};

export default async function NotesPage({
  // Next 15: searchParams is async — must be awaited
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const sp = (await searchParams) ?? {};
  const qRaw = (sp.q ?? "") as string | string[];
  const tagRaw = (sp.tag ?? "") as string | string[];
  const q = (Array.isArray(qRaw) ? qRaw[0] : qRaw).trim();
  const tag = (Array.isArray(tagRaw) ? tagRaw[0] : tagRaw).trim();

  const notes = getAllNotes();

  // Tag counts
  const tagCounts = new Map<string, number>();
  for (const n of notes) {
    for (const t of n.tags || []) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }
  const tagsSorted: Array<[string, number]> = Array.from(tagCounts.entries()).sort(
    (a: [string, number], b: [string, number]) => b[1] - a[1]
  );

  const ql = q.toLowerCase();
  const tl = tag.toLowerCase();

  const filtered: NoteItem[] = notes.filter((n: NoteItem) => {
    const matchesQ =
      !ql ||
      n.title.toLowerCase().includes(ql) ||
      (n.excerpt?.toLowerCase().includes(ql) ?? false) ||
      n.content.toLowerCase().includes(ql);

    const matchesTag =
      !tl || (n.tags || []).some((t: string) => t.toLowerCase() === tl);

    return matchesQ && matchesTag;
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold">Notes</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Zettelkasten-style atomic ideas with backlinks.
      </p>

      {/* Search form (GET) */}
      <form method="get" action="/notes" className="mt-6 flex items-center gap-3">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search title, excerpt, body…"
          className="w-full md:w-96 rounded-lg bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-400/40"
        />
        {/* preserve tag when searching */}
        {tag && <input type="hidden" name="tag" value={tag} />}
        <button
          type="submit"
          className="rounded-lg border border-white/10 px-3 py-2 hover:bg-white/10 transition"
        >
          Search
        </button>
        {(q || tag) && (
          <Link
            href="/notes"
            className="rounded-lg border border-white/10 px-3 py-2 hover:bg-white/10 transition"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Tags cloud */}
      {tagsSorted.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tagsSorted.map(([t, count]: [string, number]) => {
            const active = tag && t.toLowerCase() === tl;
            const href = active
              ? { pathname: "/notes" as const, query: q ? { q } : undefined }
              : { pathname: "/notes" as const, query: q ? { q, tag: t } : { tag: t } };
            return (
              <Link
                key={t}
                href={href}
                className={`text-[11px] font-mono tracking-widest px-2 py-1 rounded border ${
                  active
                    ? "border-cyan-400/60 bg-cyan-400/10"
                    : "border-white/10 hover:bg-white/5"
                }`}
              >
                #{t} <span className="opacity-60">({count})</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Results */}
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {filtered.map((n: NoteItem) => (
          <NoteCard
            key={n.slug}
            note={{
              slug: n.slug,
              title: n.title,
              date: n.date,
              tags: n.tags,
              readingTime: n.readingTime,
              excerpt: n.excerpt,
            }}
          />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-zinc-400 col-span-full">
            No notes found{q ? ` for “${q}”` : ""}{tag ? ` with tag #${tag}` : ""}.
          </p>
        )}
      </div>
    </div>
  );
}
