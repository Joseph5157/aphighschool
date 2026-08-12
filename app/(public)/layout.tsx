import Link from "next/link";
import type { Metadata, Viewport } from "next";
import BottomNav from "@/app/(public)/_components/BottomNav";
import Button from "@/app/(public)/_components/Button";

import ThemeToggle from "@/app/(public)/_components/ThemeToggle";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AP Teacher Desk — AP School Education Orders & Circulars",
    template: "%s",
  },
  description:
    "Accurate, Telugu-first summaries of AP School Education Government Orders, circulars, and teacher notifications. Independent and unofficial.",
};

export const viewport: Viewport = {
  themeColor: "#1B2A4A",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col antialiased">
      {/* Top Header with Desktop Navigation */}
      <header className="bg-paperRaised/95 backdrop-blur-md border-b border-hair sticky top-0 z-40 print:hidden">
        <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3 flex items-center justify-between gap-6">
          <Link href="/" className="group flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-ink text-turmeric font-mono font-bold flex items-center justify-center border border-inkSoft shadow-sm">
              AP
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-ink group-hover:text-inkSoft transition-colors">
                AP Teacher Desk
              </div>
              <div className="text-[10px] font-mono text-inkSoft uppercase tracking-wider">
                AP School Education
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 font-mono text-xs font-semibold text-inkSoft">
            <Link href="/" className="hover:text-ink transition-colors">
              Home
            </Link>
            <Link href="/orders" className="hover:text-ink transition-colors">
              Orders & Circulars
            </Link>
            <Link href="/tools" className="hover:text-ink transition-colors">
              Utility Tools
            </Link>
            <Link href="/search" className="hover:text-ink transition-colors">
              Search
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/admin" className="hidden sm:block">
              <Button variant="primary" size="sm">
                CMS →
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area (100% Widescreen Dashboard Container) */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 pb-[64px] print:p-0 print:m-0 print:max-w-none print:w-full">
        {children}
      </main>

      {/* Sticky Bottom Tab Bar with Active Route Indicators */}
      <BottomNav />
    </div>
  );
}
