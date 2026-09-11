"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home", exact: true },
  { href: "/orders", label: "Orders & Circulars", exact: false },
  { href: "/tools", label: "Utility Tools", exact: false },
  { href: "/service-desk", label: "Service Desk", exact: false },
  { href: "/pensioners", label: "Pensioners Hub", exact: false },
  { href: "/search", label: "Search", exact: false },
];

export default function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      // NAV-1024-1: at 1024px the row has ~122px less room than the six
      // labels' natural single-line width needs (measured in real Chromium,
      // docs/context/NAV_1024_PLAN.md) — nothing here had `whitespace-nowrap`,
      // so multi-word labels ("Orders & Circulars", "Utility Tools", "Service
      // Desk", "Pensioners Hub") silently wrapped to two lines to absorb the
      // deficit instead of the row ever visibly running out of space.
      // `gap-2` (vs. the base `gap-6`) recovers most of that deficit in the
      // 1024–1199px band specifically; `min-[1200px]:gap-6` restores the
      // original spacing from the point real Chromium measurement confirmed
      // it's no longer needed, so wider desktops aren't left over-compressed.
      className="hidden lg:flex items-center gap-2 min-[1200px]:gap-6 font-mono text-xs font-semibold text-inkSoft whitespace-nowrap"
    >
      {NAV_LINKS.map((link) => {
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? "page" : undefined}
            // Turmeric bottom rule: navigation position is chrome and must not
            // borrow tamarind, which means "in force" on a document.
            className={`transition-colors duration-150 border-b-[3px] pb-0.5 ${
              isActive
                ? "text-ink font-bold border-turmeric"
                : "border-transparent hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
