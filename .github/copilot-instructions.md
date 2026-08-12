# AP Teacher Desk — GitHub Copilot & AI Coding Instructions

Welcome! This codebase is **AP Teacher Desk**, a production Next.js 14 Web Portal & CMS designed for Andhra Pradesh & Telangana School Education Teachers.

---

## 🏗️ 1. Architecture & Core Tech Stack

- **Framework:** Next.js 14 App Router (`app/(public)/`, `app/admin/`, `app/api/`)
- **Language:** TypeScript (Strict mode)
- **Database & ORM:** PostgreSQL 18 with Prisma ORM (`@prisma/client`, `prisma/schema.prisma`)
- **Styling:** Tailwind CSS with custom design system tokens (`ink`, `inkSoft`, `turmeric`, `tamarind`, `kumkum`, `paper`, `paperRaised`, `hair`)
- **Typography:**
  - `font-sans`: `Noto Sans` (English text & headings)
  - `font-telugu`: `Noto Sans Telugu` (Bilingual Telugu headlines & summaries)
  - `font-mono`: `IBM Plex Mono` (G.O. reference numbers, dates, status badges, calculation math)
- **Python Scraper Engine:** Located in `/scraper/` (BeautifulSoup4 + Requests + OpenAI API summary engine)

---

## 🎨 2. Component Design System Rules (MANDATORY)

Never write raw inline HTML buttons or custom raw card containers when building or modifying UI pages. Always use the project's Tier 1 & Tier 2 component library from `@/app/(public)/_components/`:

- **`<Button>`:** Standardized buttons (`variant="primary | secondary | tamarind | turmeric | ghost | danger | outline"`, `size="sm | md | lg"`).
- **`<Card>`:** Container cards (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`, with optional `hoverable`).
- **`<Badge>`:** Status indicators (`variant="tamarind | turmeric | neutral | success | warning | dark"`, `size="sm | md"`, `shape="pill | rounded"`, `dot`).
- **`<Field>` & `<Input>`:** Monospaced form inputs with error handling and bilingual label support.
- **`<NativeSelect>`:** Styled HTML `<select>` triggers native wheel pickers on mobile devices.
- **`<Accordion>`:** Collapsible FAQ and G.O. breakdown accordion panels.
- **`<Breadcrumb>`:** Structured navigation (`Home › Orders › Category › Title`) with Google `BreadcrumbList` JSON-LD schema.
- **`<Sheet>`:** Slide-over drawer component for mobile search filters and navigation drawers.
- **`<Table>`:** Responsive data table component system (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`).
- **`<Tabs>`:** Accessible tab controls (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`).

---

## 📖 3. Typography & Bilingual Language Rules

1. **Telugu Line-Height Clearance:** Telugu script characters (`Noto Sans Telugu`) require a minimum line-height of `leading-relaxed` (`1.75`) to avoid clipping vertical vowel diacritics. Always use `.text-telugu-title` or `.text-telugu-body` utility classes.
2. **Metadata Tokens:** All numbers, dates, financial calculations, and G.O. reference IDs MUST use monospaced typography (`font-mono` / `.text-meta`).
3. **Display Titles:** Main page titles MUST use `.text-display` (`28px` desktop / `22px` mobile bold).

---

## ⚡ 4. Client-Side Tools & Privacy Guidelines

- Utility calculators (`/tools/tax-calculator`, `/tools/leave-encashment`, `/tools/gpf-apgli`, `/tools/cfms-checker`) MUST run **100% client-side**.
- Never send sensitive teacher financial inputs (Basic Pay, DA, HRA, GPF balance) to remote APIs.

---

## 🐍 5. Python Scraper & AI Engine Rules (`/scraper`)

- BeautifulSoup scrapers MUST check for HTTP `status_code == 200` before parsing DOM trees.
- OpenAI API completions MUST use structured JSON schemas or parse output strictly into 3-bullet Telugu summaries.
- Database mutations in Python MUST use parameterized SQL (`psycopg2`) to prevent SQL injection.

---

## ✅ 6. Verification Checklist Before Committing

1. Always run `npx tsc --noEmit` to verify type safety.
2. Ensure no duplicate imports or unused variables exist.
3. Test both mobile (`375px`) and widescreen desktop (`1920px`) viewports.
