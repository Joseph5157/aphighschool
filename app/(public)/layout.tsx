import Link from "next/link";
import type { Metadata, Viewport } from "next";

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
      <header className="bg-paperRaised border-b border-hair sticky top-0 z-40">
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
          
          <Link
            href="/admin"
            className="hidden md:block text-xs font-mono bg-ink text-paperRaised px-3 py-1.5 rounded-md hover:bg-inkSoft transition-colors"
          >
            CMS →
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 pb-[64px]">
        {children}
      </main>

      {/* Sticky Bottom Tab Bar */}
      <nav className="sticky bottom-0 left-0 w-full bg-paperRaised border-t border-hair z-50">
        <div className="max-w-md mx-auto flex items-center justify-around py-2">
          <Link href="/" className="flex flex-col items-center p-2 text-inkSoft hover:text-ink active:scale-[0.92] transition-transform">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            <span className="text-[10px] font-semibold">Home</span>
          </Link>
          <Link href="/orders" className="flex flex-col items-center p-2 text-inkSoft hover:text-ink active:scale-[0.92] transition-transform">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1.207 1.207 0 01.853.353l4.353 4.353a1.207 1.207 0 01.353.853V19a2 2 0 01-2 2z" /></svg>
            <span className="text-[10px] font-semibold">Categories</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center p-2 text-inkSoft hover:text-ink active:scale-[0.92] transition-transform">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <span className="text-[10px] font-semibold">Search</span>
          </Link>
          <Link href="/category/tools" className="flex flex-col items-center p-2 text-inkSoft hover:text-ink active:scale-[0.92] transition-transform">
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-[10px] font-semibold">Tools</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
