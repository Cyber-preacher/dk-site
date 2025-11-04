// app/notes/page.tsx
import NoteCard from "../../components/NoteCard";
import { getAllNotes } from "../../lib/notes";

export const metadata = { title: "Notes — Zettelkasten" };

export default function NotesPage() {
  const notes = getAllNotes();
  return (
    <div>
      <h1 className="text-3xl font-semibold">Notes</h1>
      <p className="mt-2 text-sm text-zinc-400">Zettelkasten-style atomic ideas with backlinks.</p>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {notes.map(n => (
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
      </div>
    </div>
  );
}
