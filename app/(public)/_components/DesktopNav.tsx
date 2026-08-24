"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home", exact: true },
  { href: "/orders", label: "Orders & Circulars", exact: false },
  { href: "/tools", label: "Utility Tools", exact: false },
  { href: "/search", label: "Search", exact: false },
];

export default function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:flex items-center gap-6 font-mono text-xs font-semibold text-inkSoft">
      {NAV_LINKS.map((link) => {
        const isActive = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`transition-colors ${isActive ? "text-ink font-bold border-b-2 border-tamarind pb-0.5" : "hover:text-ink"}`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
