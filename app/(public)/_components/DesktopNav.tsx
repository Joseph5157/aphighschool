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
      className="hidden lg:flex items-center gap-6 font-mono text-xs font-semibold text-inkSoft"
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
