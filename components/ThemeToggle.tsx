// components/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === "dark";
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(next)}
      className="cp-btn-ghost px-3 py-1.5"
      title={`Switch to ${next} mode`}
    >
      {isDark ? "Light Mode" : "Dark Mode"}
    </button>
  );
}
