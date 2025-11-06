// app/notes/[slug]/page.tsx
import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllNotes, getNoteBySlug, getSlugMap } from "@/lib/notes";
import Markdown from "@/components/Markdown";

type NoteItem = ReturnType<typeof getAllNotes>[number];

export function generateStaticParams(): { slug: string }[] {
  return getAllNotes().map((n: NoteItem) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) return { title: "Note not found" };

  return {
    title: `${note.title} — Notes`,
    description: note.excerpt ?? undefined,
    alternates: { canonical: `/notes/${note.slug}` },
    openGraph: {
      title: note.title,
      description: note.excerpt ?? undefined,
      type: "article",
      url: `/notes/${note.slug}`,
    },
  };
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note) return notFound();

  const slugMap = getSlugMap();

  return (
    <article className="prose prose-invert">
      <p className="text-xs font-mono tracking-widest text-zinc-400">NOTE</p>
      <h1 className="text-3xl font-semibold">{note.title}</h1>
      {note.date && (
        <p className="mt-1 text-xs text-zinc-400">
          {note.date}
          {note.readingTime ? ` · ${note.readingTime}` : ""}
        </p>
      )}

      <div className="mt-6">
        <Markdown source={note.content} slugMap={slugMap} />
      </div>

      {Array.isArray(note.tags) && note.tags.length > 0 && (
        <p className="mt-6 text-sm">
          {note.tags.map((t: string) => (
            <Link
              key={t}
              href={{ pathname: "/notes", query: { tag: t } }}
              className="link-underline mr-2"
            >
              #{t}
            </Link>
          ))}
        </p>
      )}

      {Array.isArray((note as any).backlinks) &&
        (note as any).backlinks.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold">Mentioned in…</h2>
            <ul className="mt-2 space-y-1">
              {(note as any).backlinks.map(
                (b: { slug: string; title: string }) => (
                  <li key={b.slug}>
                    <Link
                      href={
                        (`/notes/${b.slug}`) as Route // typedRoutes-safe
                      }
                      className="link-underline"
                    >
                      {b.title}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        )}
    </article>
  );
}
