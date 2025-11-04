// app/tags/page.tsx
import Link from "next/link";
import type { Metadata, Route } from "next";
import { getAllNotes } from "@/lib/notes";

export const metadata: Metadata = { title: "Tags — Zettelkasten" };

type NoteItem = ReturnType<typeof getAllNotes>[number];

export default function TagsPage() {
  const notes = getAllNotes();

  // Build tag => count
  const counts = new Map<string, number>();
  for (const n of notes) {
    for (const t of n.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  }

  const items: Array<[string, number]> = Array.from(counts.entries()).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0])
  );

  return (
    <div>
      <h1 className="text-3xl font-semibold">Tags</h1>
      <p className="mt-2 text-sm text-zinc-400">Browse your notes by topic.</p>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-400">No tags yet.</p>
      ) : (
        <div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {items.map(([t, count]: [string, number]) => {
            // Concrete string + cast to Route to satisfy typedRoutes
            const href = (`/tags/${encodeURIComponent(t)}`) as Route;
            return (
              <Link
                key={t}
                href={href}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] transition"
              >
                <span className="text-sm font-mono tracking-widest">#{t}</span>
                <span className="ml-2 text-xs text-zinc-400">({count})</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
