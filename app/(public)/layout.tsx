import Link from "next/link";
import BottomNav from "@/app/(public)/_components/BottomNav";
import type { Metadata, Viewport } from "next";

import Button from "@/app/(public)/_components/Button";

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
      {/* Minimal Top Header */}
      <header className="bg-paperRaised border-b border-hair sticky top-0 z-40 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-3">
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
          
          <Link href="/admin" className="hidden md:block">
            <Button variant="primary" size="sm">
              CMS →
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 pb-[64px] print:p-0 print:m-0 print:max-w-none print:w-full">
        {children}
      </main>

      {/* Sticky Bottom Tab Bar with Active Route Indicators */}
      <BottomNav />
    </div>
  );
}
