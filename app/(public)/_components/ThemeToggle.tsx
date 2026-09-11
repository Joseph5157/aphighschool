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

  // Before mount the stored preference is unknown, so nothing is rendered
  // rather than an invisible placeholder. The old one was `opacity-0` but still
  // focusable and unlabelled, so keyboard users hit a button they could not see
  // and screen readers announced an anonymous control.
  if (!mounted) {
    return <div className="h-[44px] w-[44px]" aria-hidden="true" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      // aria-pressed conveys that this is a toggle with a state, which
      // aria-label alone does not. The label names the action; the state says
      // where it currently is.
      aria-pressed={isDark}
      aria-label="Dark theme"
      title={isDark ? "Switch to day mode" : "Switch to night mode"}
      // DESIGN_SYSTEM.md §8.1: 44px minimum touch target, measured on the hit
      // area rather than the painted box — the same pattern Button.tsx's `sm`
      // size already uses (there extended vertically; here extended
      // horizontally, since below `sm` this control's "Night mode"/"Day mode"
      // label is hidden and its painted width, icon + padding only, measured
      // 42px, 2px short of the floor). The transparent ::after overlay grows
      // the hit area without adding to this element's own flex-layout width,
      // so it carries zero risk to the 320px header clearance NAV-HEADER-320-1
      // fixed (docs/context/NAV_HEADER_320_PLAN.md).
      className="relative inline-flex min-h-[44px] items-center gap-1.5 rounded-lg border border-hair/80 bg-paperRaised/80 px-3 font-mono text-xs font-semibold text-ink transition-colors duration-150 hover:bg-paper after:absolute after:inset-y-0 after:-inset-x-1 after:content-['']"
    >
      <span aria-hidden="true">
        {isDark ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" strokeWidth={2} />
            <path strokeLinecap="round" strokeWidth={2} d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        )}
      </span>
      <span className="hidden sm:inline">{isDark ? "Day mode" : "Night mode"}</span>
    </button>
  );
}
