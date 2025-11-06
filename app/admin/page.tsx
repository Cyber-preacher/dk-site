// app/admin/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — New Note",
  description: "Create a new Zettelkasten note (admin only).",
};

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold mb-6">Admin: Create Note</h1>

      <p className="text-sm text-zinc-400 mb-6">
        This form posts to <code className="px-1 py-0.5 rounded bg-white/10">/api/admin/create-note</code>.
        Basic Auth is enforced by <code>middleware.ts</code>.
      </p>

      <form method="POST" action="/api/admin/create-note" className="space-y-4">
        <div>
          <label className="block text-sm mb-1" htmlFor="title">Title</label>
          <input id="title" name="title" required className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"/>
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="slug">Slug (auto if empty)</label>
          <input id="slug" name="slug" placeholder="my-note-slug" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"/>
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="tags">Tags (comma-separated)</label>
          <input id="tags" name="tags" placeholder="humanode, pobu, research" className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"/>
        </div>

        <div>
          <label className="block text-sm mb-1" htmlFor="content">Content (Markdown)</label>
          <textarea id="content" name="content" rows={10} required className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 font-mono"/>
        </div>

        <button className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-cyan-200 hover:bg-cyan-400/20 transition">
          Create
        </button>
      </form>
    </main>
  );
}
