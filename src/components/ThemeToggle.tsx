"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    // Reads a value only known client-side (set by the inline script in
    // layout.tsx before hydration), so this can't be computed during SSR.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // ignore (private browsing, etc.)
    }
    setDark(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={dark ? "Modo claro" : "Modo oscuro"}
      className="fixed top-3 right-3 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-base shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
    >
      {dark === null ? null : dark ? "☀️" : "🌙"}
    </button>
  );
}
