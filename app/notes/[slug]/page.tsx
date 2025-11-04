import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Markdown from "@/components/Markdown";
import { getAllNotes, getNoteBySlug, getSlugMap } from "@/lib/notes";
import { getSiteUrl } from "@/lib/site";

// Derive types from data helpers
type NoteItem = ReturnType<typeof getAllNotes>[number];
type BacklinkItem = NonNullable<NoteItem["backlinks"]>[number];

export function generateStaticParams(): { slug: string }[] {
  return getAllNotes().map((n: NoteItem) => ({ slug: n.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const note = getNoteBySlug(params.slug);
  if (!note) return { title: "Note not found" };

  const site = getSiteUrl();
  const url = `${site}/notes/${note.slug}`;
  const og = `${site}/og/${note.slug}`;

  return {
    title: note.title,
    description: note.excerpt || undefined,
    alternates: { canonical: url },
    openGraph: {
      title: note.title,
      description: note.excerpt || undefined,
      url,
      type: "article",
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      description: note.excerpt || undefined,
      images: [og],
    },
  };
}

export default function NotePage({ params }: { params: { slug: string } }) {
  const note = getNoteBySlug(params.slug);
  if (!note) return notFound();

  const slugMap = getSlugMap();

  return (
    <article className="prose prose-invert max-w-none">
      <p className="text-xs font-mono tracking-widest text-zinc-400">NOTE</p>
      <h1>{note.title}</h1>
      <p className="!mt-0 text-sm text-zinc-400">
        {note.date ?? null}
        {note.readingTime ? ` • ${note.readingTime}` : ""}
      </p>

      <Markdown source={note.content} slugMap={slugMap} />

      {note.tags && note.tags.length > 0 && (
        <p className="mt-6 text-sm">
          {note.tags.map((t: string) => (
            <span
              key={t}
              className="mr-2 text-[11px] font-mono tracking-widest px-2 py-1 rounded border border-white/10"
            >
              #{t}
            </span>
          ))}
        </p>
      )}

      {note.backlinks && note.backlinks.length > 0 && (
        <div className="mt-10">
          <h3>Backlinks</h3>
          <ul className="list-disc pl-5">
            {note.backlinks.map((b: BacklinkItem) => (
              <li key={b.slug}>
                <a href={`/notes/${b.slug}`}>{b.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
