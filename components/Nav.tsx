// components/Nav.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  return (
    <header className="cp-nav">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <nav className="hidden items-center gap-6 sm:flex">
          <Link href="/notes" className="cp-nav-link link-underline">
            Notes
          </Link>
          <Link href="/" className="cp-nav-link link-underline">
            Dato
          </Link>
        </nav>

        <div className="sm:hidden">
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-menu"
            aria-label="Toggle navigation menu"
            className="cp-menu-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            Menu
          </button>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <SocialLinks />
          <ThemeToggle />
        </div>
      </div>

      {menuOpen && (
        <div className="cp-mobile-overlay sm:hidden" onClick={() => setMenuOpen(false)}>
          <div
            id="mobile-nav-menu"
            role="dialog"
            aria-modal="true"
            className="cp-mobile-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <p className="cp-kicker">Navigate</p>
              <button
                type="button"
                className="cp-menu-close"
                aria-label="Close navigation menu"
                onClick={() => setMenuOpen(false)}
              >
                Close
              </button>
            </div>

            <nav className="mt-5 flex flex-col gap-2">
              <Link
                href="/notes"
                className="cp-mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                Notes
              </Link>
              <Link href="/" className="cp-mobile-link" onClick={() => setMenuOpen(false)}>
                Dato
              </Link>
            </nav>

            <div className="mt-6 flex items-center justify-between gap-3">
              <ThemeToggle />
              <SocialLinks />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function SocialLinks() {
  return (
    <>
      <a
        href="https://x.com/DatoKavazi"
        target="_blank"
        rel="noreferrer"
        aria-label="Dato on X"
        className="cp-social-link"
        title="X"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.3L6.6 22H3.5l7.3-8.3L1 2h6.2l4.3 5.7L18.9 2zm-1.1 18h1.7L6.2 3.9H4.4L17.8 20z" />
        </svg>
      </a>
      <a
        href="https://github.com/Cyber-preacher"
        target="_blank"
        rel="noreferrer"
        aria-label="Dato on GitHub"
        className="cp-social-link"
        title="GitHub"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 .5a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.4-4-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.4 3.6 1.1.1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.4-5.5-6a4.7 4.7 0 0 1 1.2-3.2c-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.3 2.9.2 3.2a4.7 4.7 0 0 1 1.2 3.2c0 4.6-2.8 5.7-5.5 6 .4.3.8 1 .8 2.1v3.1c0 .3.2.7.8.6A12 12 0 0 0 12 .5z" />
        </svg>
      </a>
    </>
  );
}
