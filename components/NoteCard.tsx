import Link from "next/link";

export interface NoteMeta {
  slug: string;
  title: string;
  date?: string;
  tags?: string[];
  readingTime?: string;
  excerpt?: string;
  type: "note" | "article" | "essay";
  hasPage: boolean;
}

export default function NoteCard({ note }: { note: NoteMeta }) {
  const tags = [...new Set((note.tags || []).map((t) => t.trim().toLowerCase()))]
    .filter(Boolean);

  const body = (
    <article className="cp-card h-full p-5">
      <h3 className="text-2xl leading-none">{note.title}</h3>
      <div className="cp-kicker mt-2">
        <span>{note.type}</span>
        {note.date && <span className="ml-2">/ {note.date}</span>}
        {note.hasPage && note.readingTime && (
          <span className="ml-2">/ {note.readingTime}</span>
        )}
      </div>
      {note.excerpt && (
        <p className="cp-subtitle mt-3 text-sm">{note.excerpt}</p>
      )}
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="cp-chip px-2 py-1">
              #{t}
            </span>
          ))}
        </div>
      )}
    </article>
  );

  if (note.hasPage) {
    return (
      <Link
        href={`/notes/${note.slug}` as `/notes/${string}`}
        className="block"
      >
        {body}
      </Link>
    );
  }

  return body;
}
