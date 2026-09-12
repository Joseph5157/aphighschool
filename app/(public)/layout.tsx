import Link from "next/link";
import type { Metadata, Viewport } from "next";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import BottomNav from "@/app/(public)/_components/BottomNav";
import { BottomBarProvider } from "@/app/(public)/_components/BottomBarSlot";
import { buttonClassName } from "@/app/(public)/_components/Button";
import DesktopNav from "@/app/(public)/_components/DesktopNav";
import ThemeToggle from "@/app/(public)/_components/ThemeToggle";
import PwaUpdateManager from "@/app/(public)/_components/PwaUpdateManager";
import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarCollapsible,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarMobileOnly,
} from "@/app/(public)/_components/Sidebar";

const siteUrl = getSiteUrl();
const siteDescription =
  "Telugu-first summaries of AP School Education government orders, circulars, and teacher notifications, with lifecycle status and provenance shown for each. Independent and unofficial.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AP Teacher Desk — AP School Education Orders & Circulars",
    // Every route below supplies its own bare title; this is what actually
    // appends the site name once instead of each route hand-writing it
    // (UI_AUDIT.md F23 — the previous "%s" template did nothing).
    template: "%s — AP Teacher Desk",
  },
  description: siteDescription,
  robots: { index: true, follow: true },
  // No openGraph.title/description or twitter.title/description here:
  // Next.js falls back to each route's own resolved title/description for
  // og:title/og:description/twitter:title/twitter:description as long as
  // openGraph/twitter don't specify their own — set them here and every
  // route's social preview would show this same site-wide default instead
  // of what the page is actually about.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "rgb(27, 42, 74)" },
    { media: "(prefers-color-scheme: dark)", color: "rgb(19, 26, 40)" },
  ],
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <BottomBarProvider>
      <SidebarProvider defaultOpen={false}>
      {/* Skip link (UI_AUDIT.md F17 / DESIGN_SYSTEM.md §14) — first focusable
          element in the document; invisible until keyboard-focused, so a
          keyboard/screen-reader user isn't forced through the drawer trigger,
          logo link, and full desktop nav before reaching the page content. */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:rounded-lg focus:bg-ink focus:text-paper focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* Sliding Sidebar Drawer for Public Navigation & Tools */}
      <Sidebar side="left" desktopVariant="popover">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-tamarind text-paper font-mono font-bold flex items-center justify-center text-xs">
              AP
            </div>
            <span className="font-bold text-xs">Public Quick Menu</span>
          </div>
          <SidebarTrigger />
        </SidebarHeader>

        <SidebarContent>
          {/* Quick Navigation Group — mobile drawer only (NAV-SIDEBAR-2).
              DesktopNav already owns these six destinations; on the desktop
              persistent sidebar they rendered as a verbatim duplicate of the
              header nav, visible in the same viewport at once
              (NAV-SIDEBAR-1). The drawer is the only surface where this group
              is a phone's sole navigation, so it stays there unchanged. */}
          <SidebarMobileOnly>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/">Home</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/orders">Orders & Circulars</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/tools">Utility Tools</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/service-desk">Service Desk</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/pensioners">Pensioners Hub</SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton href="/search">Search</SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarMobileOnly>

          {/* Calculators & Utilities Collapsible Submenu */}
          <SidebarGroup>
            <SidebarGroupLabel>Teacher Utilities</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarCollapsible title="Calculators & Bills" defaultOpen>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="/tools/tax-calculator">Income Tax Calculator</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="/tools/leave-encashment">Leave Encashment</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="/tools/gpf-apgli">GPF & APGLI Estimator</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="/tools/cfms-checker">CFMS Bill Status</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="/tools/prc-calculator">PRC Calculator</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarCollapsible>

                <SidebarCollapsible title="Pension Services">
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="/pensioners/pension-calculator">Pension Calculator</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="/pensioners/commutation-tracker">Commutation Tracker</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton href="/pensioners/office-pipeline">Office Pipeline</SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarCollapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="text-xs font-mono text-inkSoft/80">
            AP Teacher Desk — Independent &amp; Unofficial
          </div>
        </SidebarFooter>
      </Sidebar>

      <div className="min-h-screen bg-paper text-ink flex flex-col antialiased w-full min-w-0">
        {/* Top Header with Navigation & Sidebar Trigger */}
        <header className="bg-paperRaised/95 backdrop-blur-md border-b border-hair sticky top-0 z-40 print:hidden">
          <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0 lg:shrink-0">
              {/* lg:shrink-0 reinstates this gate's pre-fix (baseline) pinned
                  width once DesktopNav appears at the 1024px breakpoint —
                  that width is already fully committed there (DesktopNav's
                  six links plus the CMS button and full-text ThemeToggle
                  leave no slack), so letting this group shrink too would
                  truncate the subtitle at desktop widths, a regression this
                  gate (narrow-phone only) is not scoped to fix. */}
              <SidebarTrigger />
              <Link href="/" className="group flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-lg on-masthead bg-masthead text-turmeric font-mono font-bold flex items-center justify-center border border-mastheadText/30 shadow-sm shrink-0">
                  AP
                </div>
                {/* min-w-0 lets this stack compress below its content width at
                    narrow phone sizes (NAV-HEADER-320-1) — the previous
                    `shrink-0` sat on the whole Link above, which fixed this
                    group at its full natural width (driven by the subtitle
                    line, 148.2px vs the wordmark's 104.8px) at every
                    viewport, overlapping the theme toggle at 320px. */}
                <div className="min-w-0">
                  <div className="font-bold text-sm tracking-tight text-ink group-hover:text-inkSoft transition-colors whitespace-nowrap">
                    AP Teacher Desk
                  </div>
                  <div className="text-xs font-mono text-inkSoft uppercase tracking-wider truncate">
                    AP School Education
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <DesktopNav />

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden sm:block">
                <Link href="/admin" className={buttonClassName({ variant: "primary", size: "sm" })}>
                  CMS →
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area.

            The bottom reservation is conditional: `pb-[64px]` applied at every
            width, including `lg` and above where no bottom bar is mounted at
            all, leaving dead space under every desktop page. Below `lg` it
            clears the bar plus the iOS home indicator. */}
        <main
          id="main-content"
          className="flex-1 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 pb-[calc(76px+env(safe-area-inset-bottom))] lg:pb-8 print:p-0 print:m-0 print:max-w-none print:w-full"
        >
          {children}
        </main>

        {/* Sticky Bottom Tab Bar. Yields to a page-level bar via BottomBarSlot. */}
        <BottomNav />
      </div>
      </SidebarProvider>
      {/* PWA-UPDATE-1. Registered here, once, so it survives every
          client-side navigation under this layout. Renders nothing until a
          new version is genuinely waiting. */}
      <PwaUpdateManager />
    </BottomBarProvider>
  );
}

