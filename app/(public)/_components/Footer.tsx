import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-hair bg-paperRaised/60 pt-8 pb-[calc(84px+env(safe-area-inset-bottom))] lg:pb-8 text-xs text-inkSoft print:hidden">
      <div className="mx-auto max-w-[1800px] px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center md:text-left">
          <div className="font-bold text-ink">AP Teacher Desk</div>
          <p className="max-w-md">
            Independent &amp; unofficial Telugu-first information portal for AP School Education teachers, staff, and pensioners.
          </p>
        </div>

        <nav aria-label="Legal and trust links" className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
          <Link href="/about" className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tamarind rounded">
            About
          </Link>
          <Link href="/contact" className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tamarind rounded">
            Contact &amp; Support
          </Link>
          <Link href="/privacy" className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tamarind rounded">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tamarind rounded">
            Terms of Use
          </Link>
          <Link href="/disclaimer" className="hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tamarind rounded">
            Disclaimer
          </Link>
        </nav>
      </div>
    </footer>
  );
}
