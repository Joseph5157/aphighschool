# AP Teacher Desk — Audit Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the portal back inside its AP-teachers-only scope, make publishing deliberate and authenticated, stop the site from asserting facts it cannot support (fake verification, fake dates, fake lifecycle stages), and put a test harness under all of it.

**Architecture:** Eight milestones executed in order. Milestone A closes the security and scope holes that are exploitable or misleading today. B makes the CMS pipeline safe. C changes the data model (the only irreversible milestone — it is gated behind a backup). D–E fix data reliability and search. F–G normalise the visual and accessibility layers. H is the release gate. Test infrastructure is Task 1 so every later task can be written test-first.

**Tech Stack:** Next.js 14 App Router, React 18, Prisma 5 + PostgreSQL 16, NextAuth 4 (Credentials), Tailwind 3, TypeScript 5. Added by this plan: Vitest + Testing Library (tests), bcryptjs (password hashing). No other new runtime dependencies.

**Spec:** The audit findings and the eight-phase remediation plan agreed in conversation on 2026-08-24, as corrected during plan review. Binding project context lives in `AGENTS.md` — read it before Task 1.

## Global Constraints

Copied verbatim from `AGENTS.md`. Every task's requirements implicitly include this section.

- **Scope — geography:** AP only. Do not add Telangana fields, routes, or content assumptions.
- **Scope — department:** Teachers / School Education only. Do not generalise the schema toward "all government employees".
- **Quality over speed. Always.** There is no publishing SLA. If a choice trades accuracy or completeness for faster shipping, take the slower option.
- **Never** build a feature that transcribes tabular/numeric data (PTR tables, pay scales, eligibility criteria) out of a PDF into post text.
- **Never** add a publishing deadline, SLA, or "must publish within X minutes" logic anywhere in the code.
- **Never** wire up WhatsApp or push notification integrations.
- **Styling tokens:** use `ink`, `inkSoft`, `turmeric`, `turmericDeep`, `tamarind`, `kumkum`, `paper`, `paperRaised`, `hair` from `tailwind.config.js`. Not raw hex, not default Tailwind colours.
- **Fonts:** Space Grotesk (English/UI), Noto Sans Telugu (`.font-telugu` — never substitute or auto-transliterate Telugu text), IBM Plex Mono (`.font-mono` — metadata, dates, GO numbers, status labels).
- **PDF storage:** Google Drive links. Do not build R2/S3 upload flows.
- **Auth:** single admin account. Do not build multi-user/role management.
- **Deploy target:** Vercel for the app; Railway for Postgres + Redis only.
- **Success metric:** reputation as the reliable, accurate source — not traffic, not engagement. No streaks, notification nudges, or infinite scroll.

## Known Coupling (read before Milestones E and F)

Two milestones depend on decisions made earlier and will need re-derivation if those decisions change:

1. **Milestone E (search)** consumes the `documentDate` column and the `DocType` enum created in Milestone C. If Milestone C lands differently than written, re-read Tasks 12–14 before starting Task 17.
2. **Milestone F (visual system)** assumes the token set is unchanged and that `darkMode: "class"` is the chosen strategy. If Milestone F Task 20 instead removes dark mode, Tasks 20b and 21 collapse to a deletion.

## File Structure

**Created by this plan**

| File | Responsibility |
|---|---|
| `vitest.config.mts` | Test runner config; jsdom default, `.env.test` loading |
| `test/setup.ts` | Testing Library matchers, global test setup |
| `test/db.ts` | Test-database helpers: `resetDb()`, `seedCategory()`, `makePost()` |
| `lib/auth-guard.ts` | `requireAdmin()` — server-action authorisation |
| `lib/validation/post.ts` | Pure validators for post input; no Prisma, no React |
| `lib/posts/query.ts` | All public post reads in one place (draft filter, ordering, search) |
| `lib/posts/lifecycle.ts` | Maps a post to its correct lifecycle presentation |
| `lib/posts/revalidate.ts` | `revalidatePostPaths()` — every public surface one post touches |
| `lib/db-safe.ts` | `safeQuery()` — distinguishes DB failure from empty result |
| `lib/dates.ts` | `officialDate()` + `dateLabel()` — the documentDate/createdAt fallback rule |
| `app/(public)/_components/OrderStateBadge.tsx` | Non-recruitment document state display |
| `app/(public)/error.tsx` | Public-route error boundary (replaces silent empty feeds) |
| `prisma/backup.ts` | Pre-migration `pg_dump` wrapper |
| `prisma/backfill-document-type.ts` | One-shot backfill script for Milestone C |
| `scripts/hash-password.ts` | Generates the bcrypt hash for `ADMIN_PASSWORD_HASH` |
| `test/link-crawl.test.ts` | Asserts every internal href resolves to a real route or slug |
| `docs/RELEASE-CHECKLIST.md` | The manual gate run before every deploy |

**Modified by this plan** — `package.json`, `tailwind.config.js`, `app/globals.css`, `middleware.ts`, `lib/auth.ts`, `lib/prisma.ts`, `prisma/schema.prisma`, `prisma/seed.ts`, `app/actions/posts.ts`, `app/layout.tsx`, `app/(public)/layout.tsx`, `app/(public)/page.tsx`, `app/(public)/orders/page.tsx`, `app/(public)/search/page.tsx`, `app/(public)/search/_components/SearchUI.tsx`, `app/(public)/category/[slug]/page.tsx`, `app/(public)/posts/[slug]/page.tsx`, `app/(public)/posts/[slug]/_components/LifecycleStepper.tsx`, `app/(public)/_components/DesktopNav.tsx`, `app/(public)/_components/BottomNav.tsx`, `app/(public)/_components/DesktopLeftNav.tsx`, `app/(public)/_components/Button.tsx`, `app/admin/posts/_components/PostFormClient.tsx`.

**Deleted by this plan** — `app/(public)/education/` (whole directory), `app/(public)/_components/AdSlot.tsx`.

---

# Milestone A — Stop the bleeding (security + scope)

Nothing here touches the database schema. Every task is revertible with `git revert`.

---

### Task 1: Test harness

There is no test runner in this project today. This task creates one; every task after it is written test-first.

**Files:**
- Create: `vitest.config.mts`
- Create: `test/setup.ts`
- Create: `test/db.ts`
- Create: `.env.test`
- Modify: `package.json`
- Modify: `.env.example` (DATABASE_URL line)

**Interfaces:**
- Consumes: nothing.
- Produces: `resetDb(): Promise<void>`, `seedCategory(slug?: string): Promise<Category>`, `makePost(overrides?: PostOverrides): Promise<Post>` from `test/db.ts`. Scripts `npm test` (single run) and `npm run test:watch`.

- [ ] **Step 1: Install dependencies**

```bash
npm install -D vitest@^2.1.0 @vitejs/plugin-react@^4.3.0 jsdom@^25.0.0 @testing-library/react@^16.0.0 @testing-library/jest-dom@^6.5.0 @testing-library/user-event@^14.5.0
```

- [ ] **Step 2: Create the test database**

The dev Postgres in `docker-compose.yml` publishes host port **5433**, not 5432. `.env.example` currently says 5432 — that is a pre-existing typo, corrected in Step 7.

```bash
docker compose up -d db
docker compose exec db psql -U portal -d portal_dev -c "CREATE DATABASE portal_test;"
```

- [ ] **Step 3: Write `.env.test`**

This file holds no real secrets, so commit it — reproducible test runs matter more here than habit.

```
DATABASE_URL="postgresql://portal:portal_dev_password@localhost:5433/portal_test?schema=public"
NEXTAUTH_SECRET="test-secret-not-a-real-credential"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@test.local"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

- [ ] **Step 4: Write `vitest.config.mts`**

`loadEnv` ships with Vite, which Vitest already depends on — no extra package.

```ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(() => ({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    env: loadEnv("test", process.cwd(), ""),
    // DB-backed tests share one Postgres database, so test FILES must not run
    // concurrently: resetDb() in one would truncate a table another is using.
    // NOTE: poolOptions.threads.singleThread does NOT achieve this — Vitest 2.x
    // defaults `pool` to "forks", making that setting a no-op. fileParallelism
    // is pool-agnostic and survives a future change of default pool.
    fileParallelism: false,
  },
}));
```

- [ ] **Step 5: Write `test/setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Write `test/db.ts`**

```ts
import { PrismaClient } from "@prisma/client";

export const testDb = new PrismaClient();

export async function resetDb() {
  // Order matters: RelatedOrder holds foreign keys into Post.
  await testDb.relatedOrder.deleteMany();
  await testDb.post.deleteMany();
  await testDb.category.deleteMany();
}

export async function seedCategory(slug = "govt-orders") {
  return testDb.category.create({
    data: { nameEn: "Government Orders", nameTe: "ప్రభుత్వ ఉత్తర్వులు", slug },
  });
}

export type PostOverrides = Partial<{
  slug: string;
  titleEn: string;
  titleTe: string;
  summaryTe: string[];
  isDraft: boolean;
  goReference: string;
  categoryId: string | null;
  tags: string[];
}>;

let counter = 0;

export async function makePost(overrides: PostOverrides = {}) {
  counter += 1;
  return testDb.post.create({
    data: {
      slug: overrides.slug ?? `test-post-${counter}`,
      titleEn: overrides.titleEn ?? `Test Order ${counter}`,
      titleTe: overrides.titleTe ?? `పరీక్ష ఉత్తర్వు ${counter}`,
      summaryTe: overrides.summaryTe ?? ["పరీక్ష సారాంశం."],
      isDraft: overrides.isDraft ?? false,
      goReference: overrides.goReference ?? `G.O.Ms.No.${counter}`,
      categoryId: overrides.categoryId ?? null,
      tags: overrides.tags ?? [],
    },
  });
}
```

- [ ] **Step 7: Update `package.json` and fix the `.env.example` port**

Add to `scripts`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

In `.env.example`, change the `DATABASE_URL` port from `5432` to `5433` so it matches `docker-compose.yml`.

- [ ] **Step 8: Push the schema to the test database**

PowerShell:

```powershell
$env:DATABASE_URL="postgresql://portal:portal_dev_password@localhost:5433/portal_test?schema=public"; npx prisma db push
```

Record this command in `README.md` under a new "Running tests" heading, because it must be re-run after every schema change in Milestone C.

- [ ] **Step 9: Write a smoke test proving the harness works**

Create `test/harness.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makePost, testDb } from "./db";

describe("test harness", () => {
  beforeEach(resetDb);

  it("creates and reads a post against the test database", async () => {
    await makePost({ slug: "harness-check" });
    const found = await testDb.post.findUnique({ where: { slug: "harness-check" } });
    expect(found?.slug).toBe("harness-check");
  });

  it("resetDb clears posts between tests", async () => {
    expect(await testDb.post.count()).toBe(0);
  });
});
```

- [ ] **Step 10: Run the tests**

Run: `npm test`
Expected: PASS, 2 tests.

- [ ] **Step 11: Commit**

```bash
git add vitest.config.mts test/ package.json package-lock.json .env.test .env.example README.md
git commit -m "test: add Vitest harness with test database helpers"
```

---

### Task 2: Authorise server actions

`middleware.ts` protects `/admin/*` **routes**. Server actions are POST endpoints addressed by action ID — reachable without ever loading an admin route. None of the four actions in `app/actions/posts.ts` checks a session. This is the only audit finding that lets an outsider write to the database.

**Files:**
- Create: `lib/auth-guard.ts`
- Create: `test/auth-guard.test.ts`
- Modify: `app/actions/posts.ts` (all four exported actions)

**Interfaces:**
- Consumes: `authOptions` from `lib/auth.ts`.
- Produces: `requireAdmin(): Promise<void>` — resolves when a valid admin session exists, throws `Error("Unauthorized")` otherwise.

- [ ] **Step 1: Write the failing test**

Create `test/auth-guard.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const getServerSession = vi.fn();
vi.mock("next-auth", () => ({
  getServerSession: (...args: unknown[]) => getServerSession(...args),
}));
vi.mock("@/lib/auth", () => ({ authOptions: {} }));

import { requireAdmin } from "@/lib/auth-guard";

describe("requireAdmin", () => {
  beforeEach(() => getServerSession.mockReset());

  it("throws when there is no session", async () => {
    getServerSession.mockResolvedValue(null);
    await expect(requireAdmin()).rejects.toThrow("Unauthorized");
  });

  it("throws when the session has no user email", async () => {
    getServerSession.mockResolvedValue({ user: {} });
    await expect(requireAdmin()).rejects.toThrow("Unauthorized");
  });

  it("resolves for a session carrying an admin email", async () => {
    getServerSession.mockResolvedValue({ user: { email: "admin@test.local" } });
    await expect(requireAdmin()).resolves.toBeUndefined();
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- auth-guard`
Expected: FAIL — cannot resolve `@/lib/auth-guard`.

- [ ] **Step 3: Write `lib/auth-guard.ts`**

```ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Server actions are POST endpoints reachable independently of route middleware.
 * middleware.ts guards /admin routes; it does NOT guard actions. Every mutating
 * action must call this as its first statement.
 */
export async function requireAdmin(): Promise<void> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test -- auth-guard`
Expected: PASS, 3 tests.

- [ ] **Step 5: Call it from every action**

In `app/actions/posts.ts`, add the import and insert `await requireAdmin();` as the first statement of `createPost`, `publishPost`, `updatePost`, and `deletePost`:

```ts
import { requireAdmin } from "@/lib/auth-guard";

export async function createPost(formData: FormData) {
  await requireAdmin();
  const titleEn = String(formData.get("titleEn") || "");
  // ...rest of the existing body unchanged
}
```

Repeat verbatim for the other three. Do not wrap in try/catch — an unauthorised call must surface as an error, never a silent no-op.

- [ ] **Step 6: Verify types**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Manual check**

Start `npm run dev`. Logged out, confirm `/admin/posts` still redirects to `/admin/login`. Log in, confirm creating and deleting a post still works.

- [ ] **Step 8: Commit**

```bash
git add lib/auth-guard.ts test/auth-guard.test.ts app/actions/posts.ts
git commit -m "fix(security): require an admin session inside every post server action"
```

---

### Task 3: Hash the admin password

`lib/auth.ts` compares `credentials.password === process.env.ADMIN_PASSWORD` in plain text. The file's own comment says not to ship this.

**Files:**
- Modify: `lib/auth.ts` (the `authorize` callback and the leading comment)
- Modify: `.env.example` (admin credential block)
- Modify: `.env` (local only, never committed)
- Create: `scripts/hash-password.ts`
- Create: `test/auth.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: env var `ADMIN_PASSWORD_HASH` replaces `ADMIN_PASSWORD`. `authorize()` returns `{ id: "admin", email: string, name: "Admin" } | null`.

- [ ] **Step 1: Install bcryptjs**

Pure JavaScript, so no native build step — which matters for both Windows dev and Vercel.

```bash
npm install bcryptjs@^2.4.3
npm install -D @types/bcryptjs@^2.4.6
```

- [ ] **Step 2: Write the failing test**

Create `test/auth.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";

const PASSWORD = "correct-horse-battery-staple";

// IMPORTANT: reach the callback through `.options.authorize`, NOT
// `providers[0].authorize`. next-auth 4.x's Credentials() returns a permanent
// `authorize: () => null` STUB on the provider object and stashes the real
// config under `.options`; the stub is only overwritten inside parseProviders()
// during real request handling, which a unit test never triggers. Testing
// `providers[0].authorize` therefore asserts against a stub and always passes,
// proving nothing. Verified against node_modules/next-auth/providers/credentials.js
// and node_modules/next-auth/core/lib/providers.js.
function authorizeFn() {
  const provider = authOptions.providers[0] as unknown as {
    options: { authorize: (c: Record<string, string> | undefined) => Promise<unknown> };
  };
  return provider.options.authorize;
}

describe("admin credentials provider", () => {
  beforeAll(() => {
    process.env.ADMIN_EMAIL = "admin@test.local";
    process.env.ADMIN_PASSWORD_HASH = bcrypt.hashSync(PASSWORD, 10);
  });

  it("accepts the correct email and password", async () => {
    const user = await authorizeFn()({ email: "admin@test.local", password: PASSWORD });
    expect(user).toMatchObject({ id: "admin", email: "admin@test.local" });
  });

  it("rejects a wrong password", async () => {
    const user = await authorizeFn()({ email: "admin@test.local", password: "wrong" });
    expect(user).toBeNull();
  });

  it("rejects a wrong email", async () => {
    const user = await authorizeFn()({ email: "someone@else.com", password: PASSWORD });
    expect(user).toBeNull();
  });

  it("returns null when credentials are missing", async () => {
    const user = await authorizeFn()(undefined);
    expect(user).toBeNull();
  });
});
```

- [ ] **Step 3: Run it to make sure it fails**

Run: `npm test -- auth.test`
Expected: FAIL — `authorize` throws because it reads `ADMIN_PASSWORD`, which the test never sets.

- [ ] **Step 4: Rewrite the authorize callback in `lib/auth.ts`**

Add `import bcrypt from "bcryptjs";` at the top and replace the callback body with:

```ts
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const adminEmail = process.env.ADMIN_EMAIL;
        const adminHash = process.env.ADMIN_PASSWORD_HASH;

        if (!adminEmail || !adminHash) {
          throw new Error("ADMIN_EMAIL / ADMIN_PASSWORD_HASH not set in .env");
        }

        if (credentials.email !== adminEmail) return null;

        const ok = await bcrypt.compare(credentials.password, adminHash);
        if (!ok) return null;

        return { id: "admin", email: adminEmail, name: "Admin" };
      },
```

Update the leading comment so it states the hashed comparison is now in place, rather than warning that it is not.

- [ ] **Step 5: Run the tests**

Run: `npm test -- auth.test`
Expected: PASS, 4 tests.

- [ ] **Step 6: Add the hash-generation script**

Create `scripts/hash-password.ts`:

```ts
import bcrypt from "bcryptjs";

const password = process.argv[2];
if (!password) {
  console.error("Usage: npx tsx scripts/hash-password.ts <password>");
  process.exit(1);
}
console.log(bcrypt.hashSync(password, 10));
```

- [ ] **Step 7: Update `.env` and `.env.example`**

Generate a hash:

```bash
npx tsx scripts/hash-password.ts my-real-local-password
```

In `.env.example`, delete the `ADMIN_PASSWORD` line and add:

```
# Generate with: npx tsx scripts/hash-password.ts <password>
ADMIN_PASSWORD_HASH="replace-with-a-real-bcrypt-hash"
```

Do the same in your local `.env`, pasting the generated hash. Delete the old `ADMIN_PASSWORD` key from both files.

- [ ] **Step 8: Manual check**

Run `npm run dev`, go to `/admin/login`, log in with the plain password you hashed. Confirm success, then confirm a wrong password is rejected.

- [ ] **Step 9: Commit**

```bash
git add lib/auth.ts test/auth.test.ts scripts/hash-password.ts .env.example package.json package-lock.json
git commit -m "fix(security): replace plain-text admin password compare with bcrypt"
```

---

### Task 4: Restore the four-tab mobile nav and scope the desktop nav

`BottomNav.tsx` has five items; `IMPLEMENTATION_PLAN.md` line 662 states the intended set is Home, Orders, Search, Tools. `DesktopNav.tsx` lists "Student & Exams" as a primary section, which the AGENTS.md scope lock forbids.

**Files:**
- Modify: `app/(public)/_components/BottomNav.tsx` (the `NAV_ITEMS` array — remove the Exams entry)
- Modify: `app/(public)/_components/DesktopNav.tsx` (the `NAV_LINKS` array — remove the education entry)
- Create: `test/nav.test.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces: both nav components render exactly the four destinations `/`, `/orders`, `/search`, `/tools`.

- [ ] **Step 1: Write the failing test**

Create `test/nav.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import BottomNav from "@/app/(public)/_components/BottomNav";
import DesktopNav from "@/app/(public)/_components/DesktopNav";

const ALLOWED = ["/", "/orders", "/search", "/tools"];

function hrefs() {
  return screen.getAllByRole("link").map((a) => a.getAttribute("href"));
}

describe("public navigation scope", () => {
  it("bottom nav exposes exactly the four allowed destinations", () => {
    render(<BottomNav />);
    const found = hrefs();
    expect(found).toHaveLength(4);
    expect(new Set(found)).toEqual(new Set(ALLOWED));
  });

  it("bottom nav does not link to the education section", () => {
    render(<BottomNav />);
    expect(hrefs()).not.toContain("/education");
  });

  it("desktop nav does not link to the education section", () => {
    render(<DesktopNav />);
    expect(hrefs()).not.toContain("/education");
  });

  // Assert count AND set equality, not membership alone. A per-href
  // `expect(ALLOWED).toContain(href)` loop passes when a link goes MISSING
  // or is duplicated — it only catches additions. Both navs get the same
  // rigor so a silently dropped destination fails the suite.
  it("desktop nav exposes exactly the four allowed destinations", () => {
    render(<DesktopNav />);
    const found = hrefs();
    expect(found).toHaveLength(4);
    expect(new Set(found)).toEqual(new Set(ALLOWED));
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- nav`
Expected: FAIL — bottom nav returns 5 links including `/education`.

- [ ] **Step 3: Remove the education entry from `BottomNav.tsx`**

Delete the whole object in `NAV_ITEMS` whose `href` is `/education` (the one labelled "Exams", including its `icon` SVG). Leave the other four entries and their order untouched: Home, Orders, Search, Tools.

- [ ] **Step 4: Remove the education entry from `DesktopNav.tsx`**

In `NAV_LINKS`, delete this line:

```ts
  { href: "/education", label: "Student & Exams", exact: false },
```

The remaining array is:

```ts
const NAV_LINKS = [
  { href: "/", label: "Home", exact: true },
  { href: "/orders", label: "Orders & Circulars", exact: false },
  { href: "/tools", label: "Utility Tools", exact: false },
  { href: "/search", label: "Search", exact: false },
];
```

- [ ] **Step 5: Run the tests**

Run: `npm test -- nav`
Expected: PASS, 4 tests.

- [ ] **Step 6: Commit**

```bash
git add app/\(public\)/_components/BottomNav.tsx app/\(public\)/_components/DesktopNav.tsx test/nav.test.tsx
git commit -m "fix(scope): restore four-tab mobile nav and remove out-of-scope education link"
```

---

### Task 5: Delete the education route

`/education` mixes out-of-scope content (SSC, Higher Education, general student material) with AP TET and DSC, which are teacher recruitment exams and therefore in scope. The decision taken: delete the route; TET and DSC live on as ordinary posts under the Notifications category, reachable via `/orders` and search.

The route also holds two links to `/posts/ap-mega-dsc-2026-hall-tickets`, a slug that does not exist in the database (the seeded slug is `ap-dsc-2026-hall-tickets-release`). Deleting the route removes both broken links.

**Files:**
- Delete: `app/(public)/education/page.tsx`
- Delete: `app/(public)/education/_components/EducationTabs.tsx`
- Delete: `app/(public)/education/_components/EducationSidebar.tsx`
- Create: `test/routes.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: no `/education` route. Any component still importing from `app/(public)/education/` becomes a type error, which is the intended signal.

- [ ] **Step 1: Write the failing test**

This test is a static guard, not a render test — it asserts on the repository itself so the route cannot come back by accident.

Create `test/routes.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const PUBLIC_DIR = path.join(process.cwd(), "app", "(public)");

function walk(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

describe("public route scope", () => {
  it("has no education route", () => {
    expect(fs.existsSync(path.join(PUBLIC_DIR, "education"))).toBe(false);
  });

  it("has no source file referencing the education route", () => {
    const offenders = walk(PUBLIC_DIR)
      .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
      .filter((f) => fs.readFileSync(f, "utf8").includes("/education"));
    expect(offenders).toEqual([]);
  });

  it("has no link to the non-existent mega-dsc slug", () => {
    const offenders = walk(PUBLIC_DIR)
      .filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"))
      .filter((f) =>
        fs.readFileSync(f, "utf8").includes("ap-mega-dsc-2026-hall-tickets")
      );
    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- routes`
Expected: FAIL on all three — the directory exists and two files reference the dead slug.

- [ ] **Step 3: Preserve the in-scope content before deleting**

Open `app/(public)/education/page.tsx` and copy the two in-scope fallback entries — `fallback-dsc-hall-tickets` and `fallback-tet-notification` — into a scratch note. Their Telugu titles are the only content worth keeping. The SCERT textbooks entry, the SSC resources, and the Higher Education material are out of scope and are discarded.

Both TET and DSC already exist as real seeded posts (`ap-tet-2026-notification-guidelines`, `ap-dsc-2026-hall-tickets-release`), so nothing needs re-creating — this step is a check that you are not deleting the only copy of something.

- [ ] **Step 4: Delete the directory**

```bash
git rm -r "app/(public)/education"
```

- [ ] **Step 5: Run the tests**

Run: `npm test -- routes`
Expected: PASS, 3 tests.

- [ ] **Step 6: Verify nothing else imported it**

Run: `npx tsc --noEmit`
Expected: no errors. If a component still imports `EducationTabs` or `EducationSidebar`, remove that usage — it was out-of-scope surface.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "fix(scope): delete the education route and its broken hall-ticket links"
```

---

### Task 6: Drive the department rail from the database

`DesktopLeftNav.tsx` hardcodes four categories — `school-education`, `finance`, `higher-education`, `dse-circulars` — with invented counts (12/8/5/9). None of those slugs exists; all four `/category/<slug>` links 404. Two of them (Finance & Treasury, Higher Education) are also outside the scope lock.

The seeded categories are `govt-orders`, `circulars`, `memos`, `proceedings`, `notifications`, `tools`. `app/(public)/orders/page.tsx` already queries them correctly with per-category counts — this task reuses that shape.

Note: `Category` (which has slugs and a route) is a different thing from `Post.docType` (a free-text string with no route). The rail links to categories.

**Files:**
- Modify: `app/(public)/_components/DesktopLeftNav.tsx` — becomes an async server component
- Modify: `app/(public)/page.tsx` — no change to the call site; the component stays `<DesktopLeftNav />`
- Create: `test/category-links.test.ts`

**Interfaces:**
- Consumes: `prisma` from `@/lib/prisma`.
- Produces: `DesktopLeftNav` is now `async` and takes no props. It renders one link per non-`tools` category with a real published-post count.

- [ ] **Step 1: Write the failing test**

Create `test/category-links.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const NAV = path.join(
  process.cwd(),
  "app",
  "(public)",
  "_components",
  "DesktopLeftNav.tsx"
);

const DEAD_SLUGS = ["school-education", "finance", "higher-education", "dse-circulars"];

describe("department rail", () => {
  it("does not hardcode category slugs that do not exist", () => {
    const source = fs.readFileSync(NAV, "utf8");
    for (const slug of DEAD_SLUGS) {
      expect(source).not.toContain(slug);
    }
  });

  it("reads categories from Prisma", () => {
    const source = fs.readFileSync(NAV, "utf8");
    expect(source).toContain("prisma.category.findMany");
  });

  it("does not hardcode post counts", () => {
    const source = fs.readFileSync(NAV, "utf8");
    expect(source).toMatch(/_count/);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- category-links`
Expected: FAIL — all four dead slugs are present and there is no Prisma call.

- [ ] **Step 3: Rewrite `DesktopLeftNav.tsx`**

Replace the `CATEGORIES` constant and the component signature. Keep the existing `STATUS_FILTERS` card and all existing class names — this task changes the data source, not the visual design (that is Milestone F).

```tsx
import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle, CardContent } from "./Card";
import Badge from "./Badge";

// Deterministic accent per category, drawn from the project token palette.
// Category.color exists in the schema but is not populated for every row.
const FALLBACK_ACCENT = "#33456B"; // inkSoft

export default async function DesktopLeftNav() {
  let categories: Array<{
    id: string;
    slug: string;
    nameEn: string;
    nameTe: string;
    color: string | null;
    _count: { posts: number };
  }> = [];

  try {
    categories = await prisma.category.findMany({
      where: { slug: { not: "tools" } },
      include: { _count: { select: { posts: { where: { isDraft: false } } } } },
      orderBy: { nameEn: "asc" },
    });
  } catch (e) {
    // Milestone D replaces this with safeQuery(); until then, an empty rail is
    // preferable to a crashed homepage.
    categories = [];
  }

  return (
    <aside className="space-y-6 sticky top-20 hidden lg:block font-sans">
      <Card className="border-hair">
        <CardHeader className="pb-3 border-b border-hair/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                <span>🏛️</span> Document Categories
              </CardTitle>
              <p className="text-[10px] font-mono text-inkSoft/70 mt-0.5">
                AP School Education
              </p>
            </div>
            <Badge variant="neutral" size="sm" shape="pill">
              {categories.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group flex items-center justify-between p-3 rounded-xl border border-hair/60 hover:border-tamarind/50 bg-paper/30 hover:bg-paperRaised transition-all shadow-2xs"
              style={{
                borderLeftWidth: "4px",
                borderLeftColor: cat.color || FALLBACK_ACCENT,
              }}
            >
              <div className="min-w-0 flex-1 pr-2">
                <div className="font-bold text-xs text-ink group-hover:text-tamarind transition-colors truncate">
                  {cat.nameEn}
                </div>
                <div
                  lang="te"
                  className="font-telugu text-[11px] text-inkSoft leading-relaxed truncate mt-0.5"
                >
                  {cat.nameTe}
                </div>
              </div>
              <Badge variant="neutral" size="sm" shape="pill">
                {cat._count.posts}
              </Badge>
            </Link>
          ))}

          {categories.length === 0 && (
            <p className="text-[11px] font-mono text-inkSoft/70 px-1 py-2">
              No categories available.
            </p>
          )}

          <div className="pt-2">
            <Link
              href="/orders"
              className="text-xs font-mono font-bold text-tamarind hover:text-ink flex items-center justify-between p-2 rounded-lg hover:bg-hair/20 transition-all"
            >
              <span>Explore All Categories</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Status Hierarchy card: unchanged from the previous version. */}
    </aside>
  );
}
```

Keep the existing "Status Hierarchy" `<Card>` block exactly as it was, pasted where the comment marks it. Its labels are revisited in Task 14.

- [ ] **Step 4: Run the tests**

Run: `npm test -- category-links`
Expected: PASS, 3 tests.

- [ ] **Step 5: Verify types and build**

Run: `npx tsc --noEmit && npm run build`
Expected: both pass. An async component inside a server page is valid; if `page.tsx` errors, confirm it is not marked `"use client"`.

- [ ] **Step 6: Manual check**

Run `npm run dev`, open `/` at desktop width, click each category in the rail. Every one must load a real page — none may 404.

- [ ] **Step 7: Commit**

```bash
git add "app/(public)/_components/DesktopLeftNav.tsx" test/category-links.test.ts
git commit -m "fix: drive the department rail from Prisma categories instead of dead hardcoded slugs"
```

---

### Task 7: Remove the sponsored placeholder

`AdSlot` renders a "Sponsored / Advertisement Reserved Slot" card on the homepage while ad activation is still an open decision. Showing a sponsorship affordance the site does not have works against the trust-first objective.

**Files:**
- Delete: `app/(public)/_components/AdSlot.tsx`
- Modify: `app/(public)/page.tsx` (remove the import, the `showAdSlot` variable, and the render)
- Modify: `test/routes.test.ts` (add one case)

**Interfaces:**
- Consumes: nothing.
- Produces: the homepage feed renders `PostCard` items with no interleaved slot.

- [ ] **Step 1: Add the failing test**

Append to the `describe` block in `test/routes.test.ts`:

```ts
  it("renders no advertisement placeholder", () => {
    const offenders = walk(PUBLIC_DIR)
      .filter((f) => f.endsWith(".tsx"))
      .filter((f) => /AdSlot|Sponsored/.test(fs.readFileSync(f, "utf8")));
    expect(offenders).toEqual([]);
  });
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- routes`
Expected: FAIL — `AdSlot.tsx` and `page.tsx` both match.

- [ ] **Step 3: Delete the component**

```bash
git rm "app/(public)/_components/AdSlot.tsx"
```

- [ ] **Step 4: Simplify the feed in `page.tsx`**

Remove `import AdSlot from "./_components/AdSlot";`. Replace the listing block with:

```tsx
            <div className="space-y-4">
              {listingPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
```

The `index` parameter and the `showAdSlot` variable both go away, as does the wrapper `<div key={post.id} className="space-y-4">`.

- [ ] **Step 5: Run the tests**

Run: `npm test -- routes`
Expected: PASS, 4 tests.

- [ ] **Step 6: Verify the build**

Run: `npx tsc --noEmit && npm run build`
Expected: both pass.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "fix: remove the sponsored placeholder pending an ad activation decision"
```

---

### Task 8: Stop seed data claiming GOIR verification

`prisma/seed.ts` sets `verifiedAgainstGoir: true` and `isDraft: false` on posts whose `pdfUrl` is a placeholder Google Drive ID (`1A2B3C4D5E6F7G8H9I0J`) and whose `sourceUrl` is the bare domain `https://goir.ap.gov.in` rather than a document link. The site then labels them "GOIR Verified Gazette".

Seed data must be visibly demo data. Two rules: nothing seeded is verified, and nothing seeded is published.

**Files:**
- Modify: `prisma/seed.ts` (every `post.upsert` call — both the `create` and `update` branches)
- Create: `test/seed-integrity.test.ts`

**Interfaces:**
- Consumes: `resetDb`, `testDb` from `test/db.ts`.
- Produces: after `npm run db:seed`, every seeded post has `isDraft: true` and `verifiedAgainstGoir: false`.

- [ ] **Step 1: Write the failing test**

Create `test/seed-integrity.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const SEED = fs.readFileSync(path.join(process.cwd(), "prisma", "seed.ts"), "utf8");

describe("seed integrity", () => {
  it("never marks a seeded post as GOIR-verified", () => {
    expect(SEED).not.toMatch(/verifiedAgainstGoir:\s*true/);
  });

  it("never publishes a seeded post", () => {
    expect(SEED).not.toMatch(/isDraft:\s*false/);
  });

  it("carries no placeholder Google Drive id", () => {
    expect(SEED).not.toContain("1A2B3C4D5E6F7G8H9I0J");
  });

  it("uses no bare goir.ap.gov.in domain as a source url", () => {
    expect(SEED).not.toMatch(/sourceUrl:\s*"https:\/\/goir\.ap\.gov\.in"/);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- seed-integrity`
Expected: FAIL on all four.

- [ ] **Step 3: Edit every post upsert in `prisma/seed.ts`**

For each of the five `prisma.post.upsert(...)` calls:

- In the `create` branch, change `verifiedAgainstGoir: true` to `verifiedAgainstGoir: false` and `isDraft: false` to `isDraft: true`.
- In the `update` branch, change `isDraft: false` to `isDraft: true`.
- Replace every placeholder `pdfUrl` with `null`. A missing PDF is honest; a fake Drive ID is not.
- Replace every `sourceUrl: "https://goir.ap.gov.in"` with `null`.
- Prefix each `titleEn` with `[DEMO] ` so a seeded record is unmistakable in the admin list.

Add this comment at the top of the seeding section:

```ts
// Seed records are demo fixtures, not real orders. They are created as UNPUBLISHED
// drafts with verifiedAgainstGoir=false and no PDF or source URL. A real post is
// verified by a human against GOIR and published deliberately from the admin UI.
```

- [ ] **Step 4: Run the tests**

Run: `npm test -- seed-integrity`
Expected: PASS, 4 tests.

- [ ] **Step 5: Re-seed and verify by eye**

```bash
npm run db:seed
npm run dev
```

Open `/admin/posts` — all five demo posts show the DRAFT badge and no "GOIR verified" mark. Open `/` — the feed shows "No published posts found." That empty state is correct: there is currently no real published content.

- [ ] **Step 6: Commit**

```bash
git add prisma/seed.ts test/seed-integrity.test.ts
git commit -m "fix(trust): seed demo posts as unverified drafts with no fake PDF or source links"
```

---

# Milestone B — Publishing safety

Acceptance for the milestone: a newly created post stays private until the admin deliberately publishes it, and no draft content leaks through any surface.

---

### Task 9: Create posts as drafts

`app/actions/posts.ts` sets `isDraft: false` in `createPost`, bypassing the draft workflow. The schema already declares `isDraft Boolean @default(true)`, and `publishPost()` plus a working **Publish** button already exist in `app/admin/posts/page.tsx`. The publish path was built and then routed around; this is a one-line deletion.

**Files:**
- Modify: `app/actions/posts.ts` (the `data` object inside `createPost`)
- Create: `test/create-post.test.ts`

**Interfaces:**
- Consumes: `requireAdmin` (Task 2), `resetDb`/`testDb` (Task 1).
- Produces: `createPost` writes a post with `isDraft: true`. `publishPost(postId)` remains the only way to flip it.

- [ ] **Step 1: Write the failing test**

`createPost` calls `redirect()`, which throws a `NEXT_REDIRECT` control-flow error by design. The test asserts on database state after catching it.

Create `test/create-post.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/auth-guard", () => ({ requireAdmin: vi.fn().mockResolvedValue(undefined) }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: () => {
    throw new Error("NEXT_REDIRECT");
  },
}));

import { createPost, publishPost } from "@/app/actions/posts";
import { resetDb, testDb } from "./db";

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fd;
}

const VALID = {
  titleEn: "Transfer Guidelines 2026",
  titleTe: "బదిలీ మార్గదర్శకాలు 2026",
  summaryTe: "అర్హులైన ఉపాధ్యాయులు దరఖాస్తు చేసుకోవాలి.",
  goReference: "G.O.Ms.No.55",
};

async function submit(fields: Record<string, string>) {
  try {
    await createPost(form(fields));
  } catch (e) {
    if ((e as Error).message !== "NEXT_REDIRECT") throw e;
  }
}

describe("createPost", () => {
  beforeEach(resetDb);

  it("saves the new post as a draft", async () => {
    await submit(VALID);
    const post = await testDb.post.findFirst();
    expect(post?.isDraft).toBe(true);
  });

  it("does not mark the new post as GOIR-verified unless asked", async () => {
    await submit(VALID);
    const post = await testDb.post.findFirst();
    expect(post?.verifiedAgainstGoir).toBe(false);
  });

  it("publishPost is what makes a post public", async () => {
    await submit(VALID);
    const created = await testDb.post.findFirstOrThrow();
    await publishPost(created.id);
    const after = await testDb.post.findUniqueOrThrow({ where: { id: created.id } });
    expect(after.isDraft).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- create-post`
Expected: FAIL on the first test — `isDraft` is `false`.

- [ ] **Step 3: Delete the override**

In `createPost`, inside `prisma.post.create({ data: { ... } })`, delete this line:

```ts
      isDraft: false,
```

The schema default (`true`) now applies. Add a short comment in its place:

```ts
      // isDraft intentionally omitted — the schema defaults to true.
      // Publishing is a separate, deliberate action (publishPost).
```

- [ ] **Step 4: Run the tests**

Run: `npm test -- create-post`
Expected: PASS, 3 tests.

- [ ] **Step 5: Manual check**

Run `npm run dev`, log in, create a post from `/admin/posts/new`. It must appear in the admin list with a DRAFT badge and must NOT appear on `/`. Click **Publish**, then confirm it appears on `/`.

- [ ] **Step 6: Commit**

```bash
git add app/actions/posts.ts test/create-post.test.ts
git commit -m "fix(cms): create posts as drafts instead of publishing immediately"
```

---

### Task 10: Validate post input server-side

`createPost` and `updatePost` currently check only that `titleEn`, `titleTe`, and `summaryTe` are non-empty. Everything else — URLs, GO reference format, dates, category existence — is accepted as typed. Validation lives in a pure module so it is testable without a database or a React tree.

No validation library is added. Plain functions keep the dependency surface flat, which the tech-stack constraint favours.

**Files:**
- Create: `lib/validation/post.ts`
- Create: `test/validation-post.test.ts`
- Modify: `app/actions/posts.ts` (both `createPost` and `updatePost`)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `type PostInput` — the parsed shape.
  - `validatePost(input: PostInput): string[]` — returns human-readable error messages, empty array when valid.
  - `parsePostForm(formData: FormData): PostInput` — the FormData reading currently duplicated across both actions, extracted once.

- [ ] **Step 1: Write the failing test**

Create `test/validation-post.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { validatePost, type PostInput } from "@/lib/validation/post";

const base: PostInput = {
  titleEn: "Transfer Guidelines 2026",
  titleTe: "బదిలీ మార్గదర్శకాలు 2026",
  summaryTe: ["అర్హులైన ఉపాధ్యాయులు దరఖాస్తు చేసుకోవాలి."],
  englishAbstract: null,
  statusBadge: "notification",
  pdfUrl: null,
  actionUrl: null,
  actionDeadline: null,
  goReference: "G.O.Ms.No.55",
  sourceDept: "School Education, AP",
  sourceUrl: null,
  categoryId: null,
  docType: "go",
  tags: [],
  verifiedAgainstGoir: false,
  relatedPostIds: [],
};

describe("validatePost", () => {
  it("accepts a well-formed post", () => {
    expect(validatePost(base)).toEqual([]);
  });

  it("requires an English title", () => {
    expect(validatePost({ ...base, titleEn: "  " })).toContain("English title is required.");
  });

  it("requires a Telugu title", () => {
    expect(validatePost({ ...base, titleTe: "" })).toContain("Telugu title is required.");
  });

  it("requires the Telugu title to actually contain Telugu characters", () => {
    const errors = validatePost({ ...base, titleTe: "Transfer Guidelines" });
    expect(errors).toContain("Telugu title must contain Telugu script.");
  });

  it("requires at least one Telugu summary line", () => {
    expect(validatePost({ ...base, summaryTe: [] })).toContain(
      "At least one Telugu summary line is required."
    );
  });

  it("requires Telugu script in the summary", () => {
    const errors = validatePost({ ...base, summaryTe: ["Eligible teachers must apply."] });
    expect(errors).toContain("Telugu summary must contain Telugu script.");
  });

  it("rejects a non-https pdf url", () => {
    const errors = validatePost({ ...base, pdfUrl: "ftp://example.com/a.pdf" });
    expect(errors).toContain("PDF URL must be an https:// link.");
  });

  it("rejects a malformed source url", () => {
    expect(validatePost({ ...base, sourceUrl: "not a url" })).toContain(
      "Source URL must be an https:// link."
    );
  });

  it("accepts a valid https url", () => {
    expect(validatePost({ ...base, sourceUrl: "https://goir.ap.gov.in/go/123" })).toEqual([]);
  });

  it("rejects an unknown status badge", () => {
    expect(validatePost({ ...base, statusBadge: "banana" })).toContain(
      "Status badge is not a recognised value."
    );
  });

  it("rejects a GO reference that is not in G.O./Memo/Circular form", () => {
    expect(validatePost({ ...base, goReference: "55" })).toContain(
      "GO reference must look like G.O.Ms.No.55, G.O.Rt.No.55, Memo.No.55, or Circular.No.55."
    );
  });

  it("accepts an empty GO reference", () => {
    expect(validatePost({ ...base, goReference: null })).toEqual([]);
  });

  it("rejects an unparseable action deadline", () => {
    expect(validatePost({ ...base, actionDeadline: new Date("nonsense") })).toContain(
      "Action deadline is not a valid date."
    );
  });

  it("rejects a post that relates to itself", () => {
    const errors = validatePost({ ...base, id: "abc", relatedPostIds: ["abc"] });
    expect(errors).toContain("A post cannot be related to itself.");
  });

  it("rejects duplicate related post ids", () => {
    const errors = validatePost({ ...base, relatedPostIds: ["x", "x"] });
    expect(errors).toContain("Related orders must be unique.");
  });

  it("requires a source URL when the post claims GOIR verification", () => {
    const errors = validatePost({ ...base, verifiedAgainstGoir: true, sourceUrl: null });
    expect(errors).toContain(
      "A GOIR-verified post must carry the source URL it was verified against."
    );
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- validation-post`
Expected: FAIL — cannot resolve `@/lib/validation/post`.

- [ ] **Step 3: Write `lib/validation/post.ts`**

```ts
export type PostInput = {
  id?: string;
  titleEn: string;
  titleTe: string;
  summaryTe: string[];
  englishAbstract: string | null;
  statusBadge: string;
  pdfUrl: string | null;
  actionUrl: string | null;
  actionDeadline: Date | null;
  goReference: string | null;
  sourceDept: string | null;
  sourceUrl: string | null;
  categoryId: string | null;
  docType: string | null;
  tags: string[];
  verifiedAgainstGoir: boolean;
  relatedPostIds: string[];
};

const STATUS_BADGES = ["notification", "apply_link", "hall_ticket", "results", "expired"];

// Telugu block: U+0C00–U+0C7F.
const TELUGU = /[ఀ-౿]/;

// G.O.Ms.No.129 / G.O.Rt.No.55 / Memo.No.1234 / Circular.No.7 — with or without spaces.
const GO_REFERENCE =
  /^(G\.?O\.?\s?(Ms|Rt|P)\.?\s?No\.?\s?\d+|Memo\.?\s?No\.?\s?[\w/-]+|Circular\.?\s?No\.?\s?[\w/-]+|Proc\.?\s?No\.?\s?[\w/-]+)/i;

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function validatePost(input: PostInput): string[] {
  const errors: string[] = [];

  if (!input.titleEn?.trim()) errors.push("English title is required.");

  if (!input.titleTe?.trim()) {
    errors.push("Telugu title is required.");
  } else if (!TELUGU.test(input.titleTe)) {
    // Guards against pasting a transliteration into the Telugu field.
    errors.push("Telugu title must contain Telugu script.");
  }

  const summary = (input.summaryTe ?? []).filter((line) => line.trim().length > 0);
  if (summary.length === 0) {
    errors.push("At least one Telugu summary line is required.");
  } else if (!summary.some((line) => TELUGU.test(line))) {
    errors.push("Telugu summary must contain Telugu script.");
  }

  if (!STATUS_BADGES.includes(input.statusBadge)) {
    errors.push("Status badge is not a recognised value.");
  }

  if (input.pdfUrl && !isHttpsUrl(input.pdfUrl)) {
    errors.push("PDF URL must be an https:// link.");
  }
  if (input.sourceUrl && !isHttpsUrl(input.sourceUrl)) {
    errors.push("Source URL must be an https:// link.");
  }
  if (input.actionUrl && !isHttpsUrl(input.actionUrl)) {
    errors.push("Action URL must be an https:// link.");
  }

  if (input.goReference && !GO_REFERENCE.test(input.goReference.trim())) {
    errors.push(
      "GO reference must look like G.O.Ms.No.55, G.O.Rt.No.55, Memo.No.55, or Circular.No.55."
    );
  }

  if (input.actionDeadline && Number.isNaN(input.actionDeadline.getTime())) {
    errors.push("Action deadline is not a valid date.");
  }

  if (input.id && input.relatedPostIds.includes(input.id)) {
    errors.push("A post cannot be related to itself.");
  }
  if (new Set(input.relatedPostIds).size !== input.relatedPostIds.length) {
    errors.push("Related orders must be unique.");
  }

  // The verification claim is the site's core trust signal — it must be traceable.
  if (input.verifiedAgainstGoir && !input.sourceUrl) {
    errors.push(
      "A GOIR-verified post must carry the source URL it was verified against."
    );
  }

  return errors;
}

export function parsePostForm(formData: FormData, id?: string): PostInput {
  const str = (key: string) => String(formData.get(key) || "").trim();
  const orNull = (key: string) => str(key) || null;

  const deadlineRaw = str("actionDeadline");

  return {
    id,
    titleEn: str("titleEn"),
    titleTe: str("titleTe"),
    summaryTe: String(formData.get("summaryTe") || "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    englishAbstract: orNull("englishAbstract"),
    statusBadge: str("statusBadge") || "notification",
    pdfUrl: orNull("pdfUrl"),
    actionUrl: orNull("actionUrl"),
    actionDeadline: deadlineRaw ? new Date(deadlineRaw) : null,
    goReference: orNull("goReference"),
    sourceDept: orNull("sourceDept"),
    sourceUrl: orNull("sourceUrl"),
    categoryId: orNull("categoryId"),
    docType: orNull("docType"),
    tags: String(formData.get("tagsRaw") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    verifiedAgainstGoir: formData.get("verifiedAgainstGoir") === "on",
    relatedPostIds: formData.getAll("relatedPostIds").map(String).filter(Boolean),
  };
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test -- validation-post`
Expected: PASS, 16 tests.

- [ ] **Step 5: Wire the validator into both actions**

In `app/actions/posts.ts`, replace the hand-rolled FormData reading at the top of `createPost` with:

```ts
export async function createPost(formData: FormData) {
  await requireAdmin();

  const input = parsePostForm(formData);
  const errors = validatePost(input);
  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }

  const post = await prisma.post.create({
    data: {
      slug: `${slugify(input.titleEn)}-${Date.now().toString(36)}`,
      titleEn: input.titleEn,
      titleTe: input.titleTe,
      summaryTe: input.summaryTe,
      englishAbstract: input.englishAbstract,
      statusBadge: input.statusBadge as never,
      pdfUrl: input.pdfUrl,
      actionUrl: input.actionUrl,
      actionDeadline: input.actionDeadline,
      goReference: input.goReference,
      sourceDept: input.sourceDept,
      sourceUrl: input.sourceUrl,
      categoryId: input.categoryId,
      docType: input.docType,
      tags: input.tags,
      verifiedAgainstGoir: input.verifiedAgainstGoir,
      // isDraft intentionally omitted — the schema defaults to true.
    },
  });

  for (const relatedId of input.relatedPostIds) {
    await prisma.relatedOrder.create({
      data: { postId: post.id, relatedPostId: relatedId, source: "manual", approved: true },
    });
  }

  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}
```

Do the same in `updatePost`, passing the post id so the self-relation check fires:

```ts
  const input = parsePostForm(formData, postId);
  const errors = validatePost(input);
  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }
```

`updatePost` already skips a self-relation with `if (relatedId === postId) continue;`. Keep that line — belt and braces — but the validator now rejects the input before it gets there.

Add the import:

```ts
import { parsePostForm, validatePost } from "@/lib/validation/post";
```

- [ ] **Step 6: Add a category-existence check**

A `categoryId` typed into the form that does not exist would fail at the Prisma layer with an opaque foreign-key error. Insert after the validator call in both actions:

```ts
  if (input.categoryId) {
    const exists = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!exists) throw new Error("Selected category does not exist.");
  }
```

- [ ] **Step 7: Run the full suite and typecheck**

Run: `npm test && npx tsc --noEmit`
Expected: all tests pass, no type errors.

- [ ] **Step 8: Manual check**

Run `npm run dev`. In `/admin/posts/new`, try to save with an English string in the Telugu title field — it must be rejected. Try `pdfUrl` of `http://example.com/x.pdf` — rejected. Try a valid post — saved as draft.

- [ ] **Step 9: Commit**

```bash
git add lib/validation/post.ts test/validation-post.test.ts app/actions/posts.ts
git commit -m "feat(cms): validate post input server-side before write"
```

---

### Task 11: Close the draft leaks

Every public *list* query already filters `isDraft: false`. Two surfaces do not:

1. `app/(public)/posts/[slug]/page.tsx` — `generateMetadata` looks up the post with no draft filter, so a draft slug returns a real title and Telugu summary in `<head>` while the page itself 404s.
2. Related Orders — `app/(public)/page.tsx` includes `relatedFrom` with **no `approved: true` filter**, so unapproved AI suggestions render on the homepage hero. Neither the homepage nor the detail page filters the *related post's* own `isDraft`, so an unpublished post's title renders through the relation on both.

**Files:**
- Modify: `app/(public)/posts/[slug]/page.tsx` (`generateMetadata` query; the `relatedFrom` include)
- Modify: `app/(public)/page.tsx` (the `relatedFrom` include)
- Create: `test/draft-leaks.test.ts`

**Interfaces:**
- Consumes: `resetDb`, `makePost`, `testDb` (Task 1).
- Produces: no query reachable from a public route returns draft content, directly or through a relation.

- [ ] **Step 1: Write the failing test**

This asserts on the query shape in source, plus a behavioural check on the relation filter through Prisma directly.

Create `test/draft-leaks.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { resetDb, makePost, testDb } from "./db";

const detail = fs.readFileSync(
  path.join(process.cwd(), "app", "(public)", "posts", "[slug]", "page.tsx"),
  "utf8"
);
const home = fs.readFileSync(
  path.join(process.cwd(), "app", "(public)", "page.tsx"),
  "utf8"
);

describe("draft leak guards", () => {
  it("generateMetadata filters out drafts", () => {
    const block = detail.slice(
      detail.indexOf("generateMetadata"),
      detail.indexOf("generateStaticParams")
    );
    expect(block).toContain("isDraft: false");
  });

  it("the homepage only includes approved related orders", () => {
    const block = home.slice(home.indexOf("relatedFrom"), home.indexOf("relatedFrom") + 400);
    expect(block).toContain("approved: true");
  });

  it("both pages exclude drafts from the related post itself", () => {
    for (const source of [detail, home]) {
      const block = source.slice(
        source.indexOf("relatedFrom"),
        source.indexOf("relatedFrom") + 400
      );
      expect(block).toContain("relatedPost: { isDraft: false }");
    }
  });
});

describe("related order filtering behaviour", () => {
  beforeEach(resetDb);

  it("a draft related post is not returned by the filtered query", async () => {
    const published = await makePost({ slug: "published-parent", isDraft: false });
    const draft = await makePost({ slug: "draft-child", isDraft: true });
    await testDb.relatedOrder.create({
      data: { postId: published.id, relatedPostId: draft.id, approved: true, source: "manual" },
    });

    const result = await testDb.post.findUnique({
      where: { slug: "published-parent" },
      include: {
        relatedFrom: {
          where: { approved: true, relatedPost: { isDraft: false } },
          include: { relatedPost: { select: { slug: true } } },
        },
      },
    });

    expect(result?.relatedFrom).toHaveLength(0);
  });

  it("an approved, published related post is returned", async () => {
    const parent = await makePost({ slug: "parent-2", isDraft: false });
    const child = await makePost({ slug: "child-2", isDraft: false });
    await testDb.relatedOrder.create({
      data: { postId: parent.id, relatedPostId: child.id, approved: true, source: "manual" },
    });

    const result = await testDb.post.findUnique({
      where: { slug: "parent-2" },
      include: {
        relatedFrom: {
          where: { approved: true, relatedPost: { isDraft: false } },
          include: { relatedPost: { select: { slug: true } } },
        },
      },
    });

    expect(result?.relatedFrom[0].relatedPost.slug).toBe("child-2");
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- draft-leaks`
Expected: FAIL on the first three; the last two pass (they exercise Prisma directly, proving the filter shape works before you adopt it).

- [ ] **Step 3: Fix `generateMetadata`**

In `app/(public)/posts/[slug]/page.tsx`, change the lookup from `findUnique` to `findFirst` so a compound where-clause is allowed:

```ts
    const post = await prisma.post.findFirst({
      where: { slug: params.slug, isDraft: false },
      select: { titleEn: true, titleTe: true, summaryTe: true },
    });
```

- [ ] **Step 4: Fix the detail page's related include**

In the same file, in the `PostDetailPage` query, change:

```ts
        relatedFrom: {
          where: { approved: true, relatedPost: { isDraft: false } },
```

- [ ] **Step 5: Fix the homepage's related include**

In `app/(public)/page.tsx`, the `relatedFrom` include currently has no `where` at all. Change it to:

```ts
        relatedFrom: {
          where: { approved: true, relatedPost: { isDraft: false } },
          include: { relatedPost: true },
        },
```

- [ ] **Step 6: Run the tests**

Run: `npm test -- draft-leaks`
Expected: PASS, 5 tests.

- [ ] **Step 7: Manual check**

Run `npm run dev`. Create a draft post, note its slug from the admin edit URL, then visit `/posts/<slug>`. It must 404, and the browser tab must read "Order Not Found — AP Teacher Desk", not the draft's title.

- [ ] **Step 8: Commit**

```bash
git add "app/(public)/posts/[slug]/page.tsx" "app/(public)/page.tsx" test/draft-leaks.test.ts
git commit -m "fix(cms): stop drafts leaking through metadata and related orders"
```

---

# Milestone C — Content model

This is the only irreversible milestone. Task 12 takes a backup before anything else runs.

Two schema changes land here:
1. `documentDate` — the date the order was actually issued, distinct from `createdAt` (when it was ingested into the CMS).
2. `documentType` (enum) + `orderState` (enum) — so an ordinary circular is never described as reaching "Hall Ticket" or "Results".

The `docType` free-text column is replaced additively (add → backfill → switch reads → drop) rather than altered in place, because a Prisma `String` → `enum` alter drops data.

---

### Task 12: Back up, then add the new columns

**Files:**
- Create: `prisma/backup.ts`
- Create: `prisma/backfill-document-type.ts`
- Modify: `prisma/schema.prisma`
- Create: `test/schema-shape.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `Post.documentDate: DateTime?`, `Post.documentType: DocType?`, `Post.orderState: OrderState @default(current)`. Enums `DocType { go circular memo proceeding notification other }` and `OrderState { current amended superseded archived }`. `Post.docType` still exists at the end of this task and is dropped in Task 14.

- [ ] **Step 1: Write the backup script**

Create `prisma/backup.ts`:

```ts
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const dir = path.join(process.cwd(), "backups");
fs.mkdirSync(dir, { recursive: true });

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const out = path.join(dir, `portal-${stamp}.sql`);

// pg_dump ships inside the docker-compose postgres container, so no local
// Postgres client install is required.
execFileSync(
  "docker",
  ["compose", "exec", "-T", "db", "pg_dump", "-U", "portal", "portal_dev"],
  { stdio: ["ignore", fs.openSync(out, "w"), "inherit"] }
);

const bytes = fs.statSync(out).size;
if (bytes < 1024) {
  console.error(`Backup looks empty (${bytes} bytes) — aborting.`);
  process.exit(1);
}
console.log(`Backup written: ${out} (${bytes} bytes)`);
```

Add to `package.json` scripts:

```json
"db:backup": "tsx prisma/backup.ts"
```

Add `backups/` to `.gitignore`.

- [ ] **Step 2: Take the backup and confirm it is real**

```bash
npm run db:backup
```

Expected: a file under `backups/` larger than 1 KB. Open it and confirm you can see `CREATE TABLE "Post"`. **Do not proceed until you have seen that line.**

- [ ] **Step 3: Write the failing test**

Create `test/schema-shape.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { resetDb, makePost, testDb } from "./db";

describe("post schema shape", () => {
  beforeEach(resetDb);

  it("stores a documentDate distinct from createdAt", async () => {
    const post = await makePost({ slug: "dated" });
    const issued = new Date("2024-02-08T00:00:00.000Z");
    await testDb.post.update({ where: { id: post.id }, data: { documentDate: issued } });

    const found = await testDb.post.findUniqueOrThrow({ where: { id: post.id } });
    expect(found.documentDate?.toISOString()).toBe(issued.toISOString());
    expect(found.documentDate?.getTime()).not.toBe(found.createdAt.getTime());
  });

  it("leaves documentDate null when no official date is known", async () => {
    const post = await makePost({ slug: "undated" });
    const found = await testDb.post.findUniqueOrThrow({ where: { id: post.id } });
    expect(found.documentDate).toBeNull();
  });

  it("defaults orderState to current", async () => {
    const post = await makePost({ slug: "state-default" });
    const found = await testDb.post.findUniqueOrThrow({ where: { id: post.id } });
    expect(found.orderState).toBe("current");
  });

  it("accepts each documentType enum value", async () => {
    const values = ["go", "circular", "memo", "proceeding", "notification", "other"] as const;
    for (const value of values) {
      const post = await makePost({ slug: `type-${value}` });
      const updated = await testDb.post.update({
        where: { id: post.id },
        data: { documentType: value },
      });
      expect(updated.documentType).toBe(value);
    }
  });
});
```

- [ ] **Step 4: Run it to make sure it fails**

Run: `npm test -- schema-shape`
Expected: FAIL — `documentDate`, `orderState`, and `documentType` do not exist on the Prisma client type.

- [ ] **Step 5: Edit `prisma/schema.prisma`**

Add the two enums next to the existing ones:

```prisma
enum DocType {
  go
  circular
  memo
  proceeding
  notification
  other
}

/// Lifecycle for an ordinary order/circular/memo. Recruitment notifications
/// use PostStatus instead — see lib/posts/lifecycle.ts.
enum OrderState {
  current
  amended
  superseded
  archived
}
```

Add three fields to `model Post`, immediately after `docType`:

```prisma
  /// Free-text legacy column. Superseded by documentType; dropped in Task 14.
  docType             String?
  /// The document type as a closed set. Backfilled from docType.
  documentType        DocType?
  /// Lifecycle state for non-recruitment documents.
  orderState          OrderState @default(current)
  /// The date the order was actually issued by the department. NULL when no
  /// verifiable date exists — never inferred. Distinct from createdAt, which is
  /// the CMS ingestion timestamp.
  documentDate        DateTime?
```

- [ ] **Step 6: Push to dev and test databases**

```bash
npx prisma db push
```

PowerShell, for the test database:

```powershell
$env:DATABASE_URL="postgresql://portal:portal_dev_password@localhost:5433/portal_test?schema=public"; npx prisma db push
```

- [ ] **Step 7: Run the tests**

Run: `npm test -- schema-shape`
Expected: PASS, 4 tests.

- [ ] **Step 8: Write the backfill script**

Create `prisma/backfill-document-type.ts`:

```ts
import { PrismaClient, type DocType } from "@prisma/client";

const prisma = new PrismaClient();

// Maps the legacy free-text docType values actually present in the data.
// Anything unrecognised becomes "other" — never guessed.
const MAP: Record<string, DocType> = {
  go: "go",
  circular: "circular",
  memo: "memo",
  proceeding: "proceeding",
  proceedings: "proceeding",
  notification: "notification",
};

async function main() {
  const posts = await prisma.post.findMany({
    where: { documentType: null },
    select: { id: true, docType: true, slug: true },
  });

  let mapped = 0;
  let fellBack = 0;

  for (const post of posts) {
    const key = (post.docType || "").trim().toLowerCase();
    const documentType = MAP[key];

    if (documentType) {
      mapped += 1;
    } else {
      fellBack += 1;
      console.warn(`  no mapping for docType=${JSON.stringify(post.docType)} on ${post.slug} -> other`);
    }

    await prisma.post.update({
      where: { id: post.id },
      data: { documentType: documentType ?? "other" },
    });
  }

  console.log(`documentType backfill: ${mapped} mapped, ${fellBack} defaulted to "other".`);

  // documentDate is deliberately NOT backfilled. There is no verifiable official
  // date in the existing rows, and inferring one would put a false date on a
  // government order. Nulls are handled by lib/dates.ts.
  const undated = await prisma.post.count({ where: { documentDate: null } });
  console.log(`documentDate: ${undated} rows left null for manual entry.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

Add to `package.json` scripts:

```json
"db:backfill": "tsx prisma/backfill-document-type.ts"
```

- [ ] **Step 9: Run the backfill**

```bash
npm run db:backfill
```

Expected: a line per unmapped row, then a summary. Read the warnings — if a real docType value was not in `MAP`, add it and re-run rather than accepting `other`.

- [ ] **Step 10: Commit**

```bash
git add prisma/schema.prisma prisma/backup.ts prisma/backfill-document-type.ts package.json .gitignore test/schema-shape.test.ts
git commit -m "feat(schema): add documentDate, documentType, and orderState"
```

---

### Task 13: Use the official date, and never invent one

The site currently prints `createdAt` under a "Published" label. For a backfilled order that is a false claim about when the government issued the document.

The rule, decided during plan review: `documentDate` is nullable, lists sort on `COALESCE(documentDate, createdAt)`, and wherever the fallback is used the label reads **"Added to portal"** instead of **"Published"**. No false official date is ever rendered.

**Files:**
- Create: `lib/dates.ts`
- Create: `test/dates.test.ts`
- Modify: `app/(public)/page.tsx`, `app/(public)/orders/page.tsx`, `app/(public)/category/[slug]/page.tsx`, `app/(public)/posts/[slug]/page.tsx` (ordering + label)
- Modify: `app/admin/posts/_components/PostFormClient.tsx` (add the input)
- Modify: `lib/validation/post.ts` (accept and validate `documentDate`)

**Interfaces:**
- Consumes: `PostInput` from Task 10.
- Produces:
  - `officialDate(post: DatedPost): Date` — `documentDate ?? createdAt`.
  - `dateLabel(post: DatedPost): "Issued" | "Added to portal"`.
  - `formatDate(date: Date): string` — `"08 Feb 2024"`, `en-IN`, `Asia/Kolkata`.
  - `ORDER_BY_OFFICIAL_DATE` — the reusable Prisma `orderBy` value.

- [ ] **Step 1: Write the failing test**

Create `test/dates.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { officialDate, dateLabel, formatDate } from "@/lib/dates";

const createdAt = new Date("2026-08-24T10:00:00.000Z");
const issued = new Date("2024-02-08T00:00:00.000Z");

describe("officialDate", () => {
  it("prefers documentDate when present", () => {
    expect(officialDate({ documentDate: issued, createdAt })).toEqual(issued);
  });

  it("falls back to createdAt when documentDate is null", () => {
    expect(officialDate({ documentDate: null, createdAt })).toEqual(createdAt);
  });
});

describe("dateLabel", () => {
  it("says Issued when the official date is known", () => {
    expect(dateLabel({ documentDate: issued, createdAt })).toBe("Issued");
  });

  it("never says Issued or Published for a fallback date", () => {
    const label = dateLabel({ documentDate: null, createdAt });
    expect(label).toBe("Added to portal");
    expect(label).not.toMatch(/Issued|Published/);
  });
});

describe("formatDate", () => {
  it("formats as day month year", () => {
    expect(formatDate(issued)).toBe("08 Feb 2024");
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- dates`
Expected: FAIL — cannot resolve `@/lib/dates`.

- [ ] **Step 3: Write `lib/dates.ts`**

```ts
export type DatedPost = {
  documentDate: Date | null;
  createdAt: Date;
};

/**
 * The date to sort and display by. documentDate is the date the department
 * issued the order; createdAt is only when it was added to this CMS. Falling
 * back is safe for ORDERING, but callers must use dateLabel() so the fallback
 * is never presented as an official publication date.
 */
export function officialDate(post: DatedPost): Date {
  return post.documentDate ?? post.createdAt;
}

export function dateLabel(post: DatedPost): "Issued" | "Added to portal" {
  return post.documentDate ? "Issued" : "Added to portal";
}

const FORMATTER = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

export function formatDate(date: Date): string {
  return FORMATTER.format(date);
}

/**
 * Prisma cannot express COALESCE in orderBy, but ordering by documentDate with
 * nulls last and then by createdAt produces the same result: dated documents
 * sort by their official date, undated ones fall in behind by ingestion date.
 */
export const ORDER_BY_OFFICIAL_DATE = [
  { documentDate: { sort: "desc", nulls: "last" } },
  { createdAt: "desc" },
] as const;
```

- [ ] **Step 4: Run the tests**

Run: `npm test -- dates`
Expected: PASS, 5 tests.

- [ ] **Step 5: Add a sorting test**

Append to `test/dates.test.ts`:

```ts
// --- ordering, against the database ---
import { beforeEach } from "vitest";
import { resetDb, makePost, testDb } from "./db";
import { ORDER_BY_OFFICIAL_DATE } from "@/lib/dates";

describe("official date ordering", () => {
  beforeEach(resetDb);

  it("sorts dated documents by official date, undated ones after", async () => {
    const old = await makePost({ slug: "old-order" });
    const recent = await makePost({ slug: "recent-order" });
    await makePost({ slug: "undated-order" });

    await testDb.post.update({
      where: { id: old.id },
      data: { documentDate: new Date("2023-01-01") },
    });
    await testDb.post.update({
      where: { id: recent.id },
      data: { documentDate: new Date("2026-01-01") },
    });

    const posts = await testDb.post.findMany({
      orderBy: ORDER_BY_OFFICIAL_DATE as never,
      select: { slug: true },
    });

    expect(posts.map((p) => p.slug)).toEqual([
      "recent-order",
      "old-order",
      "undated-order",
    ]);
  });
});
```

Run: `npm test -- dates`
Expected: PASS, 6 tests.

- [ ] **Step 6: Adopt the ordering in every public list**

In `app/(public)/page.tsx`, `app/(public)/orders/page.tsx` (both queries), and `app/(public)/category/[slug]/page.tsx`, replace every `orderBy: { createdAt: "desc" }` with:

```ts
      orderBy: ORDER_BY_OFFICIAL_DATE as never,
```

and add `documentDate: true` to any `select` that currently selects `createdAt`. Import from `@/lib/dates`.

- [ ] **Step 7: Fix the displayed label**

Search for the string `Published` across `app/(public)/`:

```bash
grep -rn "Published" "app/(public)"
```

At each site that prints a post date, replace the hardcoded label and raw date with:

```tsx
<span className="font-mono text-[10px] text-inkSoft">
  {dateLabel(post)} · {formatDate(officialDate(post))}
</span>
```

- [ ] **Step 8: Add the admin input**

In `app/admin/posts/_components/PostFormClient.tsx`, add a `documentDate` state and a date input beside the existing `actionDeadline` field, labelled **"Official document date"** with helper text: *"The date the department issued this order. Leave blank if you cannot verify it — do not guess."*

In `lib/validation/post.ts`, add `documentDate: Date | null;` to `PostInput`, read it in `parsePostForm` the same way `actionDeadline` is read, and add to `validatePost`:

```ts
  if (input.documentDate && Number.isNaN(input.documentDate.getTime())) {
    errors.push("Official document date is not a valid date.");
  }
  if (input.documentDate && input.documentDate.getTime() > Date.now()) {
    errors.push("Official document date cannot be in the future.");
  }
```

Add the matching cases to `test/validation-post.test.ts` and add `documentDate: input.documentDate` to the `data` object in both `createPost` and `updatePost`.

- [ ] **Step 9: Run everything**

Run: `npm test && npx tsc --noEmit && npm run build`
Expected: all pass.

- [ ] **Step 10: Commit**

```bash
git add lib/dates.ts test/dates.test.ts lib/validation/post.ts test/validation-post.test.ts app/ 
git commit -m "feat: sort and label posts by official document date with an honest fallback"
```

---

### Task 14: Replace the universal lifecycle

`LifecycleStepper.tsx` forces every document through Notified → Apply open → Hall ticket → Results, and maps `statusBadge: "expired"` to stage 4 "Results". A DA arrears circular therefore displays at "Results".

The rule: recruitment stages render only for `documentType === "notification"`. Every other document type renders its `orderState` — Current, Amended, Superseded, or Archived.

**Files:**
- Create: `lib/posts/lifecycle.ts`
- Create: `test/lifecycle.test.ts`
- Create: `app/(public)/_components/OrderStateBadge.tsx`
- Modify: `app/(public)/posts/[slug]/page.tsx` (the stepper call site)
- Modify: `app/(public)/posts/[slug]/_components/LifecycleStepper.tsx` (accept the resolved stage set)
- Modify: `app/admin/posts/_components/PostFormClient.tsx` (add `documentType` and `orderState` selects)
- Modify: `prisma/schema.prisma` (drop `docType`)

**Interfaces:**
- Consumes: `DocType`, `OrderState` from `@prisma/client` (Task 12).
- Produces: `resolveLifecycle(post: { documentType: DocType | null; statusBadge: string; orderState: OrderState }): LifecycleView`, where

```ts
type LifecycleView =
  | { kind: "recruitment"; stages: string[]; currentStage: number; isExpired: boolean }
  | { kind: "state"; state: OrderState; label: string };
```

- [ ] **Step 1: Write the failing test**

Create `test/lifecycle.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import { resolveLifecycle } from "@/lib/posts/lifecycle";

describe("resolveLifecycle", () => {
  it("shows recruitment stages for a notification", () => {
    const view = resolveLifecycle({
      documentType: "notification",
      statusBadge: "hall_ticket",
      orderState: "current",
    });
    expect(view.kind).toBe("recruitment");
    if (view.kind !== "recruitment") throw new Error("wrong kind");
    expect(view.stages).toEqual(["Notified", "Apply open", "Hall ticket", "Results"]);
    expect(view.currentStage).toBe(3);
  });

  it("never shows recruitment stages for a circular", () => {
    const view = resolveLifecycle({
      documentType: "circular",
      statusBadge: "results",
      orderState: "current",
    });
    expect(view.kind).toBe("state");
  });

  it("never shows Hall ticket or Results for a government order", () => {
    const view = resolveLifecycle({
      documentType: "go",
      statusBadge: "expired",
      orderState: "archived",
    });
    if (view.kind !== "state") throw new Error("wrong kind");
    expect(view.label).toBe("Archived");
    expect(JSON.stringify(view)).not.toMatch(/Hall ticket|Results/);
  });

  it("labels each order state", () => {
    const cases = [
      ["current", "Current"],
      ["amended", "Amended"],
      ["superseded", "Superseded"],
      ["archived", "Archived"],
    ] as const;
    for (const [state, label] of cases) {
      const view = resolveLifecycle({ documentType: "memo", statusBadge: "notification", orderState: state });
      if (view.kind !== "state") throw new Error("wrong kind");
      expect(view.label).toBe(label);
    }
  });

  it("treats an unknown document type as a plain state document", () => {
    const view = resolveLifecycle({
      documentType: null,
      statusBadge: "apply_link",
      orderState: "current",
    });
    expect(view.kind).toBe("state");
  });

  it("marks an expired recruitment notification as expired at the final stage", () => {
    const view = resolveLifecycle({
      documentType: "notification",
      statusBadge: "expired",
      orderState: "current",
    });
    if (view.kind !== "recruitment") throw new Error("wrong kind");
    expect(view.isExpired).toBe(true);
    expect(view.currentStage).toBe(4);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- lifecycle`
Expected: FAIL — cannot resolve `@/lib/posts/lifecycle`.

- [ ] **Step 3: Write `lib/posts/lifecycle.ts`**

```ts
import type { DocType, OrderState } from "@prisma/client";

export const RECRUITMENT_STAGES = ["Notified", "Apply open", "Hall ticket", "Results"];

const STAGE_INDEX: Record<string, number> = {
  notification: 1,
  apply_link: 2,
  hall_ticket: 3,
  results: 4,
  expired: 4,
};

const STATE_LABEL: Record<OrderState, string> = {
  current: "Current",
  amended: "Amended",
  superseded: "Superseded",
  archived: "Archived",
};

export type LifecycleView =
  | { kind: "recruitment"; stages: string[]; currentStage: number; isExpired: boolean }
  | { kind: "state"; state: OrderState; label: string };

export type LifecycleInput = {
  documentType: DocType | null;
  statusBadge: string;
  orderState: OrderState;
};

/**
 * Application stages (hall tickets, results) only make sense for recruitment and
 * examination notifications such as TET and DSC. A GO, circular, memo, or
 * proceeding has no application lifecycle — it is current, amended, superseded,
 * or archived.
 */
export function resolveLifecycle(post: LifecycleInput): LifecycleView {
  if (post.documentType === "notification") {
    return {
      kind: "recruitment",
      stages: RECRUITMENT_STAGES,
      currentStage: STAGE_INDEX[post.statusBadge] ?? 1,
      isExpired: post.statusBadge === "expired",
    };
  }

  return {
    kind: "state",
    state: post.orderState,
    label: STATE_LABEL[post.orderState],
  };
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test -- lifecycle`
Expected: PASS, 6 tests.

- [ ] **Step 5: Write `OrderStateBadge.tsx`**

```tsx
import type { OrderState } from "@prisma/client";
import Badge from "./Badge";

const VARIANT: Record<OrderState, "success" | "turmeric" | "kumkum" | "neutral"> = {
  current: "success",
  amended: "turmeric",
  superseded: "kumkum",
  archived: "neutral",
};

const EXPLANATION: Record<OrderState, string> = {
  current: "This order is in force.",
  amended: "This order has been amended by a later order.",
  superseded: "This order has been replaced by a later order.",
  archived: "Historical record, no longer in force.",
};

export default function OrderStateBadge({
  state,
  label,
}: {
  state: OrderState;
  label: string;
}) {
  return (
    <div className="w-full bg-paperRaised border border-hair rounded-xl p-4 md:p-5 mb-6">
      <div className="text-[10px] font-mono tracking-wider text-inkSoft mb-2">
        Document Status
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <Badge variant={VARIANT[state]} size="sm" shape="pill" dot>
          {label}
        </Badge>
        <span className="text-xs text-inkSoft">{EXPLANATION[state]}</span>
      </div>
    </div>
  );
}
```

If `Badge` does not support a `kumkum` variant, use `neutral` for `superseded` and open a note for Milestone F rather than inventing a variant here.

- [ ] **Step 6: Switch the call site**

In `app/(public)/posts/[slug]/page.tsx`, replace `<LifecycleStepper statusBadge={post.statusBadge} />` with:

```tsx
{(() => {
  const view = resolveLifecycle(post);
  return view.kind === "recruitment" ? (
    <LifecycleStepper
      stages={view.stages}
      currentStage={view.currentStage}
      isExpired={view.isExpired}
    />
  ) : (
    <OrderStateBadge state={view.state} label={view.label} />
  );
})()}
```

Add `documentType: true` and `orderState: true` to the post query if it uses an explicit `select` (it currently uses `include`, so both come through already).

- [ ] **Step 7: Simplify `LifecycleStepper.tsx`**

Delete `STAGES` and `getStageIndex` — that logic now lives in `lib/posts/lifecycle.ts`. Change the props to:

```tsx
type StepperProps = {
  stages: string[];
  currentStage: number;
  isExpired: boolean;
};

export default function LifecycleStepper({ stages, currentStage, isExpired }: StepperProps) {
```

Replace every reference to `STAGES` with `stages` and to `current` with `currentStage`. The rendering markup below is unchanged.

- [ ] **Step 8: Add the admin controls**

In `PostFormClient.tsx`, add two selects:
- **Document type** → `documentType`, options `go / circular / memo / proceeding / notification / other`.
- **Order state** → `orderState`, options `current / amended / superseded / archived`, default `current`, with helper text: *"Only shown for orders, circulars, memos and proceedings. Recruitment notifications show application stages instead."*

Add both to `PostInput`, `parsePostForm`, and the `data` objects in `createPost` and `updatePost`. Add validation cases rejecting values outside each enum, with matching tests in `test/validation-post.test.ts`.

- [ ] **Step 9: Drop the legacy column**

Now that nothing reads `docType`, remove it. Confirm first:

```bash
grep -rn "docType" app lib prisma --include=*.ts --include=*.tsx | grep -v documentType
```

Expected: no results outside the backfill script. Then delete the `docType String?` line from `model Post` in `prisma/schema.prisma`, and run:

```bash
npm run db:backup
npx prisma db push
```

PowerShell, for the test database:

```powershell
$env:DATABASE_URL="postgresql://portal:portal_dev_password@localhost:5433/portal_test?schema=public"; npx prisma db push
```

- [ ] **Step 10: Run everything**

Run: `npm test && npx tsc --noEmit && npm run build`
Expected: all pass.

- [ ] **Step 11: Manual check — the acceptance criterion**

Seed, publish the DA arrears circular from `/admin/posts`, and open it. It must show **Document Status: Current**, not a stepper, and the words "Hall ticket" and "Results" must not appear anywhere on the page. Then publish the TET notification and confirm it *does* show the four-stage stepper.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: replace the universal recruitment lifecycle with document-appropriate status"
```

---

# Milestone D — Reliable public data

Acceptance: content changes appear consistently, and outages never masquerade as "no documents found".

---

### Task 15: Distinguish a database failure from an empty result

There are 13 `catch (e)` blocks across 7 public files. Every one converts a database error into an empty array or a `null` post. Combined with `export const revalidate = 3600`, a transient failure during regeneration bakes an empty page — or a false 404 — into the cache for an hour.

The fix inverts the default: a query failure **throws**, so Next.js does not cache the render, and the route's error boundary shows an honest message. Only queries where an empty result is genuinely acceptable opt into a fallback.

**Files:**
- Create: `lib/db-safe.ts`
- Create: `test/db-safe.test.ts`
- Create: `app/(public)/error.tsx`
- Modify: all 7 public files listed below

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `safeQuery<T>(label: string, fn: () => Promise<T>): Promise<T>` — logs and rethrows on failure. Use for anything whose absence would misinform the reader.
  - `optionalQuery<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T>` — logs and returns the fallback. Use only for genuinely decorative surfaces.
  - `class DatabaseUnavailableError extends Error`.

- [ ] **Step 1: Write the failing test**

Create `test/db-safe.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { safeQuery, optionalQuery, DatabaseUnavailableError } from "@/lib/db-safe";

describe("safeQuery", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => errorSpy.mockRestore());

  it("returns the value on success", async () => {
    await expect(safeQuery("posts", async () => [1, 2, 3])).resolves.toEqual([1, 2, 3]);
  });

  it("throws DatabaseUnavailableError on failure", async () => {
    await expect(
      safeQuery("posts", async () => {
        throw new Error("connection refused");
      })
    ).rejects.toBeInstanceOf(DatabaseUnavailableError);
  });

  it("logs the label and the underlying error", async () => {
    await safeQuery("homepage-feed", async () => {
      throw new Error("connection refused");
    }).catch(() => {});
    expect(errorSpy).toHaveBeenCalled();
    const logged = errorSpy.mock.calls[0].join(" ");
    expect(logged).toContain("homepage-feed");
    expect(logged).toContain("connection refused");
  });

  it("does not swallow the failure into an empty array", async () => {
    const result = await safeQuery("posts", async () => {
      throw new Error("boom");
    }).catch((e) => e);
    expect(Array.isArray(result)).toBe(false);
  });
});

describe("optionalQuery", () => {
  beforeEach(() => vi.spyOn(console, "error").mockImplementation(() => {}));

  it("returns the value on success", async () => {
    await expect(optionalQuery("sidebar", async () => ["a"], [])).resolves.toEqual(["a"]);
  });

  it("returns the fallback on failure", async () => {
    await expect(
      optionalQuery(
        "sidebar",
        async () => {
          throw new Error("boom");
        },
        []
      )
    ).resolves.toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- db-safe`
Expected: FAIL — cannot resolve `@/lib/db-safe`.

- [ ] **Step 3: Write `lib/db-safe.ts`**

```ts
export class DatabaseUnavailableError extends Error {
  constructor(label: string, cause: unknown) {
    super(`Database query failed: ${label}`);
    this.name = "DatabaseUnavailableError";
    this.cause = cause;
  }
}

function log(label: string, error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[db] ${label} failed: ${message}`);
  if (error instanceof Error && error.stack) console.error(error.stack);
}

/**
 * For any query whose absence would misinform the reader. On failure this
 * THROWS rather than returning empty, so Next.js does not cache a broken
 * render and the route error boundary can say what actually happened.
 */
export async function safeQuery<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    log(label, error);
    throw new DatabaseUnavailableError(label, error);
  }
}

/**
 * For decorative surfaces only — a sidebar rail, a trending list. An empty
 * fallback here degrades the page without misinforming anyone.
 */
export async function optionalQuery<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    log(label, error);
    return fallback;
  }
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test -- db-safe`
Expected: PASS, 6 tests.

- [ ] **Step 5: Write the public error boundary**

Create `app/(public)/error.tsx`:

```tsx
"use client";

import { useEffect } from "react";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public route error]", error.digest ?? "", error.message);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto py-16 text-center space-y-4">
      <h1 className="text-display text-ink">This page could not be loaded</h1>
      <p className="text-sm text-inkSoft">
        Something went wrong on our side — this is not an empty section. Please try
        again in a moment.
      </p>
      <p lang="te" className="font-telugu text-sm text-inkSoft">
        సాంకేతిక సమస్య కారణంగా ఈ పేజీ లోడ్ కాలేదు. దయచేసి కొద్దిసేపటి తర్వాత ప్రయత్నించండి.
      </p>
      <button
        onClick={reset}
        className="font-mono text-xs font-bold text-tamarind border border-tamarind/40 rounded-lg px-4 py-2 hover:bg-tamarind/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tamarind"
      >
        Try again
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Replace every catch block**

Work through these files, replacing each `try { ... } catch (e) { x = [] }` with a `safeQuery` call:

| File | Query | Helper |
|---|---|---|
| `app/(public)/page.tsx` | posts feed | `safeQuery("homepage-feed", ...)` |
| `app/(public)/orders/page.tsx` | categories | `safeQuery("orders-categories", ...)` |
| `app/(public)/orders/page.tsx` | recent posts | `safeQuery("orders-recent", ...)` |
| `app/(public)/category/[slug]/page.tsx` | all three | `safeQuery("category-*", ...)` |
| `app/(public)/search/page.tsx` | posts | `safeQuery("search-index", ...)` |
| `app/(public)/posts/[slug]/page.tsx` | post detail | `safeQuery("post-detail", ...)` |
| `app/(public)/posts/[slug]/page.tsx` | sibling posts | `optionalQuery("post-siblings", ..., [])` |
| `app/(public)/_components/DesktopLeftNav.tsx` | categories | `optionalQuery("nav-categories", ..., [])` |

Example, for the homepage:

```ts
  const posts = await safeQuery("homepage-feed", () =>
    prisma.post.findMany({
      where: { isDraft: false },
      orderBy: ORDER_BY_OFFICIAL_DATE as never,
      take: 6,
      include: {
        category: true,
        relatedFrom: {
          where: { approved: true, relatedPost: { isDraft: false } },
          include: { relatedPost: true },
        },
      },
    })
  );
```

Leave `generateStaticParams` and `generateMetadata` returning their fallbacks — a build-time failure there should not fail the whole build.

- [ ] **Step 7: Critical — keep the 404 honest**

In `app/(public)/posts/[slug]/page.tsx` the post lookup must no longer collapse an error into `notFound()`. With `safeQuery` the error propagates to the boundary, and `notFound()` is reached only when the query genuinely returned nothing:

```ts
  const post = await safeQuery("post-detail", () =>
    prisma.post.findFirst({
      where: { slug: params.slug, isDraft: false },
      include: { /* ...as before... */ },
    })
  );

  if (!post) {
    notFound();
  }
```

The old `if (!post || post.isDraft)` check is redundant now that the where-clause filters drafts, but keep `if (!post)`.

- [ ] **Step 8: Verify the failure path by hand**

```bash
docker compose stop db
npm run dev
```

Open `/`. You must see the "This page could not be loaded" boundary — **not** "No published posts found." Then:

```bash
docker compose start db
```

Reload and confirm the page recovers.

- [ ] **Step 9: Run everything**

Run: `npm test && npx tsc --noEmit && npm run build`
Expected: all pass. `npm run build` needs the database running.

- [ ] **Step 10: Commit**

```bash
git add lib/db-safe.ts test/db-safe.test.ts "app/(public)"
git commit -m "fix: surface database failures instead of caching empty feeds and false 404s"
```

---

### Task 16: Revalidate every affected route

`createPost` revalidates only `/admin/posts`. `publishPost` adds `/`. `updatePost` and `deletePost` never touch a public path. A published edit can therefore stay stale for up to an hour.

**Files:**
- Create: `lib/posts/revalidate.ts`
- Create: `test/revalidate.test.ts`
- Modify: `app/actions/posts.ts` (all four actions)

**Interfaces:**
- Consumes: `revalidatePath` from `next/cache`.
- Produces: `revalidatePostPaths(post: { slug: string; categorySlug: string | null }): void` — revalidates `/admin/posts`, `/`, `/orders`, `/search`, `/posts/<slug>`, and `/category/<categorySlug>` when present.

- [ ] **Step 1: Write the failing test**

Create `test/revalidate.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePath(p) }));

import { revalidatePostPaths } from "@/lib/posts/revalidate";

function paths() {
  return revalidatePath.mock.calls.map((c) => c[0]);
}

describe("revalidatePostPaths", () => {
  beforeEach(() => revalidatePath.mockReset());

  it("revalidates every public surface a post appears on", () => {
    revalidatePostPaths({ slug: "go-129-transfers", categorySlug: "govt-orders" });
    expect(paths()).toEqual(
      expect.arrayContaining([
        "/",
        "/orders",
        "/search",
        "/admin/posts",
        "/posts/go-129-transfers",
        "/category/govt-orders",
      ])
    );
  });

  it("skips the category path when the post has no category", () => {
    revalidatePostPaths({ slug: "loose-post", categorySlug: null });
    expect(paths()).not.toContain("/category/null");
    expect(paths()).toContain("/posts/loose-post");
  });

  it("revalidates the search index", () => {
    revalidatePostPaths({ slug: "x", categorySlug: null });
    expect(paths()).toContain("/search");
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- revalidate`
Expected: FAIL — cannot resolve `@/lib/posts/revalidate`.

- [ ] **Step 3: Write `lib/posts/revalidate.ts`**

```ts
import { revalidatePath } from "next/cache";

export type RevalidateTarget = {
  slug: string;
  categorySlug: string | null;
};

/**
 * A post appears on the homepage feed, the orders index, its own detail page,
 * its category page, and the search index. Any create/update/delete must clear
 * all of them, or an hour-long ISR window will serve stale content.
 */
export function revalidatePostPaths(post: RevalidateTarget): void {
  revalidatePath("/admin/posts");
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/search");
  revalidatePath(`/posts/${post.slug}`);
  if (post.categorySlug) {
    revalidatePath(`/category/${post.categorySlug}`);
  }
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test -- revalidate`
Expected: PASS, 3 tests.

- [ ] **Step 5: Call it from all four actions**

Each action needs the slug and category slug. In `createPost`, the created post is already in hand — add `include: { category: { select: { slug: true } } }` to the `create` call, then:

```ts
  revalidatePostPaths({ slug: post.slug, categorySlug: post.category?.slug ?? null });
  redirect("/admin/posts");
```

In `publishPost` and `updatePost`, capture the result of the `update` the same way. In `deletePost`, read the post **before** deleting it:

```ts
export async function deletePost(postId: string) {
  await requireAdmin();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { slug: true, category: { select: { slug: true } } },
  });

  await prisma.post.delete({ where: { id: postId } });

  if (post) {
    revalidatePostPaths({ slug: post.slug, categorySlug: post.category?.slug ?? null });
  }
}
```

Remove the now-redundant bare `revalidatePath` calls from all four actions.

- [ ] **Step 6: Confirm the ISR strategy still fits**

Leave `export const revalidate = 3600` on all five public routes. With Task 15 no longer caching failures and this task revalidating on every write, the hourly window is only a safety net — publishes appear immediately. Record that reasoning as a comment above one of the `revalidate` exports so it is not "fixed" later by someone who thinks it is the primary mechanism.

- [ ] **Step 7: Manual check**

Run `npm run build && npm start`. Publish a post from `/admin/posts`, then load `/`, `/orders`, `/search`, and its category page. The post must be visible on all four immediately, without waiting.

- [ ] **Step 8: Commit**

```bash
git add lib/posts/revalidate.ts test/revalidate.test.ts app/actions/posts.ts "app/(public)"
git commit -m "fix: revalidate every public route affected by a post write"
```

---

# Milestone E — Search and discovery

> **Coupling note:** this milestone consumes `documentType` and `ORDER_BY_OFFICIAL_DATE` from Milestone C. If Milestone C landed differently, re-read Tasks 12–14 before starting here.

Acceptance: a user can find a document by GO number, Telugu phrase, or topic tag, and `/search?type=go` applies its promised filter.

---

### Task 17: Server-side search

`app/(public)/search/page.tsx` loads every published post (7 fields each) and hands the whole set to the browser, where `SearchUI` filters it in a `useMemo`. It matches title, GO reference, category, and docType — but not tags, not summaries. The `?type=` parameter that `orders/page.tsx` links to is read by nothing.

**Files:**
- Create: `lib/posts/query.ts`
- Create: `test/search-query.test.ts`
- Modify: `app/(public)/search/page.tsx`

**Interfaces:**
- Consumes: `ORDER_BY_OFFICIAL_DATE` (Task 13), `safeQuery` (Task 15), `DocType` (Task 12).
- Produces:

```ts
type SearchParams = {
  q?: string;
  type?: string;
  category?: string;
  tag?: string;
  from?: string;
  to?: string;
};
type SearchResult = {
  id: string; slug: string; titleEn: string; titleTe: string;
  goReference: string | null; summaryTe: string[]; tags: string[];
  documentType: DocType | null; documentDate: Date | null; createdAt: Date;
  category: { nameEn: string; slug: string } | null;
  relatedFrom: Array<{ relatedPost: { slug: string; titleEn: string } }>;
};
searchPosts(params: SearchParams): Promise<SearchResult[]>
```

- [ ] **Step 1: Write the failing test**

Create `test/search-query.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { searchPosts } from "@/lib/posts/query";
import { resetDb, seedCategory, testDb } from "./db";

async function fixture() {
  const cat = await seedCategory("govt-orders");
  await testDb.post.create({
    data: {
      slug: "da-arrears-2026",
      titleEn: "DA Arrears Payment Schedule",
      titleTe: "డీఏ బకాయిల చెల్లింపు షెడ్యూల్",
      summaryTe: ["ఉపాధ్యాయులకు డీఏ బకాయిలు మూడు విడతలుగా చెల్లించబడతాయి."],
      goReference: "G.O.Ms.No.77",
      tags: ["DA", "Arrears"],
      documentType: "circular",
      categoryId: cat.id,
      isDraft: false,
    },
  });
  await testDb.post.create({
    data: {
      slug: "transfers-go-129",
      titleEn: "District Allocation Guidelines",
      titleTe: "జిల్లా కేటాయింపు మార్గదర్శకాలు",
      summaryTe: ["సీనియారిటీ ఆధారంగా కేటాయింపు."],
      goReference: "G.O.Ms.No.129",
      tags: ["Transfers"],
      documentType: "go",
      categoryId: cat.id,
      isDraft: false,
    },
  });
  await testDb.post.create({
    data: {
      slug: "hidden-draft",
      titleEn: "Draft About Transfers",
      titleTe: "బదిలీల ముసాయిదా",
      summaryTe: ["ముసాయిదా."],
      tags: ["Transfers"],
      documentType: "go",
      isDraft: true,
    },
  });
}

describe("searchPosts", () => {
  beforeEach(async () => {
    await resetDb();
    await fixture();
  });

  it("matches an English title", async () => {
    const r = await searchPosts({ q: "District Allocation" });
    expect(r.map((p) => p.slug)).toEqual(["transfers-go-129"]);
  });

  it("matches a Telugu phrase", async () => {
    const r = await searchPosts({ q: "బకాయిల" });
    expect(r.map((p) => p.slug)).toEqual(["da-arrears-2026"]);
  });

  it("matches a GO number", async () => {
    const r = await searchPosts({ q: "G.O.Ms.No.129" });
    expect(r.map((p) => p.slug)).toEqual(["transfers-go-129"]);
  });

  it("matches a tag", async () => {
    const r = await searchPosts({ q: "arrears" });
    expect(r.map((p) => p.slug)).toContain("da-arrears-2026");
  });

  it("matches text inside a Telugu summary", async () => {
    const r = await searchPosts({ q: "మూడు విడతలుగా" });
    expect(r.map((p) => p.slug)).toEqual(["da-arrears-2026"]);
  });

  it("is case-insensitive", async () => {
    const r = await searchPosts({ q: "district allocation" });
    expect(r.map((p) => p.slug)).toEqual(["transfers-go-129"]);
  });

  it("never returns drafts", async () => {
    const r = await searchPosts({ q: "Transfers" });
    expect(r.map((p) => p.slug)).not.toContain("hidden-draft");
  });

  it("filters by document type", async () => {
    const r = await searchPosts({ type: "go" });
    expect(r.map((p) => p.slug)).toEqual(["transfers-go-129"]);
  });

  it("filters by category slug", async () => {
    const r = await searchPosts({ category: "govt-orders" });
    expect(r).toHaveLength(2);
  });

  it("filters by tag parameter", async () => {
    const r = await searchPosts({ tag: "Transfers" });
    expect(r.map((p) => p.slug)).toEqual(["transfers-go-129"]);
  });

  it("combines a query with a type filter", async () => {
    const r = await searchPosts({ q: "Transfers", type: "circular" });
    expect(r).toHaveLength(0);
  });

  it("ignores an unknown document type rather than returning everything", async () => {
    const r = await searchPosts({ type: "banana" });
    expect(r).toHaveLength(0);
  });

  it("returns nothing for an empty parameter set", async () => {
    const r = await searchPosts({});
    expect(r).toEqual([]);
  });

  it("returns approved related orders alongside each result", async () => {
    const [a, b] = await testDb.post.findMany({ where: { isDraft: false }, orderBy: { slug: "asc" } });
    await testDb.relatedOrder.create({
      data: { postId: a.id, relatedPostId: b.id, approved: true, source: "manual" },
    });
    const r = await searchPosts({ q: "DA Arrears" });
    expect(r[0].relatedFrom[0].relatedPost.slug).toBe(b.slug);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- search-query`
Expected: FAIL — cannot resolve `@/lib/posts/query`.

- [ ] **Step 3: Write `lib/posts/query.ts`**

```ts
import type { DocType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ORDER_BY_OFFICIAL_DATE } from "@/lib/dates";

const DOC_TYPES: DocType[] = ["go", "circular", "memo", "proceeding", "notification", "other"];

export type SearchParams = {
  q?: string;
  type?: string;
  category?: string;
  tag?: string;
  from?: string;
  to?: string;
};

const SELECT = {
  id: true,
  slug: true,
  titleEn: true,
  titleTe: true,
  goReference: true,
  summaryTe: true,
  tags: true,
  documentType: true,
  documentDate: true,
  createdAt: true,
  category: { select: { nameEn: true, slug: true } },
  relatedFrom: {
    where: { approved: true, relatedPost: { isDraft: false } },
    select: { relatedPost: { select: { slug: true, titleEn: true } } },
  },
} satisfies Prisma.PostSelect;

export type SearchResult = Prisma.PostGetPayload<{ select: typeof SELECT }>;

function textFilter(q: string): Prisma.PostWhereInput {
  const contains = { contains: q, mode: "insensitive" } as const;
  return {
    OR: [
      { titleEn: contains },
      { titleTe: contains },
      { goReference: contains },
      { englishAbstract: contains },
      { sourceDept: contains },
      { summaryTe: { hasSome: [q] } },
      { tags: { has: q } },
      // Postgres array columns cannot do a case-insensitive substring match in
      // Prisma, so tags and summary lines are also matched by raw id lookup below.
    ],
  };
}

export async function searchPosts(params: SearchParams): Promise<SearchResult[]> {
  const q = params.q?.trim();
  const hasFilter =
    Boolean(q) || Boolean(params.type) || Boolean(params.category) ||
    Boolean(params.tag) || Boolean(params.from) || Boolean(params.to);

  if (!hasFilter) return [];

  const and: Prisma.PostWhereInput[] = [{ isDraft: false }];

  if (q) {
    // Array columns need a raw ILIKE to match substrings inside elements.
    const arrayMatches = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "Post"
      WHERE "isDraft" = false
        AND (
          EXISTS (SELECT 1 FROM unnest("tags") t WHERE t ILIKE ${"%" + q + "%"})
          OR EXISTS (SELECT 1 FROM unnest("summaryTe") s WHERE s ILIKE ${"%" + q + "%"})
        )
    `;
    const ids = arrayMatches.map((row) => row.id);
    and.push({ OR: [textFilter(q), ...(ids.length ? [{ id: { in: ids } }] : [])] });
  }

  if (params.type) {
    // An unrecognised type must narrow to nothing, never widen to everything.
    if (!DOC_TYPES.includes(params.type as DocType)) return [];
    and.push({ documentType: params.type as DocType });
  }

  if (params.category) and.push({ category: { slug: params.category } });
  if (params.tag) and.push({ tags: { has: params.tag } });

  if (params.from || params.to) {
    const range: Prisma.DateTimeFilter = {};
    if (params.from) range.gte = new Date(params.from);
    if (params.to) range.lte = new Date(params.to);
    and.push({ OR: [{ documentDate: range }, { documentDate: null, createdAt: range }] });
  }

  return prisma.post.findMany({
    where: { AND: and },
    select: SELECT,
    orderBy: ORDER_BY_OFFICIAL_DATE as never,
    take: 100,
  });
}
```

- [ ] **Step 4: Run the tests**

Run: `npm test -- search-query`
Expected: PASS, 14 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/posts/query.ts test/search-query.test.ts
git commit -m "feat(search): add a server-side search query supporting q, type, category, tag, and dates"
```

---

### Task 18: Wire the search page to the server query

**Files:**
- Modify: `app/(public)/search/page.tsx`
- Modify: `app/(public)/search/_components/SearchUI.tsx`
- Create: `test/search-ui.test.tsx`

**Interfaces:**
- Consumes: `searchPosts`, `SearchResult`, `SearchParams` (Task 17); `safeQuery` (Task 15); `dateLabel`, `formatDate`, `officialDate` (Task 13).
- Produces: `SearchPage` accepts `{ searchParams }` and renders results server-side. `SearchUI` becomes a presentational client component: it owns the input and pushes query state to the URL, and receives `results` as a prop.

- [ ] **Step 1: Write the failing test**

Create `test/search-ui.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: push }),
  useSearchParams: () => new URLSearchParams("q=arrears&type=circular"),
  usePathname: () => "/search",
}));

import SearchUI from "@/app/(public)/search/_components/SearchUI";

const RESULT = {
  id: "1",
  slug: "da-arrears-2026",
  titleEn: "DA Arrears Payment Schedule",
  titleTe: "డీఏ బకాయిల చెల్లింపు షెడ్యూల్",
  goReference: "G.O.Ms.No.77",
  summaryTe: ["ఉపాధ్యాయులకు డీఏ బకాయిలు చెల్లించబడతాయి."],
  tags: ["DA", "Arrears"],
  documentType: "circular" as const,
  documentDate: new Date("2026-02-08"),
  createdAt: new Date("2026-08-01"),
  category: { nameEn: "Circulars", slug: "circulars" },
  relatedFrom: [{ relatedPost: { slug: "go-77-original", titleEn: "Original DA Order" } }],
};

describe("SearchUI", () => {
  it("seeds the input from the q parameter", () => {
    render(<SearchUI results={[RESULT]} query="arrears" activeType="circular" />);
    expect(screen.getByRole("searchbox")).toHaveValue("arrears");
  });

  it("renders a result with its Telugu title and tags", () => {
    render(<SearchUI results={[RESULT]} query="arrears" activeType="circular" />);
    expect(screen.getByText("DA Arrears Payment Schedule")).toBeInTheDocument();
    expect(screen.getByText("డీఏ బకాయిల చెల్లింపు షెడ్యూల్")).toBeInTheDocument();
    expect(screen.getByText("Arrears")).toBeInTheDocument();
  });

  it("surfaces approved related orders on a result", () => {
    render(<SearchUI results={[RESULT]} query="arrears" activeType="circular" />);
    expect(screen.getByText(/Original DA Order/)).toBeInTheDocument();
  });

  it("marks Telugu text with lang=te", () => {
    render(<SearchUI results={[RESULT]} query="arrears" activeType="circular" />);
    expect(screen.getByText("డీఏ బకాయిల చెల్లింపు షెడ్యూల్")).toHaveAttribute("lang", "te");
  });

  it("shows an empty state when a query returns nothing", () => {
    render(<SearchUI results={[]} query="zzzz" activeType={null} />);
    expect(screen.getByText(/No documents match/i)).toBeInTheDocument();
  });

  it("shows the prompt state when there is no query", () => {
    render(<SearchUI results={[]} query="" activeType={null} />);
    expect(screen.getByText(/Trending/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- search-ui`
Expected: FAIL — `SearchUI` takes a `posts` prop, not `results`/`query`/`activeType`.

- [ ] **Step 3: Rewrite `app/(public)/search/page.tsx`**

```tsx
import { searchPosts, type SearchParams } from "@/lib/posts/query";
import { safeQuery } from "@/lib/db-safe";
import SearchUI from "./_components/SearchUI";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search AP Teacher Orders — AP Teacher Desk",
  description:
    "Search AP School Education government orders, circulars, and notifications.",
};

// Results depend on the query string, so this route cannot be statically cached.
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const results = await safeQuery("search", () => searchPosts(searchParams));

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      <div className="border-b border-hair pb-4">
        <h1 className="text-display tracking-tight text-ink">Search Portal</h1>
        <p className="text-xs text-inkSoft font-mono mt-1">
          Search AP Government Orders, Circulars, and Guidance by GO number, Telugu
          phrase, or topic tag
        </p>
      </div>

      <SearchUI
        results={results}
        query={searchParams.q ?? ""}
        activeType={searchParams.type ?? null}
      />
    </div>
  );
}
```

The `<Suspense>` wrapper is no longer needed — there is no `useSearchParams` in a statically-rendered subtree once the page is `force-dynamic`.

- [ ] **Step 4: Rewrite `SearchUI.tsx` as presentational**

Key changes:
- Props become `{ results: SearchResult[]; query: string; activeType: string | null }`.
- Delete the `useMemo` filter and the `posts` prop entirely.
- The input keeps local state for typing, and pushes to the URL on submit (and on a 400 ms debounce), preserving `type` so query state is shareable:

```tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ...inside the component:
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(query);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params?.toString() ?? "");
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      router.push(`/search?${next.toString()}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [value, params, router]);
```

- Give the input `type="search"` so `getByRole("searchbox")` finds it.
- Add type filter chips that link to `/search?type=go` etc., preserving `q`, with the chip for `activeType` visually marked and carrying `aria-current="true"`.
- Render each result with: English title, Telugu title (`lang="te"`), GO reference, `dateLabel`/`formatDate` from `lib/dates`, the first Telugu summary line (`lang="te"`), tag chips linking to `/search?tag=<tag>`, and — when `relatedFrom` is non-empty — a "Related: <titles>" line.
- Three distinct states: `query === "" && results.length === 0` → trending prompt; `query !== "" && results.length === 0` → "No documents match your search."; otherwise the result list.

Keep the existing `highlightMatch` helper and apply it to `titleEn` and `titleTe`.

- [ ] **Step 5: Run the tests**

Run: `npm test -- search-ui`
Expected: PASS, 6 tests.

- [ ] **Step 6: Verify the Orders shortcut**

`app/(public)/orders/page.tsx` links to `/search?type=go`. With Task 17 that parameter now filters. Confirm the link text says what it does — change "Search All Orders" to "Search Government Orders", since the filter is `type=go`.

- [ ] **Step 7: Manual check**

Run `npm run dev`. Search a GO number, a Telugu word from a summary, and a tag. Click a tag chip and confirm the URL becomes `/search?tag=...` and is shareable — paste it into a new tab and get the same results.

- [ ] **Step 8: Run everything**

Run: `npm test && npx tsc --noEmit && npm run build`
Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add "app/(public)/search" "app/(public)/orders/page.tsx" test/search-ui.test.tsx
git commit -m "feat(search): move filtering server-side with shareable URL query state"
```

---

# Milestone F — Visual system

> **Coupling note:** this milestone assumes the token set in `tailwind.config.js` is unchanged and that class-based dark mode is the chosen strategy. If you decide instead to remove dark mode, Task 20 becomes a deletion and Task 21 disappears.

Acceptance: light and dark both pass contrast checks, with consistent typography and colours.

---

### Task 19: Load the specified fonts

`AGENTS.md` requires Space Grotesk for English/UI. `tailwind.config.js` maps `font-sans` to Noto Sans, and `app/globals.css` imports only Noto Sans, Noto Sans Telugu, and IBM Plex Mono. The specified UI font has never been loaded.

The `@import url(...)` in `globals.css` is also the slowest way to load webfonts — it blocks on the CSS parse. `next/font/google` self-hosts them and eliminates the render-blocking request. Since `app/layout.tsx` is being touched for `lang` in Task 22 anyway, do it properly here.

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css` (remove the `@import`, keep everything else)
- Modify: `tailwind.config.js` (`fontFamily`)
- Create: `test/typography.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS variables `--font-space-grotesk`, `--font-noto-telugu`, `--font-plex-mono` on `<html>`; Tailwind `font-sans`, `font-telugu`, `font-mono` resolve to them.

- [ ] **Step 1: Write the failing test**

Create `test/typography.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

describe("typography configuration", () => {
  it("loads Space Grotesk", () => {
    expect(read("app/layout.tsx")).toContain("Space_Grotesk");
  });

  it("maps font-sans to Space Grotesk, not Noto Sans", () => {
    const config = read("tailwind.config.js");
    const sansLine = config.split("\n").find((l) => l.includes("sans:")) ?? "";
    expect(sansLine).toContain("space-grotesk");
    expect(sansLine).not.toContain("Noto Sans\"");
  });

  it("keeps Noto Sans Telugu for the telugu family", () => {
    const config = read("tailwind.config.js");
    const line = config.split("\n").find((l) => l.includes("telugu:")) ?? "";
    expect(line).toContain("noto-telugu");
  });

  it("no longer blocks rendering on a Google Fonts @import", () => {
    expect(read("app/globals.css")).not.toContain("@import url(\"https://fonts.googleapis.com");
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- typography`
Expected: FAIL on all four.

- [ ] **Step 3: Load the fonts in `app/layout.tsx`**

```tsx
import "./globals.css";
import type { Metadata } from "next";
import { Space_Grotesk, Noto_Sans_Telugu, IBM_Plex_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const notoTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-telugu",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AP Teacher Desk",
  description: "AP Teachers Living Document Portal",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${notoTelugu.variable} ${plexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Point Tailwind at the variables**

In `tailwind.config.js`:

```js
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        telugu: ["var(--font-noto-telugu)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
```

- [ ] **Step 5: Clean up `globals.css`**

Delete the `@import url("https://fonts.googleapis.com/...")` line. In the `body` rule, replace the hardcoded `font-family` with `font-family: var(--font-space-grotesk), system-ui, sans-serif;`. In the `.text-telugu-title` utility, replace `font-family: "Noto Sans Telugu", sans-serif;` with `font-family: var(--font-noto-telugu), sans-serif;`.

- [ ] **Step 6: Run the tests and build**

Run: `npm test -- typography && npm run build`
Expected: PASS; build succeeds (`next/font` downloads at build time — network access required).

- [ ] **Step 7: Manual check**

Run `npm run dev`. English UI text renders in Space Grotesk (distinctly geometric, with its characteristic single-storey `a`). Telugu passages are unchanged. Confirm no Telugu glyph has fallen back to a substitute font.

- [ ] **Step 8: Commit**

```bash
git add app/layout.tsx app/globals.css tailwind.config.js test/typography.test.ts
git commit -m "fix(ui): load Space Grotesk via next/font and drop the blocking Google Fonts import"
```

---

### Task 20: Make dark mode one mechanism

Dark mode is currently two mechanisms that do not agree:

1. `ThemeToggle` adds/removes a `.dark` class on `<html>`.
2. `tailwind.config.js` has **no `darkMode` key**, so Tailwind defaults to the `media` strategy. The five `dark:` utilities in the codebase therefore respond to the OS preference and ignore the toggle entirely.
3. `globals.css` patches only five utilities (`bg-paper`, `bg-paperRaised`, `border-hair`, `text-ink`, `text-inkSoft`) under `html.dark` with `!important`.

A user on a light OS who clicks "Night Mode" gets that five-class patch and nothing else — which is exactly the faded, half-styled result the audit describes. Everything using `bg-white`, `bg-slate-*`, `text-slate-*`, or a raw hex stays light.

**Files:**
- Modify: `tailwind.config.js` (add `darkMode`, add semantic token layer)
- Modify: `app/globals.css` (replace the `!important` patch with CSS variables)
- Modify: `app/(public)/_components/ThemeToggle.tsx` (remove the `dark:` slate classes)
- Create: `test/dark-mode.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `darkMode: "class"` in Tailwind config. Colour tokens resolve through CSS variables that flip under `html.dark`, so `bg-paper` / `text-ink` are correct in both themes with no `!important` and no per-component `dark:` variants.

- [ ] **Step 1: Write the failing test**

Create `test/dark-mode.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");
const config = () => read("tailwind.config.js");
const css = () => read("app/globals.css");

function sourceFiles(dir: string): string[] {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? sourceFiles(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

describe("dark mode strategy", () => {
  it("uses the class strategy so the toggle actually works", () => {
    expect(config()).toMatch(/darkMode:\s*["']class["']/);
  });

  it("does not force theme colours with !important", () => {
    expect(css()).not.toMatch(/html\.dark[^}]*!important/s);
  });

  it("defines the palette as CSS variables", () => {
    expect(css()).toContain("--color-paper");
    expect(css()).toContain("--color-ink");
  });
});

describe("colour token discipline", () => {
  const ALLOWED_HEX = new Set<string>(); // no raw hex in components

  it("uses no raw hex colours in public components", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles("app/(public)")) {
      const source = read(file);
      const matches = source.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
      for (const hex of matches) {
        if (!ALLOWED_HEX.has(hex)) offenders.push(`${file}: ${hex}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("uses no default Tailwind slate/gray colours in public components", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles("app/(public)")) {
      if (/\b(bg|text|border)-(slate|gray|zinc|neutral|stone)-\d{2,3}\b/.test(read(file))) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("references no undefined colour token", () => {
    const defined = config();
    const offenders: string[] = [];
    for (const file of sourceFiles("app/(public)")) {
      for (const match of read(file).matchAll(/\b(?:bg|text|border|ring)-([a-z]+[A-Z][a-zA-Z]*)\b/g)) {
        const token = match[1];
        if (!defined.includes(`${token}:`)) offenders.push(`${file}: ${token}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- dark-mode`
Expected: FAIL — no `darkMode` key, `!important` present, raw hex in several components, and `tamarindDark` undefined.

- [ ] **Step 3: Add the missing token and the dark strategy**

In `tailwind.config.js`:

```js
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        ink: "var(--color-ink)",
        inkSoft: "var(--color-inkSoft)",
        turmeric: "var(--color-turmeric)",
        turmericDeep: "var(--color-turmericDeep)",
        tamarind: "var(--color-tamarind)",
        tamarindDark: "var(--color-tamarindDark)",
        kumkum: "var(--color-kumkum)",
        paper: "var(--color-paper)",
        paperRaised: "var(--color-paperRaised)",
        hair: "var(--color-hair)",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        telugu: ["var(--font-noto-telugu)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
```

`tamarindDark` is added, not removed. It is referenced by `Button.tsx` (`hover:bg-tamarindDark`, the shared primary button) and `TaxCalculatorUI.tsx` — removing the class would silently delete hover feedback from every tamarind button on the site.

- [ ] **Step 4: Define both palettes in `globals.css`**

Replace the entire `html.dark` block with:

```css
:root {
  --color-ink: #1B2A4A;
  --color-inkSoft: #33456B;
  --color-turmeric: #E8A33D;
  --color-turmericDeep: #C7811F;
  --color-tamarind: #2F6B4F;
  --color-tamarindDark: #245640;
  --color-kumkum: #B5432E;
  --color-paper: #EDE8DC;
  --color-paperRaised: #F7F4EC;
  --color-hair: #D8D2C1;
}

html.dark {
  --color-ink: #F5F2E9;
  --color-inkSoft: #A9B4C7;
  --color-turmeric: #F0B45C;
  --color-turmericDeep: #E8A33D;
  --color-tamarind: #5FA37E;
  --color-tamarindDark: #4A8A67;
  --color-kumkum: #E0705A;
  --color-paper: #131A28;
  --color-paperRaised: #1C2536;
  --color-hair: #33405A;
}

body {
  background: var(--color-paper);
  color: var(--color-ink);
  font-family: var(--font-space-grotesk), system-ui, sans-serif;
  transition: background-color 0.2s ease, color 0.2s ease;
}
```

Every `bg-paper`, `text-ink`, `border-hair` in the codebase now resolves correctly in both themes with no `!important` and no per-component `dark:` variant.

- [ ] **Step 5: Verify the dark values meet contrast**

Check each pair with a contrast checker. Required: `--color-ink` on `--color-paper` and on `--color-paperRaised` at **4.5:1 or better**; `--color-inkSoft` on `--color-paper` at **4.5:1** for body text (3:1 is only acceptable for text at 18.66px+ bold or 24px+). Adjust the dark values above until they pass — the listed values are a starting point, not a verified palette. Record the measured ratios in the commit message.

- [ ] **Step 6: Purge raw hex and default Tailwind colours**

Run the failing test to get the list:

```bash
npm test -- dark-mode
```

Work the offender list. Common replacements:
- `bg-[#FAF7F2]` → `bg-paperRaised`
- `dark:bg-slate-800` → delete (the token now handles it)
- `dark:border-slate-700` → delete
- `text-white` on a tamarind button → keep; white on `--color-tamarind` is intentional and passes in both themes.

In `ThemeToggle.tsx`, remove `dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700 dark:text-slate-200` — the base token classes are now correct in both themes.

Check the whole codebase, including `app/(public)/tools/**`, `HeroCard.tsx`, `PostCard.tsx`, and `DesktopSidebar.tsx`. `DesktopLeftNav.tsx` keeps `cat.color` as an inline style — that value comes from the database, not from source, and the test only scans source files.

- [ ] **Step 7: Prevent the flash of light theme**

`ThemeToggle` applies the class in `useEffect`, which runs after first paint — a dark-mode user sees a white flash on every navigation. Add a blocking inline script in `app/layout.tsx`, before `{children}`:

```tsx
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})()`,
          }}
        />
      </head>
```

This is the one legitimate use of `dangerouslySetInnerHTML` here: the script must run before paint, and it contains no user input.

- [ ] **Step 8: Run everything**

Run: `npm test && npx tsc --noEmit && npm run build`
Expected: all pass, including the three colour-discipline tests.

- [ ] **Step 9: Manual check**

Run `npm run dev` with your OS in **light** mode. Click "Night Mode". Every surface must go dark — sidebars, cards, the tools pages, the search results. Reload: no white flash. Then set the OS to dark with no stored preference and confirm the page starts dark.

- [ ] **Step 10: Commit**

```bash
git add tailwind.config.js app/globals.css app/layout.tsx "app/(public)" test/dark-mode.test.ts
git commit -m "fix(ui): unify dark mode on the class strategy with variable-backed tokens"
```

---

### Task 21: Simplify the dense sidebars

The audit flags "dense sidebars and premature engagement-oriented elements", and `AGENTS.md` forbids optimising for engagement. The "Status Hierarchy" card in `DesktopLeftNav` lists four status types with descriptions but is not interactive — it explains a taxonomy nobody asked about, above the fold.

**Files:**
- Modify: `app/(public)/_components/DesktopLeftNav.tsx`
- Modify: `app/(public)/_components/DesktopSidebar.tsx`
- Modify: `test/dark-mode.test.ts` (extend, no new file)

- [ ] **Step 1: Read the current sidebars and list what each element does for a teacher**

```bash
npm run dev
```

Open `/` at 1440px. For each card in both sidebars, write one sentence answering: *what does a teacher do with this?* Anything you cannot answer is a candidate for removal.

- [ ] **Step 2: Remove the Status Hierarchy card**

Delete the second `<Card>` from `DesktopLeftNav.tsx` entirely. The status of a document is shown on the document — a legend for it in the nav rail is noise. This also removes the "GOIR Verified / Official AP Govt Gazette" copy, which asserts a verification standard the site is still establishing.

- [ ] **Step 3: Audit `DesktopSidebar.tsx` against the same test**

Remove any element that counts, streaks, trends, or nudges. Keep anything that helps a teacher find a document: recent orders, a deadline list, links to the tools.

- [ ] **Step 4: Add a guard test**

Append to `test/dark-mode.test.ts`:

```ts
describe("no engagement-oriented UI", () => {
  it("uses no streak, trending-count, or nudge language in the sidebars", () => {
    const banned = /streak|don't miss|hurry|trending now|\d+ people|viewers|most popular/i;
    for (const file of ["app/(public)/_components/DesktopLeftNav.tsx", "app/(public)/_components/DesktopSidebar.tsx"]) {
      expect(read(file)).not.toMatch(banned);
    }
  });
});
```

- [ ] **Step 5: Fix mobile horizontal overflow**

At 360px width, check for a horizontal scrollbar on `/`, `/orders`, `/search`, `/tools`, and a post page. The usual causes here are fixed-width flex children and long unbroken GO reference strings. Add `min-w-0` to flex children that contain text, and `break-words` to any element rendering a GO reference or URL. Confirm with DevTools that `document.documentElement.scrollWidth === document.documentElement.clientWidth`.

- [ ] **Step 6: Run everything**

Run: `npm test && npm run build`
Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add "app/(public)/_components" test/dark-mode.test.ts
git commit -m "refactor(ui): simplify sidebars and fix mobile horizontal overflow"
```

---

# Milestone G — Accessibility

Acceptance: all core flows work without a mouse and contain no invalid interactive nesting.

---

### Task 22: Language, focus, and interactive nesting

Three defects from the audit, fixed together because they touch the same components:

1. `<html lang="en">` is correct as a default, but Telugu passages carry no `lang="te"`, so a screen reader pronounces Telugu with English phonetics.
2. Focus outlines are removed (`focus:outline-none`) in several places without a replacement indicator.
3. Several `<Link>` elements contain nested `<button>` elements — invalid HTML, and it gives assistive technology two nested interactive controls.

**Files:**
- Modify: `app/(public)/layout.tsx` and every component rendering Telugu
- Modify: `app/globals.css` (global focus-visible default)
- Modify: components with nested buttons (found in Step 3)
- Create: `test/a11y.test.ts`

- [ ] **Step 1: Write the failing test**

Create `test/a11y.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf8");

function tsxFiles(dir: string): string[] {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? tsxFiles(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

const FILES = tsxFiles("app/(public)");

describe("accessibility guards", () => {
  it("marks every font-telugu element with lang=te", () => {
    const offenders: string[] = [];
    for (const file of FILES) {
      const source = read(file);
      for (const match of source.matchAll(/<(\w+)[^>]*className={?[^>]*font-telugu[^>]*>/g)) {
        // The opening tag must also carry lang="te".
        if (!/lang="te"/.test(match[0])) offenders.push(`${file}: ${match[0].slice(0, 80)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("never strips a focus outline without a focus-visible replacement", () => {
    const offenders: string[] = [];
    for (const file of FILES) {
      const source = read(file);
      if (/focus:outline-none/.test(source) && !/focus-visible:ring|focus-visible:outline/.test(source)) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("has no button nested inside a link", () => {
    const offenders: string[] = [];
    for (const file of FILES) {
      const source = read(file);
      // Crude but effective: a <Link ...> whose closing </Link> is preceded by a <button
      for (const match of source.matchAll(/<Link[\s\S]{0,600}?<\/Link>/g)) {
        if (/<button|<Button/.test(match[0])) offenders.push(`${file}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `npm test -- a11y`
Expected: FAIL, with a concrete offender list for each of the three rules. Keep that list — it is your work queue.

- [ ] **Step 3: Add `lang="te"` to every Telugu element**

For each offender from rule 1, add `lang="te"` to the element carrying `font-telugu`:

```tsx
<div lang="te" className="font-telugu text-[11px] text-inkSoft">
  {post.titleTe}
</div>
```

Do not add `lang="te"` to a wrapper that also contains English — the attribute must scope exactly the Telugu run.

- [ ] **Step 4: Add a global focus-visible default**

In `app/globals.css`, inside `@layer base`:

```css
@layer base {
  :where(a, button, input, select, textarea, summary, [tabindex]):focus-visible {
    outline: 2px solid var(--color-tamarind);
    outline-offset: 2px;
    border-radius: 4px;
  }
}
```

`:where()` keeps specificity at zero, so any component that wants a different indicator can still override it. Then, for each offender from rule 2, either delete the `focus:outline-none` (the global rule now covers it) or add an explicit `focus-visible:ring-2 focus-visible:ring-tamarind`.

- [ ] **Step 5: Unnest the buttons**

For each offender from rule 3, choose one:
- If the whole card is the click target: delete the inner `<button>` and style the `<Link>` to look like a button.
- If the button does something different from the link (e.g. a dismiss action): move it out of the `<Link>` as a sibling, positioned absolutely.

Never nest them. `Button.tsx` should gain a `asChild`-style escape hatch only if the same pattern recurs more than twice.

- [ ] **Step 6: Fix the tab controls**

`EducationTabs` is gone with Task 5, but the orders and tools pages have filter chips. For any chip group acting as tabs, either:
- Make them links (`<Link href="/orders?type=go">`) — simplest and shareable, matching Task 18's approach, or
- If they must stay buttons, add `role="tablist"` on the container, `role="tab"` + `aria-selected` on each, `role="tabpanel"` + `aria-labelledby` on the panel, and arrow-key handling.

Prefer links. They need no ARIA, they work with the keyboard by default, and they preserve state in the URL.

- [ ] **Step 7: Respect reduced motion**

`BottomNav` renders `animate-pulse` on the active indicator. In `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 8: Run the tests**

Run: `npm test -- a11y`
Expected: PASS, 3 tests.

- [ ] **Step 9: Manual keyboard pass**

With the mouse untouched, Tab through `/`, `/orders`, `/search`, `/tools`, and a post page at both 1440px and 360px. Every interactive element must show a visible focus ring, tab order must follow visual order, and no element may be reachable but invisible. Test the theme toggle, every nav link, the search input, and the PDF link with Enter and Space.

- [ ] **Step 10: Commit**

```bash
git add "app/(public)" app/globals.css test/a11y.test.ts
git commit -m "fix(a11y): add Telugu lang attributes, focus-visible rings, and unnest interactive controls"
```

---

# Milestone H — Release gate

### Task 23: Full verification pass

This task adds no features. It proves the previous 22 held.

**Files:**
- Create: `test/link-crawl.test.ts`
- Create: `docs/RELEASE-CHECKLIST.md`

- [ ] **Step 1: Write the internal link crawl**

Every internal `href` in the codebase must resolve to either a real route file or a real post/category slug. This is what would have caught all five broken links in the original audit.

Create `test/link-crawl.test.ts`:

```ts
// @vitest-environment node
import { describe, it, expect, beforeAll } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { testDb } from "./db";

function tsxFiles(dir: string): string[] {
  const full = path.join(process.cwd(), dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? tsxFiles(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

// Static routes that exist as page.tsx files.
const STATIC_ROUTES = new Set([
  "/", "/orders", "/search", "/tools", "/admin", "/admin/posts", "/admin/posts/new",
  "/tools/cfms-checker", "/tools/da-arrears", "/tools/gpf-apgli",
  "/tools/leave-encashment", "/tools/tax-calculator",
]);

let postSlugs: Set<string>;
let categorySlugs: Set<string>;

beforeAll(async () => {
  postSlugs = new Set((await testDb.post.findMany({ select: { slug: true } })).map((p) => p.slug));
  categorySlugs = new Set(
    (await testDb.category.findMany({ select: { slug: true } })).map((c) => c.slug)
  );
});

describe("internal link crawl", () => {
  it("every hardcoded internal href resolves", () => {
    const broken: string[] = [];

    for (const file of tsxFiles("app")) {
      const source = fs.readFileSync(path.join(process.cwd(), file), "utf8");
      for (const match of source.matchAll(/href="(\/[^"{}]*)"/g)) {
        const href = match[1].split("?")[0].replace(/\/$/, "") || "/";

        if (STATIC_ROUTES.has(href)) continue;
        if (href.startsWith("/posts/")) {
          if (!postSlugs.has(href.slice("/posts/".length))) broken.push(`${file}: ${href}`);
          continue;
        }
        if (href.startsWith("/category/")) {
          if (!categorySlugs.has(href.slice("/category/".length))) broken.push(`${file}: ${href}`);
          continue;
        }
        broken.push(`${file}: ${href} (unknown route)`);
      }
    }

    expect(broken).toEqual([]);
  });
});
```

Note: this test needs the test database seeded. Run `npm run db:seed` against the test DB first, or the post-slug assertions will report false failures.

- [ ] **Step 2: Run it**

Run: `npm test -- link-crawl`
Expected: PASS. If it fails, each line names the file and the dead href — fix them, do not weaken the test.

- [ ] **Step 3: Run the whole automated suite**

```bash
npm test
npx tsc --noEmit
npm run build
```

Expected: all tests pass; no type errors; the build reports its page count and shared JS. Record both numbers — the pre-remediation baseline was 28 pages / ~87 KB shared first-load JS, and deleting `/education` should reduce the page count.

- [ ] **Step 4: Write `docs/RELEASE-CHECKLIST.md`**

```markdown
# Release checklist

Run before every deploy. Automated items are covered by `npm test`; the rest are manual.

## Automated
- [ ] `npm test` — all suites pass
- [ ] `npx tsc --noEmit` — no type errors
- [ ] `npm run build` — production build succeeds

## Content correctness
- [ ] No post shows "GOIR Verified" without a real source URL to the gazette entry
- [ ] No ordinary circular, GO, memo, or proceeding displays "Hall Ticket" or "Results"
- [ ] Every published post shows either a verified "Issued" date or the honest
      "Added to portal" fallback — never a guessed official date
- [ ] No `[DEMO]` post is published

## Publishing pipeline
- [ ] A new post created in the admin is a draft and does not appear on `/`
- [ ] Publishing it makes it appear immediately on `/`, `/orders`, `/search`, and its category
- [ ] Editing a published post updates all four surfaces immediately
- [ ] Deleting it removes it from all four immediately
- [ ] Its slug 404s after deletion, and the tab title does not leak the old title

## Reliability
- [ ] With the database stopped, `/` shows the error boundary, not "No published posts found"
- [ ] With the database restarted, the page recovers on reload

## Presentation
- [ ] Light and dark both render every surface correctly at 360px and 1440px
- [ ] No horizontal scrollbar at 360px on any route
- [ ] Telugu renders in Noto Sans Telugu; English UI in Space Grotesk
- [ ] Contrast: ink-on-paper and inkSoft-on-paper measure 4.5:1 or better in both themes

## Accessibility
- [ ] Every core flow completes with the keyboard alone
- [ ] Every focused control shows a visible ring
- [ ] Telugu passages carry `lang="te"`

## Quality-First content check (do this with 5–10 real posts)
- [ ] Each summary was written from the source PDF, not transcribed from its tables
- [ ] No numeric or tabular data has been lifted out of a PDF into post text
- [ ] Each GO reference matches the source document exactly
- [ ] Each `verifiedAgainstGoir` post was checked against GOIR by a human, today
```

- [ ] **Step 5: Work the checklist**

Do it for real, against 5–10 genuine verified posts as the audit's acceptance criteria require. Anything that fails is a bug to fix, not a box to tick.

- [ ] **Step 6: Commit**

```bash
git add test/link-crawl.test.ts docs/RELEASE-CHECKLIST.md
git commit -m "test: add internal link crawl and the release checklist"
```

---

## Calculator boundary cases (deferred, deliberately)

The original Phase 8 lists "calculator boundary cases" as required coverage. The five tools under `app/(public)/tools/` — DA arrears, tax, GPF/APGLI, leave encashment, CFMS — were not examined during the audit, and specifying their boundary tests without reading their arithmetic would mean inventing expected values. That is exactly the kind of placeholder this plan avoids.

Treat it as a separate plan: read `lib/calculators/da-arrears.ts` and each tool's `_components/`, derive the boundary cases from the actual formulas and the governing GO, and write them there. It does not block this remediation, because the calculators are pure client-side arithmetic with no bearing on the trust, scope, or publishing defects fixed above.

---

## Plan self-review

Checked against the eight-phase spec:

| Spec phase | Covered by | Notes |
|---|---|---|
| 1.1 out-of-scope content | Tasks 4, 5 | TET/DSC retained as posts per the decision taken |
| 1.2 four-tab mobile nav | Task 4 | |
| 1.3 Prisma document types | Task 6 | Corrected: links target `Category`, not `Post.docType` |
| 1.4 repair 404 links | Tasks 5, 6, 23 | Task 23 adds the crawl that prevents recurrence |
| 1.5 seed records | Task 8 | |
| 1.6 hide ad placeholder | Task 7 | Deleted rather than hidden |
| 2.1 createPost draft | Task 9 | |
| 2.2 explicit publish | Task 9 | Already existed; test now locks it in |
| 2.3 validation | Task 10 | |
| 2.4 no self-relation | Task 10 | Existing guard kept, validator added in front |
| 2.5 no draft leaks | Task 11 | Two real leaks found beyond the spec's scope |
| 2.6 hashed password | Task 3 | **Moved into Milestone A** — exploitable today |
| 2.7 authorise actions | Task 2 | **Moved into Milestone A** — same reason |
| 3.1 backup | Task 12 | Gated: do not proceed without seeing `CREATE TABLE "Post"` |
| 3.2 publishedAt/documentDate | Task 12 | |
| 3.3 careful backfill | Task 12 | `documentDate` deliberately not backfilled |
| 3.4 sort by official date | Task 13 | |
| 3.5–3.7 lifecycle | Task 14 | |
| 4.1 revalidation | Task 16 | |
| 4.2–4.4 DB failure handling | Task 15 | |
| 4.5 ISR strategy | Task 16, Step 6 | |
| 5.1–5.7 search | Tasks 17, 18 | |
| 6.1 fonts | Task 19 | |
| 6.2–6.3 tokens | Task 20 | `tamarindDark` added, not removed |
| 6.4 dark mode | Task 20 | Root cause was the missing `darkMode` key |
| 6.5 sidebars | Task 21 | |
| 6.6 mobile overflow | Task 21, Step 5 | |
| 7.1–7.7 accessibility | Task 22 | |
| 8 verification | Task 23 | Calculator cases deferred with a stated reason |

**Two spec items intentionally not implemented as written:**

- *"Either temporarily remove dark mode or implement it completely"* — Task 20 implements it. Removal was the cheaper option, but the toggle already ships and removing a visible feature is a bigger regression than fixing the one-line strategy bug behind it.
- *"Calculator boundary cases"* — deferred to its own plan, with the reasoning above.
