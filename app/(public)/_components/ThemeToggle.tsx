"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <button className="w-8 h-8 rounded-lg bg-hair/40 border border-hair text-xs flex items-center justify-center opacity-0">
        🌙
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="px-2.5 py-1.5 rounded-lg border border-hair/80 bg-paperRaised/80 hover:bg-paper text-ink text-xs font-mono font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
      aria-label="Toggle visual theme mode"
      title={theme === "light" ? "Switch to Night Mode (Digital Secretariat)" : "Switch to Day Mode (Imperial Gazette)"}
    >
      <span>{theme === "light" ? "🌙" : "☀️"}</span>
      <span className="hidden sm:inline">
        {theme === "light" ? "Night Mode" : "Day Mode"}
      </span>
    </button>
  );
}
