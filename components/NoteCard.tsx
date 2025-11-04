// components/NoteCard.tsx
import Link from "next/link";
import { format } from "date-fns";

export interface NoteMeta {
  slug: string;
  title: string;
  date?: string;
  tags?: string[];
  readingTime?: string;
  excerpt?: string;
}

export default function NoteCard({ note }: { note: NoteMeta }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:shadow-[0_0_40px_rgba(34,211,238,0.35)] transition-shadow">
      <h3 className="text-lg font-semibold">
        <Link href={`/notes/${note.slug}`}>{note.title}</Link>
      </h3>
      <div className="mt-1 text-xs text-zinc-400">
        {note.date && <span>{format(new Date(note.date), "yyyy-MM-dd")}</span>}
        {note.readingTime && <span className="ml-2">• {note.readingTime}</span>}
      </div>
      {note.excerpt && <p className="mt-3 text-sm text-zinc-300">{note.excerpt}</p>}
      {note.tags && note.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {note.tags.map(t => (
            <span key={t} className="text-[10px] tracking-widest font-mono px-2 py-1 rounded border border-white/10 text-zinc-300">
              #{t}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
