"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import clsx from "clsx";
export default function Nav() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-5xl px-6 md:px-8">
        <div className="mt-6 mb-6 rounded-2xl px-4 py-3 flex items-center justify-between"
             style={{ backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}>
          <Link href="/" className="font-mono text-sm md:text-base tracking-widest">
            <span className="text-cyan-300">dato</span>
            <span className="text-fuchsia-400">.k</span>
            <span className="text-lime-300">/</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            <Link href="/notes" className="opacity-90 hover:opacity-100">Notes</Link>
            <Link href="/about" className="opacity-90 hover:opacity-100">About</Link>
            {mounted && (
              <button
                className={clsx("rounded-lg px-3 py-1.5 text-xs font-mono tracking-widest")}
                style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? "DARK" : "LIGHT"}
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
