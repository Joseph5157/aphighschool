# Portal CMS — Local Dev Scaffold

Admin CMS for the AP Teachers Living Document Portal (blueprint v2.0). This scaffold
focuses on the **admin CMS** first, per the agreed build sequence — the public site
(Home / Category / Article / Search) comes next.

Docker runs the **stateful services** (Postgres, Redis). The Next.js app itself runs
directly on your machine via `npm run dev` — this is the standard local setup and keeps
hot-reload fast (containerizing the Next.js dev server too is possible later, but adds
friction for no benefit at this stage).

## Prerequisites

- Docker + Docker Compose
- Node.js 20+
- npm

## Setup

```bash
# 1. Start Postgres + Redis
docker compose up -d

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env — at minimum set ADMIN_EMAIL, ADMIN_PASSWORD, and NEXTAUTH_SECRET
# Generate a secret with: openssl rand -base64 32

# 4. Push the schema to Postgres (no migration history yet — fine for local dev)
npm run db:push

# 5. Seed sample data (one background order + one linked post, per the blueprint example)
npm run db:seed

# 6. Run the app
npm run dev
```

Visit `http://localhost:3000/admin` — you'll be redirected to `/admin/login`. Sign in
with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` you set in `.env`.

## What's here

- `docker-compose.yml` — Postgres 16 + Redis 7, matching the blueprint's Section 6.1 stack
  (Postgres + Redis on Railway in production; this mirrors it locally).
- `prisma/schema.prisma` — the exact data model from blueprint Section 9, plus a
  `Category` model that was referenced but not yet defined there.
- `app/admin/` — the CMS: login, posts list, create/edit form.
- `app/actions/posts.ts` — server actions for create/update/delete (no separate API
  routes needed with Next.js App Router).
- The post form surfaces the **Quality-First checklist** (blueprint Section 4.1) directly
  in the UI as a reminder banner, and includes the **Related Orders** picker for the
  completeness requirement (Section 9.2).

## Running tests

Tests run against a dedicated `portal_test` Postgres database inside the same Docker
container as dev (`docker compose up -d db`, published on host port 5433). Config lives
in `.env.test` (loaded automatically by `vitest.config.ts`); it holds no real secrets.

After every schema change, push the schema to the test database:

```bash
$env:DATABASE_URL="postgresql://portal:portal_dev_password@localhost:5433/portal_test?schema=public"; npx prisma db push
```

(Bash equivalent: `DATABASE_URL="postgresql://portal:portal_dev_password@localhost:5433/portal_test?schema=public" npx prisma db push`)

Then run the tests:

```bash
npm test          # single run
npm run test:watch  # watch mode
```

## What's NOT here yet

- The public-facing site (Home Feed, Category Page, Living Document article view,
  Search, Utility Tools) — next in the build sequence.
- AI-assisted drafting (gpt-4o-mini for titles/summaries) and AI-suggested Related
  Orders — the picker here is fully manual for now; the schema already supports an
  `ai_suggested` source value for when that's added.
- Image/PDF upload flow — currently just a text field for a Google Drive link, per the
  Day-1 storage decision (Section 6.1).
- Password hashing for the admin login — the local `.env` password is compared in plain
  text, which is fine for local dev only. Before any real deployment, swap in bcrypt.

## A note on this environment

This scaffold was built and type-checked in a sandboxed container without full internet
access, so `npx prisma generate` and `npm run build` couldn't be fully verified end-to-end
here (Prisma's engine binaries are fetched from a domain the sandbox couldn't reach).
The code follows standard, well-tested patterns for this stack, but run through the setup
steps above on your own machine as the real verification — and let me know what you hit
if anything doesn't work as expected.
