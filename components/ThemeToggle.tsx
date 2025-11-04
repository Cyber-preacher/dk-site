// components/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(next)}
      className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-sm hover:bg-white/10 transition"
      title={`Switch to ${next} mode`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
