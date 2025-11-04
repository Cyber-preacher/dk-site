import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="rounded-3xl glass p-8 md:p-12">
        <p className="font-mono text-xs tracking-widest text-zinc-400">WELCOME</p>
        <h1 className="mt-2 text-3xl md:text-5xl font-semibold">
          Dato Kavazi — builder, writer, and explorer.
        </h1>
        <p className="mt-4 text-zinc-300 md:text-lg">
          Artsy + cyber with business polish. Notes, essays, projects.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/notes" className="px-4 py-2 rounded-xl border border-white/15 hover:border-white/30">Browse Notes</Link>
          <Link href="/about" className="px-4 py-2 rounded-xl border border-white/15 hover:border-white/30">About</Link>
        </div>
      </section>
    </div>
  );
}
