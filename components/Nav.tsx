// components/Nav.tsx
"use client";

import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/30 bg-black/40 border-b border-white/10">
      <div className="mx-auto max-w-4xl px-4 h-14 flex items-center justify-between">
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="link-underline font-semibold">
            Dato
          </Link>
          <Link href="/notes" className="link-underline">
            Notes
          </Link>
          <Link href="/tags" className="link-underline">
            Tags
          </Link>
          <Link href="/about" className="link-underline">
            About
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
