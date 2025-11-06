import type { Metadata } from "next";
import AdminTokenForm from "@/components/AdminTokenForm";

export const metadata: Metadata = {
  title: "Admin — New Note",
  description: "Create a new Zettelkasten note (admin only).",
};

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 space-y-10">
      <section>
        <h1 className="text-2xl font-semibold mb-3">Admin: Create Note</h1>
        <p className="text-sm text-zinc-400">
          Authoring routes are protected by <code>ADMIN_TOKEN</code>.
          Store your token below (writes a local <code>admin_token</code> cookie),
          then post the form to <code className="px-1 py-0.5 rounded bg-white/10">/api/admin/create-note</code>.
        </p>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-6">
        <AdminTokenForm />
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <form method="POST" action="/api/admin/create-note" className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              name="title"
              required
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm mb-1" htmlFor="slug">
                Slug (optional)
              </label>
              <input
                id="slug"
                name="slug"
                placeholder="auto-generated from title"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm mb-1" htmlFor="date">
                Date (YYYY-MM-DD)
              </label>
              <input
                id="date"
                name="date"
                type="date"
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="tags">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              name="tags"
              placeholder="humanode, pobu, research"
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm mb-1" htmlFor="body">
              Content (Markdown)
            </label>
            <textarea
              id="body"
              name="body"
              rows={12}
              required
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 font-mono"
            />
          </div>

          <button className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-cyan-200 hover:bg-cyan-400/20 transition">
            Create note
          </button>
        </form>
      </section>
    </main>
  );
}
