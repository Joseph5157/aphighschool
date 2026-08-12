# 🏗️ AP Teacher Desk — Section Theme Implementation Plan
> **Status:** Ready to Implement  
> **Updated:** 12 Aug 2026  
> **Goal:** Polish each portal section with its designated visual theme using exact code patterns.

---

## 📐 Section ↔ Theme Master Map

| Route | Section | Theme Name | Hero bg | Surface bg | Accent | Badge |
|---|---|---|---|---|---|---|
| `/` | Homepage | Imperial Gazette | `bg-ink` (dark) | `bg-paperRaised` | `#C9973A` turmeric | — |
| `/orders` | G.O.s Hub | **Option A — Navy Gazette** | `#1B2A4A` navy | `#FAF7F2` parchment | `amber-300` | `success` "GOIR Verified" |
| `/posts/[slug]` | G.O. Detail | **Option A — Navy Gazette** | `#1B2A4A` navy | `#FCF7EA` + `#FAF7F2` | `amber-300` | `success` "GOIR Verified" |
| `/education` | Student Hub | **Option B — Slate Secretariat** | `#0F172A` deep slate | `#1E293B` slate-800 | `emerald-400` | `tamarind` "Digital Secretariat Hub" |
| `/tools` | Calculator Hub | **Option C — Indigo Heritage** | `#1B2A4A` indigo | `#FAF7F2` parchment | `amber-300` golden | `turmeric` "Heritage Craft Utility Suite" |

---

## 🎨 Complete Design Token Dictionary

### Tailwind custom tokens used across site
```
bg-paper          = parchment white background
bg-paperRaised    = slightly elevated surface
bg-ink            = dark navy/black (main dark)
text-ink          = main text colour
text-inkSoft      = muted/secondary text
border-hair       = light border
text-tamarind     = deep red-brown accent
text-turmeric     = golden yellow accent
text-turmericDeep = deeper golden
font-telugu       = Noto Sans Telugu font
font-mono         = monospace (JetBrains/IBM Plex Mono)
text-display      = large heading size class
text-card-title   = card heading size class
text-section      = section heading size
text-meta         = small meta text size
text-telugu-title = Telugu h2 class
text-telugu-body  = Telugu body text class
```

### Badge component API
```tsx
// variants: "tamarind" | "turmeric" | "neutral" | "success" | "warning" | "dark"
// sizes:    "sm" | "md" | "lg"
// shapes:   "rounded" | "pill"
// dot:      true | false (adds pulsing dot)

<Badge variant="success" size="sm" shape="pill" dot>GOIR Verified</Badge>
<Badge variant="tamarind" size="sm" shape="pill" dot>Digital Secretariat Hub</Badge>
<Badge variant="turmeric" size="sm" shape="pill" dot>Heritage Craft Utility Suite</Badge>
<Badge variant="neutral" size="sm" shape="pill">3 docs</Badge>
```

### Button component API
```tsx
// variants: "primary" | "secondary" | "tamarind" | "turmeric" | "ghost" | "danger" | "outline"
// sizes:    "sm" | "md" | "lg"

<Button variant="tamarind" size="sm" rightIcon={<span>→</span>}>Open Calculator</Button>
<Button variant="secondary" size="sm" fullWidth rightIcon={<span>→</span>}>View All</Button>
```

### Tabs component API (client component — needs "use client" in file or parent)
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../_components/Tabs";

<Tabs defaultValue="all">
  <TabsList>
    <TabsTrigger value="all" badge="12">All</TabsTrigger>
    <TabsTrigger value="go">G.O.s</TabsTrigger>
  </TabsList>
  <TabsContent value="all">...content...</TabsContent>
  <TabsContent value="go">...content...</TabsContent>
</Tabs>
```

### Accordion component API (client component)
```tsx
import Accordion from "../_components/Accordion";
// AccordionItemData shape:
// { id: string, titleEn: string, titleTe?: string, badge?: string, 
//   badgeVariant?: BadgeVariant, content: React.ReactNode, defaultOpen?: boolean }

<Accordion allowMultiple items={[
  {
    id: "item-1",
    titleEn: "When will DSC 2026 results be announced?",
    badge: "Mega DSC",
    badgeVariant: "tamarind",
    content: <p>Expected results in November 2026...</p>,
  }
]} />
```

### Breadcrumb component API
```tsx
import Breadcrumb from "../_components/Breadcrumb";
// fullItems = [{ label: "Home", href: "/" }, ...items]
// Last item has no href = current page (aria-current="page")

<Breadcrumb items={[{ label: "Orders & Circulars" }]} />
<Breadcrumb items={[
  { label: "Orders & Circulars", href: "/orders" },
  { label: "Government Orders", href: "/category/government-orders" },
  { label: "GO Ms No. 12" },
]} />
```

---

## 📁 Task 1 — `/education/page.tsx` (Option B Polish) 🎓

**File:** [`app/(public)/education/page.tsx`](file:///c:/Users/sikha/Music/Aphighschool/portal-cms/app/(public)/education/page.tsx)  
**Theme:** Option B — Digital Secretariat Slate  
**Current state:** Hero + quick resource badges + hardcoded exam updates feed. Missing: Breadcrumb, live data, Tabs, Accordion.

> [!IMPORTANT]
> This is a server component (`async` function). Tabs and Accordion are client components — wrap them in a separate `"use client"` child or import directly (Next.js handles it automatically since they are already marked `"use client"`).

### 1.1 — Add Breadcrumb at top
Add as first element inside the `<div className="max-w-5xl...">` wrapper:
```tsx
import Breadcrumb from "../_components/Breadcrumb";

// Add BEFORE the hero banner div:
<Breadcrumb items={[{ label: "Student & Exam Resources" }]} />
```

### 1.2 — Hero Banner stat badges (countdown chips)
Inside the hero `<div className="bg-[#0F172A]...">`, after the main badge row but BEFORE the description `<p>`, add:
```tsx
{/* Exam countdown stat row */}
<div className="flex items-center gap-3 flex-wrap pt-1">
  <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full font-semibold">
    🎟️ DSC Hall Tickets: Active
  </span>
  <span className="font-mono text-[10px] bg-tamarind/20 text-tamarind border border-tamarind/30 px-2.5 py-1 rounded-full font-semibold">
    📘 AP TET 2026: Apply Open
  </span>
  <span className="font-mono text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full font-semibold">
    📚 SCERT Books: PDF Ready
  </span>
</div>
```

### 1.3 — Add "Quick Jump" Tab Bar
This wraps the entire content below the quick-resource badges. The page needs to become a `"use client"` component OR you extract the tabbed section into a separate client component file called `EducationTabs.tsx`:

**Create new file:** `app/(public)/education/_components/EducationTabs.tsx`
```tsx
"use client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../_components/Tabs";
import { Card } from "../../_components/Card";
import Badge from "../../_components/Badge";
import Button from "../../_components/Button";
import Link from "next/link";

// Accept examUpdates and quickResources as props
export default function EducationTabs({ examUpdates, quickResources }: { examUpdates: any[], quickResources: any[] }) {
  return (
    <Tabs defaultValue="all">
      <TabsList>
        <TabsTrigger value="all">All Updates</TabsTrigger>
        <TabsTrigger value="hall-ticket">🎟️ Hall Tickets</TabsTrigger>
        <TabsTrigger value="textbooks">📚 Textbooks</TabsTrigger>
        <TabsTrigger value="exam-schedule">📅 Exam Schedule</TabsTrigger>
        <TabsTrigger value="results">🏆 Results</TabsTrigger>
      </TabsList>

      <TabsContent value="all">
        <div className="space-y-4">
          {examUpdates.map((item, idx) => (
            // ... same card JSX as current EXAM_UPDATES.map()
          ))}
        </div>
      </TabsContent>
      {/* other TabsContent panels */}
    </Tabs>
  );
}
```

### 1.4 — Replace hardcoded EXAM_UPDATES with live Prisma data
In `education/page.tsx`, add Prisma query at top (page is already `async`):
```tsx
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export default async function EducationPage() {
  let examPosts: any[] = [];
  try {
    examPosts = await prisma.post.findMany({
      where: {
        isDraft: false,
        category: {
          slug: { in: ["education", "exams", "hall-tickets", "textbooks"] },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true, slug: true, titleEn: true, titleTe: true,
        statusBadge: true, createdAt: true,
        category: { select: { nameEn: true, slug: true } },
      },
    });
  } catch (e) {
    examPosts = [];
  }
  // fallback to EXAM_UPDATES static array if examPosts is empty
  const displayPosts = examPosts.length > 0 ? examPosts : EXAM_UPDATES;
  // ...rest of component
```

### 1.5 — Add "Upcoming Exams" Accordion below the feed
After the `EXAM_UPDATES` section, add:
```tsx
import Accordion from "../_components/Accordion";

{/* Upcoming Exams FAQ Accordion */}
<div className="space-y-3">
  <h2 className="text-section text-ink flex items-center gap-2">
    <span>📅</span> Upcoming Exam Schedule
  </h2>
  <Accordion allowMultiple items={[
    {
      id: "dsc-2026",
      titleEn: "AP Mega DSC 2026 — Exam Schedule",
      titleTe: "ఆంధ్రప్రదేశ్ మెగా డిఎస్‌సి 2026 — పరీక్ష షెడ్యూల్",
      badge: "Mega DSC",
      badgeVariant: "tamarind",
      defaultOpen: true,
      content: (
        <div className="space-y-2 text-xs font-mono">
          <div><span className="text-inkSoft">Written Exam:</span> Aug–Sep 2026</div>
          <div><span className="text-inkSoft">Hall Tickets:</span> Active — Download from apssc.ap.gov.in</div>
          <div><span className="text-inkSoft">Posts:</span> 16,347 SGT / SA / LP vacancies</div>
          <div><span className="text-inkSoft">Results Expected:</span> Nov 2026</div>
        </div>
      ),
    },
    {
      id: "tet-2026",
      titleEn: "AP TET 2026 — Application & Syllabus",
      titleTe: "ఆంధ్రప్రదేశ్ టెట్ 2026 — దరఖాస్తు మరియు పాఠ్యప్రణాళిక",
      badge: "AP TET",
      badgeVariant: "turmeric",
      content: (
        <div className="space-y-2 text-xs font-mono">
          <div><span className="text-inkSoft">Apply At:</span> aptet.apcfss.in</div>
          <div><span className="text-inkSoft">Paper I:</span> Classes I–V (Child Dev + Lang + Math + EVS)</div>
          <div><span className="text-inkSoft">Paper II:</span> Classes VI–VIII (Child Dev + Lang + Subject)</div>
          <div><span className="text-inkSoft">Validity:</span> Lifetime</div>
        </div>
      ),
    },
    {
      id: "ssc-2027",
      titleEn: "SSC (Class 10) Board Exams 2027 — Timetable",
      badge: "SSC",
      badgeVariant: "neutral",
      content: (
        <p className="text-xs font-mono">
          Board exam timetable for March 2027 expected in Dec 2026. Model papers available via SCERT portal.
        </p>
      ),
    },
  ]} />
</div>
```

---

## 📁 Task 2 — `/tools/page.tsx` (Option C Polish) 🧮

**File:** [`app/(public)/tools/page.tsx`](file:///c:/Users/sikha/Music/Aphighschool/portal-cms/app/(public)/tools/page.tsx)  
**Theme:** Option C — Heritage Craft Royal Indigo  
**Current state:** Hero + Card grid. Missing: Privacy strip, step indicators, FAQ accordion, "Most Used" badge.

### 2.1 — Add Privacy Shield strip below hero
After the closing `</div>` of the hero section and BEFORE the card grid `<div className="grid...">`:
```tsx
{/* Privacy shield info strip */}
<div className="bg-[#FAF7F2] border border-amber-200/60 rounded-xl px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
  <div className="flex items-center gap-2 font-mono text-xs text-inkSoft">
    <span className="text-amber-600 text-base">🔒</span>
    <span>100% Client-Side · No Server Calls · No Financial Data Stored</span>
  </div>
  <span className="font-mono text-[10px] font-semibold text-turmericDeep bg-turmeric/10 border border-turmeric/30 px-2.5 py-1 rounded-full">
    Privacy First
  </span>
</div>
```

### 2.2 — Add "⭐ Most Used" chip to Tax Calculator card
In the `TOOLS` array, the first item (`tax-calculator`) has `popular: true`. Update the card's badge row to show an extra chip when `tool.popular === true`:
```tsx
{/* Add inside the flex row with the icon and badge, after the Badge */}
{tool.popular && (
  <span className="font-mono text-[9px] font-bold bg-amber-400/20 text-amber-700 border border-amber-300/50 px-2 py-0.5 rounded-full">
    ⭐ Most Used
  </span>
)}
```

### 2.3 — Add step-count indicators inside each tool card
After the `<p className="text-xs text-inkSoft font-mono...">{tool.desc}</p>` and BEFORE the CTA `<div className="pt-2 flex justify-end">`:
```tsx
{/* Step flow chips */}
<div className="flex items-center gap-1.5 flex-wrap pt-1">
  {["Fill Details", "Auto-Calculate", "Export PDF"].map((step, i) => (
    <span key={i} className="inline-flex items-center gap-1 font-mono text-[9px] bg-[#1B2A4A]/5 text-[#1B2A4A] border border-[#1B2A4A]/15 px-2 py-0.5 rounded">
      <span className="font-bold">{i + 1}</span>
      <span className="text-inkSoft/60">·</span>
      {step}
    </span>
  ))}
</div>
```

### 2.4 — Add FAQ Accordion at bottom of tools page
After the card grid `</div>`, add:
```tsx
import Accordion from "../_components/Accordion";

{/* FAQ Section */}
<div className="space-y-3 pt-4 border-t border-hair">
  <h2 className="text-section text-ink flex items-center gap-2">
    <span>❓</span> Frequently Asked Questions
  </h2>
  <Accordion allowMultiple items={[
    {
      id: "faq-tax",
      titleEn: "Which tax regime should AP teachers choose in FY 2025-26?",
      titleTe: "ఆయవ్యయ సంవత్సరం 2025-26లో ఏ పన్ను నియమావళి ఎంచుకోవాలి?",
      badge: "Tax",
      badgeVariant: "turmeric",
      defaultOpen: true,
      content: (
        <p>
          For AP teachers with standard HRA and 80C deductions, the Old Regime is usually better 
          if total deductions exceed ₹2.5 lakh. Use our calculator to compare both regimes instantly.
        </p>
      ),
    },
    {
      id: "faq-el",
      titleEn: "How many days of Earned Leave can I surrender per year?",
      titleTe: "సంవత్సరానికి ఎన్ని రోజుల ఆర్జిత సెలవులు వదులుకోవచ్చు?",
      badge: "Leave",
      badgeVariant: "neutral",
      content: (
        <p>
          AP teachers can surrender up to 15 days of EL per year while in service 
          and up to 30 days at retirement. HPL encashment is applicable only at superannuation.
        </p>
      ),
    },
    {
      id: "faq-gpf",
      titleEn: "What is the current GPF interest rate for AP teachers?",
      badge: "GPF",
      badgeVariant: "neutral",
      content: (
        <p>
          The current GPF interest rate is <strong>7.1% per annum</strong>, compounded annually. 
          The balance grows on a monthly credit basis with final interest calculated at year end.
        </p>
      ),
    },
    {
      id: "faq-cfms",
      titleEn: "How do I check my CFMS bill status or download my payslip?",
      badge: "CFMS",
      badgeVariant: "tamarind",
      content: (
        <p>
          Use our CFMS Bill Status guide to navigate directly to the DDO submission portal 
          and the payslip download section. No login needed for bill status — only Employee ID required.
        </p>
      ),
    },
  ]} />
</div>
```

---

## 📁 Task 3 — `/orders/page.tsx` (Option A Polish) 📜

**File:** [`app/(public)/orders/page.tsx`](file:///c:/Users/sikha/Music/Aphighschool/portal-cms/app/(public)/orders/page.tsx)  
**Theme:** Option A — Imperial Navy Gazette  
**Current state:** Gazette masthead + category card grid. Missing: Breadcrumb, filter Tabs, recently added strip, search CTA.

> [!IMPORTANT]
> The Tabs component is `"use client"`. Since `orders/page.tsx` is a server component, extract the Tabs filter into a `OrdersFilterTabs.tsx` client component.

### 3.1 — Add Breadcrumb at top
First child inside the `<div className="max-w-5xl mx-auto space-y-8 pb-24 font-sans">`:
```tsx
import Breadcrumb from "@/app/(public)/_components/Breadcrumb";

<Breadcrumb items={[{ label: "Orders & Circulars" }]} />
```

### 3.2 — Add Search CTA button inside hero masthead
Inside the hero content area (`<div className="px-6 py-7...">`), after the bilingual headline block `</div>` and BEFORE the `<p className="text-sm text-white/60...">`:
```tsx
{/* Search shortcut inside hero */}
<div className="flex items-center gap-3 pt-1">
  <Link href="/search?type=go">
    <Button variant="outline" size="sm" leftIcon={<span>🔍</span>} rightIcon={<span>→</span>}>
      Search All Orders
    </Button>
  </Link>
</div>
```
> Note: `variant="outline"` renders with white border/text on dark bg — works well on `#1B2A4A`. If not visible, use inline style: `className="border-white/40 text-white hover:bg-white/10"`.

### 3.3 — Add "Recently Added" horizontal scroll strip
After the hero `</div>` and BEFORE the category card grid, query last 5 posts in `OrdersPage`:
```tsx
// Add to Prisma query in OrdersPage — add this additional query:
let recentPosts: any[] = [];
try {
  recentPosts = await prisma.post.findMany({
    where: { isDraft: false },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, slug: true, titleEn: true, goReference: true, createdAt: true },
  });
} catch (e) { recentPosts = []; }

// JSX — insert before the category grid:
{recentPosts.length > 0 && (
  <div className="space-y-2">
    <h2 className="font-mono text-[10px] uppercase tracking-widest text-inkSoft font-semibold">
      🕐 Recently Added
    </h2>
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {recentPosts.map((post) => (
        <Link key={post.id} href={`/posts/${post.slug}`} className="shrink-0">
          <div className="bg-[#FAF7F2] border border-hair hover:border-[#1B2A4A]/40 rounded-lg px-3 py-2 flex items-center gap-2 transition-all group min-w-fit">
            {post.goReference && (
              <span className="font-mono text-[10px] font-bold text-[#1B2A4A] bg-[#1B2A4A]/10 px-1.5 py-0.5 rounded shrink-0">
                {post.goReference}
              </span>
            )}
            <span className="font-mono text-[10px] text-inkSoft max-w-[160px] truncate group-hover:text-tamarind transition-colors">
              {post.titleEn}
            </span>
            <span className="font-mono text-[9px] text-inkSoft/50 shrink-0">
              {new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </span>
          </div>
        </Link>
      ))}
    </div>
  </div>
)}
```

### 3.4 — Add Document Type Filter Tabs (client component)
**Create:** `app/(public)/orders/_components/OrdersFilterTabs.tsx`
```tsx
"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../_components/Tabs";
import Link from "next/link";
import Badge from "../../_components/Badge";

const DOCTYPE_ICON: Record<string, string> = {
  go: "📜", memo: "📋", circular: "🔄", proceedings: "⚖️", notification: "🔔", default: "📄",
};

type CategoryData = {
  id: string; nameEn: string; nameTe: string; slug: string; icon: string; color?: string | null;
  _count: { posts: number };
  posts: { id: string; slug: string; titleEn: string; goReference?: string | null; statusBadge: string; createdAt: Date }[];
};

export default function OrdersFilterTabs({ categories }: { categories: CategoryData[] }) {
  // Map category icons to tab values for filtering
  const DOC_TYPE_TABS = [
    { value: "all", label: "All" },
    { value: "go", label: "G.O.s", icon: "📜" },
    { value: "memo", label: "Memos", icon: "📋" },
    { value: "proceedings", label: "Proceedings", icon: "⚖️" },
    { value: "circular", label: "Circulars", icon: "🔄" },
    { value: "notification", label: "Notifications", icon: "🔔" },
  ];

  return (
    <Tabs defaultValue="all">
      <TabsList className="overflow-x-auto">
        {DOC_TYPE_TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.icon && <span>{tab.icon}</span>} {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {DOC_TYPE_TABS.map((tab) => {
        const filtered = tab.value === "all"
          ? categories
          : categories.filter((c) => c.icon === tab.value);

        return (
          <TabsContent key={tab.value} value={tab.value}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filtered.length > 0 ? (
                filtered.map((cat) => {
                  // ... same category card JSX as currently in orders/page.tsx
                  // Copy the entire card block from the current .map() in orders/page.tsx
                  const icon = DOCTYPE_ICON[cat.icon] || DOCTYPE_ICON.default;
                  const count = cat._count?.posts || 0;
                  return (
                    <div key={cat.id} className="group bg-[#FAF7F2] border border-hair/70 rounded-2xl overflow-hidden hover:shadow-md hover:border-[#1B2A4A]/30 transition-all">
                      {/* Card Header */}
                      <div className="px-5 py-4 border-b border-hair/60 flex items-center justify-between"
                        style={{ borderLeftColor: cat.color || "#C9973A", borderLeftWidth: 4 }}>
                        <div className="flex items-center gap-3">
                          <span className="text-xl" aria-hidden="true">{icon}</span>
                          <div>
                            <h2 className="font-bold text-[#1B2A4A] text-sm tracking-tight group-hover:text-tamarind transition-colors">{cat.nameEn}</h2>
                            <div className="text-xs text-inkSoft" style={{ fontFamily: "'Noto Sans Telugu', sans-serif", lineHeight: "1.6" }}>{cat.nameTe}</div>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-bold text-[#1B2A4A] bg-[#1B2A4A]/10 px-2.5 py-1 rounded-full">{count} docs</span>
                      </div>
                      {/* Recent posts preview */}
                      <div className="px-5 py-3 space-y-2.5 min-h-[96px]">
                        {cat.posts && cat.posts.length > 0 ? cat.posts.map((post) => (
                          <Link key={post.id} href={`/posts/${post.slug}`} className="flex items-start justify-between gap-2 group/item">
                            <span className="text-xs text-ink font-medium leading-snug line-clamp-1 group-hover/item:text-tamarind transition-colors flex-1">{post.titleEn}</span>
                            {post.goReference && (
                              <span className="font-mono text-[10px] text-inkSoft shrink-0 bg-hair/50 px-1.5 py-0.5 rounded">{post.goReference}</span>
                            )}
                          </Link>
                        )) : (
                          <p className="text-xs font-mono text-inkSoft/60 pt-1">No documents yet.</p>
                        )}
                      </div>
                      {/* Footer CTA */}
                      <Link href={`/category/${cat.slug}`} className="block">
                        <div className="px-5 py-3 border-t border-hair/60 bg-[#F3EFE6] group-hover:bg-[#1B2A4A] transition-colors flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-[#1B2A4A] group-hover:text-white transition-colors">View All {count} Documents</span>
                          <span className="text-[#1B2A4A] group-hover:text-amber-300 transition-colors font-mono text-sm">→</span>
                        </div>
                      </Link>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs font-mono text-inkSoft col-span-2 py-4 text-center">No categories found for this document type.</p>
              )}
            </div>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
```

Then in `orders/page.tsx`, replace the current `<div className="grid grid-cols-1 md:grid-cols-2 gap-5">` block with:
```tsx
import OrdersFilterTabs from "./_components/OrdersFilterTabs";

<OrdersFilterTabs categories={categories} />
```

---

## 📁 Task 4 — `/posts/[slug]/page.tsx` (Option A — Already Done, Audit) 📄

**File:** [`app/(public)/posts/[slug]/page.tsx`](file:///c:/Users/sikha/Music/Aphighschool/portal-cms/app/(public)/posts/%5Bslug%5D/page.tsx)  
**Status:** ✅ Mostly done. Breadcrumb ✅, GOIR badge ✅, GO Reference ✅, Related Orders ✅, PDF CTA ✅.

### 4.1 — Audit Breadcrumb JSON-LD URL (hardcoded localhost)

**File:** [`app/(public)/_components/Breadcrumb.tsx`](file:///c:/Users/sikha/Music/Aphighschool/portal-cms/app/(public)/_components/Breadcrumb.tsx), **Line 25**

Current (wrong for production):
```tsx
item: item.href ? `http://localhost:3000${item.href}` : undefined,
```

Replace with:
```tsx
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
// inside jsonLd:
item: item.href ? `${siteUrl}${item.href}` : undefined,
```

### 4.2 — Check "Related G.O.s" section at bottom of post
Currently uses `post.relatedFrom` (posts linked via the `PostRelation` model). This works — but verify `relatedFrom` items show even when relation is `approved: true`. If relations aren't being approved in CMS, change the Prisma query filter:

```tsx
// Current (line 73–74 of posts/[slug]/page.tsx):
where: { approved: true },

// If relations aren't showing, temporarily change to:
// where: { approved: true }, // keep this but ensure CMS sets approved: true
```

### 4.3 — Add "Same Category" posts section (new: sibling G.O.s)
After the existing `relatedFrom` section and BEFORE the PDF CTA card, add a new sibling query in the server component:
```tsx
// Add to prisma query: fetch 3 sibling posts from same category
let siblingPosts: any[] = [];
if (post.category) {
  try {
    siblingPosts = await prisma.post.findMany({
      where: {
        isDraft: false,
        categoryId: post.category.id,
        id: { not: post.id },   // exclude current post
      },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: { id: true, slug: true, titleEn: true, goReference: true, createdAt: true },
    });
  } catch (e) { siblingPosts = []; }
}

// JSX block:
{siblingPosts.length > 0 && (
  <section aria-label="More from this category" className="space-y-3">
    <div className="font-mono font-bold text-xs tracking-wider text-inkSoft flex items-center gap-2">
      <span>📂 More from {post.category.nameEn}</span>
    </div>
    <div className="space-y-2">
      {siblingPosts.map((sibling) => (
        <Card key={sibling.id} hoverable className="p-4 bg-[#FAF7F2]">
          <Link href={`/posts/${sibling.slug}`} className="block group space-y-0.5">
            <div className="flex items-center justify-between text-meta text-inkSoft">
              <span className="font-bold text-tamarind">{sibling.goReference || "G.O."}</span>
              <span>{new Date(sibling.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
            </div>
            <div className="text-card-title text-ink group-hover:text-tamarind transition-colors line-clamp-2">
              {sibling.titleEn}
            </div>
          </Link>
        </Card>
      ))}
    </div>
  </section>
)}
```

---

## 📁 Task 5 — Shared Components 🧩

### 5.1 — `BottomNav.tsx` — Add `/education` nav item
**File:** [`app/(public)/_components/BottomNav.tsx`](file:///c:/Users/sikha/Music/Aphighschool/portal-cms/app/(public)/_components/BottomNav.tsx)

Currently `/education` is NOT in the bottom nav — only: Home, Orders, Search, Tools.
Add Education between Orders and Search:
```tsx
{
  href: "/education",
  label: "Exams",
  exact: false,
  icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
    </svg>
  ),
},
```
> This makes 5 nav items — adjust padding if needed: `py-1 px-1` and reduce icon size to `w-4 h-4` if cramped on small screens.

### 5.2 — `layout.tsx` — Active nav link highlighting on desktop
**File:** [`app/(public)/layout.tsx`](file:///c:/Users/sikha/Music/Aphighschool/portal-cms/app/(public)/layout.tsx)

The desktop nav `<nav>` currently has static `text-inkSoft` links. To add active state, extract just the nav links into a `"use client"` component:

**Create:** `app/(public)/_components/DesktopNav.tsx`
```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Home", exact: true },
  { href: "/orders", label: "Orders & Circulars", exact: false },
  { href: "/education", label: "Student & Exams", exact: false },
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
```

Then in `layout.tsx`, replace the current `<nav className="hidden lg:flex...">...</nav>` block with:
```tsx
import DesktopNav from "./_components/DesktopNav";
// ...
<DesktopNav />
```

---

## 🧪 Verification Checklist

### Commands to run after each task
```bash
# Type check (run from portal-cms directory)
npx tsc --noEmit

# Start dev server
npm run dev
```

### Visual QA per route
| Check | `/orders` | `/education` | `/tools` | `/posts/[slug]` |
|---|---|---|---|---|
| Breadcrumb visible | ✓ | ✓ | ✓ (already done) | ✓ |
| Hero uses correct bg | `#1B2A4A` | `#0F172A` | `#1B2A4A` | `#1B2A4A` |
| Hero badge correct | "GOIR Verified" `success` | "Digital Secretariat Hub" `tamarind` | "Heritage Craft Utility Suite" `turmeric` | "GOIR Verified" `success` |
| Telugu text visible | amber-300 | emerald-400 | amber-200 | amber-300 |
| Cards use correct surface | `#FAF7F2` | `#1E293B` | `#FAF7F2` | `#FAF7F2` |
| Card hover colour | `#1B2A4A/30` | `emerald-500/50` | `ink/30` | `tamarind` |
| Bottom nav active | ✓ | ✓ | ✓ | — |
| Desktop nav active | ✓ | ✓ | ✓ | — |
| Mobile (375px) no overflow | ✓ | ✓ | ✓ | ✓ |
| Accordion opens/closes | — | ✓ | ✓ | — |
| Tabs switch content | ✓ | ✓ | — | — |

### SEO check
```
https://search.google.com/test/rich-results
→ Test with /orders, /education, /posts/[any-slug]
→ BreadcrumbList schema should appear
```

---

## 📋 Recommended Implementation Order

```
Day 1 — Quick wins (no new files)
  ✦ 5.2  Fix Breadcrumb.tsx JSON-LD URL (2 min)
  ✦ 3.1  Add Breadcrumb to /orders (2 min)
  ✦ 1.1  Add Breadcrumb to /education (2 min)
  ✦ 2.1  Add Privacy strip to /tools (5 min)
  ✦ 2.2  Add ⭐ Most Used chip to Tax Calculator (3 min)
  ✦ 2.3  Add step chips to tool cards (5 min)
  ✦ 1.2  Add exam status chips to education hero (5 min)

Day 2 — New components
  ✦ 5.2  Create DesktopNav.tsx + update layout.tsx (15 min)
  ✦ 5.1  Add /education to BottomNav (5 min)
  ✦ 3.2  Add "Recently Added" scroll strip to /orders (10 min)
  ✦ 3.4  Create OrdersFilterTabs.tsx + wire to orders page (20 min)
  ✦ 2.4  Add FAQ Accordion to /tools (10 min)
  ✦ 1.5  Add Upcoming Exams Accordion to /education (10 min)

Day 3 — Data & polish
  ✦ 1.3  Create EducationTabs.tsx + wire to education page (20 min)
  ✦ 1.4  Replace hardcoded EXAM_UPDATES with Prisma query (15 min)
  ✦ 4.3  Add sibling G.O.s section to post detail page (15 min)
  ✦ 4.1  Verify post page Breadcrumb + category crumb (5 min)
  ✦ Run full QA checklist above
```
