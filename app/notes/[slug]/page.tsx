// app/notes/[slug]/page.tsx
import type { Metadata, Route } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getLongFormNoteSummaries,
  getNoteBySlug,
  getNoteSummaryBySlug,
  getSlugMap,
  isLongForm,
} from "@/lib/notes";
import Markdown from "@/components/Markdown";

export function generateStaticParams(): { slug: string }[] {
  return getLongFormNoteSummaries().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const note = getNoteBySlug(slug);
  if (!note || !isLongForm(note)) return { title: "Note not found" };

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
  if (!note || !isLongForm(note)) return notFound();

  const slugMap = getSlugMap();
  const backlinks = (note.backlinks || []).filter(
    (b: { slug: string; title: string }) => {
      const source = getNoteSummaryBySlug(b.slug);
      return !!source && isLongForm(source);
    },
  );

  return (
    <article>
      <p className="cp-kicker">Note Dossier</p>
      <h1 className="mt-2 text-5xl leading-none">{note.title}</h1>
      {note.date && (
        <p className="cp-kicker mt-3">
          {note.date}
          {note.readingTime ? ` / ${note.readingTime}` : ""}
        </p>
      )}

      <div className="cp-panel mt-6 p-5 sm:p-7">
        <Markdown source={note.content} slugMap={slugMap} />
      </div>

      {Array.isArray(note.tags) && note.tags.length > 0 && (
        <p className="mt-6 flex flex-wrap gap-2 text-sm">
          {note.tags.map((t: string) => (
            <Link
              key={t}
              href={`/notes?tag=${encodeURIComponent(t)}`}
              className="cp-chip px-3 py-1"
            >
              #{t}
            </Link>
          ))}
        </p>
      )}

      {backlinks.length > 0 && (
        <div className="cp-panel mt-10 p-5">
          <h2 className="text-3xl leading-none">Mentioned In</h2>
          <ul className="mt-2 space-y-1">
            {backlinks.map((b: { slug: string; title: string }) => (
              <li key={b.slug}>
                <Link
                  href={
                    `/notes/${b.slug}` as Route // typedRoutes-safe
                  }
                  className="cp-card block p-3"
                >
                  {b.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
