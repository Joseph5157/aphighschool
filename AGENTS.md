# AGENTS.md — AP Teachers Living Document Portal

Read this before making any change. It's the condensed decision record from the project's
planning phase — treat it as binding context, not suggestions.

## What this project is

A Telugu-first information portal for **AP Teachers / School Education** government
orders and circulars. NOT Telangana, NOT other government departments, NOT general
students content — that scope is deliberately narrow. See "Scope Lock" below.

## The one thing that overrides every other instinct

**Quality over speed. Always.** There is no publishing SLA. If a choice trades accuracy
or completeness for faster shipping, take the slower option. This applies to code changes
too — don't rush a schema migration or cut a corner on the admin form validation to move
faster. The founder's own words: "publish nothing that week rather than rush."

## Scope Lock

- Geography: **AP only**. Do not add Telangana fields, routes, or content assumptions.
- Department: **Teachers / School Education only**. Do not generalize the schema toward
  "all government employees" even though that was in an earlier draft of the project.
- If a request seems to expand scope (e.g. "add a TS category"), flag it back to the user
  rather than silently accommodating it — this was an explicit, deliberate narrowing.

## Success metric

Reputation as the reliable, accurate source — not traffic, not ad revenue, not publishing
frequency. Don't optimize code or UX for engagement metrics (streaks, notification nudges,
infinite scroll) — none of that fits this project's actual goal.

## Tech stack (do not substitute without asking)

- **Frontend:** Next.js 14 (App Router), deploy target is Vercel.
- **Database:** PostgreSQL via Prisma. Local dev via `docker-compose.yml` (Postgres 16 +
  Redis 7). Production target is Railway (DB + Redis only — NOT app hosting, that's Vercel).
- **Auth:** NextAuth, Credentials provider, single admin account. This is a solo-operator
  tool — do not build multi-user/role management, it's out of scope.
- **Styling:** Tailwind CSS with the custom token set in `tailwind.config.js`
  (`ink`, `inkSoft`, `turmeric`, `turmericDeep`, `tamarind`, `kumkum`, `paper`, `paperRaised`,
  `hair`). Use these tokens, not raw hex values or default Tailwind colors.
- **Fonts:** Space Grotesk (English/UI), Noto Sans Telugu (`.font-telugu` class — never
  substitute or auto-transliterate Telugu text), IBM Plex Mono (`.font-mono` — metadata,
  dates, GO numbers, status labels).
- **PDF storage:** Google Drive links (Day 1 decision). Do not build Cloudflare R2 or S3
  upload flows unless explicitly asked — this was a deliberate scope cut.
- **AI drafting:** `gpt-4o-mini` is used only for drafting titles/Telugu summaries, NEVER
  for transcribing legal/table content from source PDFs. If you're asked to build a
  feature that reproduces GO table data as text, stop and flag it — see "Hard rules" below.

## Hard rules — do not do these even if asked casually

1. **Never build a feature that transcribes tabular/numeric data (PTR tables, pay scales,
   eligibility criteria) out of a PDF into post text.** This was explicitly rejected —
   see the "Related Orders, not full-text reproduction" decision below. Numeric/tabular
   data stays inside the embedded PDF viewer only.
2. **Never add a publishing deadline, SLA, or "must publish within X minutes" logic
   anywhere in the code.** This was explicitly retired from an earlier version of the plan.
3. **Never wire up WhatsApp or push notification (OneSignal) integrations** unless the
   user explicitly re-opens that decision — both are deliberately deferred, not forgotten.
4. **Never hash-check or plain-text-compare passwords in anything beyond local dev.** The
   current `ADMIN_PASSWORD` plain-text compare in `lib/auth.ts` is explicitly local-dev-only
   — flag it if asked to deploy without fixing it first.

## The data model's one non-obvious piece: Related Orders

Completeness (linking a post to the background orders that led to it) was ranked the
**#1 quality priority** by the founder — ahead of translation accuracy. The `RelatedOrder`
join table exists specifically for this. When building any post-related feature, consider
whether Related Orders context should surface there (e.g. search results, category pages).

## Navigation & Category Structure

- The public site uses a sticky bottom tab bar for primary navigation (`Home`, `Orders`, `Search`, `Tools`).
- The `Category` model organizes posts into structured types: `Government Orders`, `Circulars`, `Memos`, `Proceedings`, `Notifications`, `Tools`.
- We use the `docType` field on `Post` (e.g. `go`, `circular`, `memo`, `proceeding`, `notification`) and `tags` string array for flexible topic filtering on the front-end (e.g. `Transfers`, `PTR`).
- Do not hardcode specific topics as categories; keep categories strictly limited to the official document types above, and use `tags` for topics.

## Content/publishing workflow (for context, not code you need to build yet)

1. Founder monitors 2-3 competitor sites + GOIR (goir.ap.gov.in) manually as a "something
   happened" signal — no scraper/automation pipeline exists yet, and none should be built
   without being asked; it's an explicitly deferred phase.
2. Drafts go through the Quality-First checklist (see `.agents/skills/quality-checklist.md`)
   before publishing — this is a human process today, reflected in the CMS's reminder
   banner, not enforced by validation logic. Don't turn it into a hard blocking gate
   without being asked; the founder wants judgment calls, not a form that refuses submission.

## Build sequence (where we are)

1. ✅ Database schema (Prisma) — done
2. ✅ Admin CMS (login, post CRUD, Related Orders picker) — done, local-dev only
3. ⬜ Public site (Home Feed, Category Page, Living Document article view, Search, Utility
   Tools) — next. Reference the mockup screens already built (job-listing-card home feed,
   Stripe-changelog-style category page, numbered-stepper lifecycle indicator on articles)
   for the intended visual pattern.
4. ⬜ First 5-10 real posts published manually to validate the pipeline end-to-end.
5. ⬜ Everything else (ads, AI-suggested Related Orders, automated sourcing) — later,
   not blocking.

## Open decisions not yet made (don't assume an answer)

- Final domain name (placeholder branding used so far: "APTeacherDesk")
- Exact ad-activation threshold (agreed to be lower than 1,000 daily visitors, no fixed
  number chosen yet)
- Exact list of source URLs/departments to monitor beyond GOIR

## Scraper (scraper/ directory)
- Python service, runs independently of Next.js
- Writes to the SAME Postgres database as the CMS
- All scraped posts land as isDraft: true — never auto-published
- Entry point: python main.py scrape (run from scraper/ directory)
- Source: GOIR (goir.ap.gov.in) School Education department
- AI drafting via gpt-4o-mini — draft only, human reviews before publish
- PDF storage: Option A — direct source PDF URL stored as pdfUrl
  (no Google Drive upload automation — upgrade to Drive API later)
