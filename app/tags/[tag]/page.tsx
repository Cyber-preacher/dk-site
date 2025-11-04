// app/tags/[tag]/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getAllNotes } from "@/lib/notes";
import NoteCard from "@/components/NoteCard";

type NoteItem = ReturnType<typeof getAllNotes>[number];

export function generateStaticParams(): { tag: string }[] {
  const notes = getAllNotes();
  const set = new Set<string>();
  for (const n of notes) for (const t of n.tags ?? []) set.add(t);
  return Array.from(set).map((t) => ({ tag: t }));
}

// Next 15: params is async here
export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded} — Notes`,
    description: `Notes tagged with #${decoded}`,
  };
}

// Next 15: params is async here too
export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const tl = decoded.toLowerCase();

  const notes = getAllNotes().filter((n: NoteItem) =>
    (n.tags ?? []).some((t: string) => t.toLowerCase() === tl)
  );

  return (
    <div>
      <p className="text-xs font-mono tracking-widest text-zinc-400">TAG</p>
      <h1 className="text-3xl font-semibold">#{decoded}</h1>
      <p className="mt-2 text-sm text-zinc-400">
        {notes.length} note{notes.length === 1 ? "" : "s"}
      </p>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {notes.map((n: NoteItem) => (
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
        {notes.length === 0 && (
          <p className="text-sm text-zinc-400 col-span-full">No notes found.</p>
        )}
      </div>

      <div className="mt-8">
        <Link
          href={{ pathname: "/notes", query: { tag: decoded } }}
          className="text-sm underline underline-offset-4 hover:no-underline"
        >
          View on /notes with the tag filter →
        </Link>
      </div>
    </div>
  );
}
