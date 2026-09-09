import Link from "next/link";
import type { Metadata, Viewport } from "next";
import { getSiteUrl, SITE_NAME } from "@/lib/site";
import BottomNav from "@/app/(public)/_components/BottomNav";
import { BottomBarProvider } from "@/app/(public)/_components/BottomBarSlot";
import { buttonClassName } from "@/app/(public)/_components/Button";
import DesktopNav from "@/app/(public)/_components/DesktopNav";
import ThemeToggle from "@/app/(public)/_components/ThemeToggle";
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
      {/* Sliding Sidebar Drawer for Public Navigation & Tools */}
      <Sidebar side="left" collapsible="offcanvas">
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
          {/* Quick Navigation Group */}
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton href="/" icon="🏠">Home</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton href="/orders" icon="📋">Orders & Circulars</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton href="/tools" icon="🧮">Utility Tools</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton href="/service-desk" icon="SD">Teacher Service Desk</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton href="/pensioners" icon="👵">Pensioners Hub</SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton href="/search" icon="🔍">Search</SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Calculators & Utilities Collapsible Submenu */}
          <SidebarGroup>
            <SidebarGroupLabel>Teacher Utilities</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarCollapsible title="Calculators & Bills" icon="⚡" defaultOpen>
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

                <SidebarCollapsible title="Pension Services" icon="🏖️">
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
          <div className="text-[10px] font-mono text-inkSoft/70">
            AP Teacher Desk — Independent &amp; Unofficial
          </div>
        </SidebarFooter>
      </Sidebar>

      <div className="min-h-screen bg-paper text-ink flex flex-col antialiased w-full min-w-0">
        {/* Top Header with Navigation & Sidebar Trigger */}
        <header className="bg-paperRaised/95 backdrop-blur-md border-b border-hair sticky top-0 z-40 print:hidden">
          <div className="w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <Link href="/" className="group flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-lg on-masthead bg-masthead text-turmeric font-mono font-bold flex items-center justify-center border border-mastheadText/30 shadow-sm">
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
        <main className="flex-1 w-full max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-8 pb-[calc(76px+env(safe-area-inset-bottom))] lg:pb-8 print:p-0 print:m-0 print:max-w-none print:w-full">
          {children}
        </main>

        {/* Sticky Bottom Tab Bar. Yields to a page-level bar via BottomBarSlot. */}
        <BottomNav />
      </div>
      </SidebarProvider>
    </BottomBarProvider>
  );
}

