# Deploying the document-type / lifecycle schema change to production

This document covers the one deploy that takes a **populated** production database
from the pre-Milestone-C schema to the post-Task-14 schema. It is not a general
deploy guide, and after this migration has been run once it is history.

Read it end to end before you touch anything. The steps are ordered, and the
order is the whole point — running them out of sequence destroys data silently,
with no error and no failing test.

---

## Why this cannot be a single `prisma db push`

Between Task 12 and Task 14 the `Post` table changed in four ways:

| Change | Task |
| --- | --- |
| added `documentDate DateTime?` | 12 |
| added `documentType DocType?` | 12 |
| added `orderState OrderState @default(current)` | 12 |
| added `effectiveDate DateTime @default(now())` | 13 |
| **dropped `docType String?`** | 14 |

`prisma db push` applies whatever difference it finds between `schema.prisma` and
the live database, in one operation. If you push the *final* schema straight onto
a populated production database, that one operation both **adds `documentType`
(empty)** and **drops `docType`** — and `docType` is the only source the
`documentType` backfill can read.

The result: every production row ends with `documentType = NULL`, the column that
held the answer is gone, and nothing errors. Every document then falls through
`resolveLifecycle` as a plain state document, and the legacy type is recoverable
only from a database dump.

The `effectiveDate` column has a second, independent version of the same problem.
It is `NOT NULL DEFAULT now()`, so when Postgres adds it to a table that already
has rows it stamps **every existing row with the migration's own timestamp**. That
is not a crash; it is a wrong sort order. `ORDER_BY_OFFICIAL_DATE` sorts on this
column, so the whole portal silently reverts to the mis-sort Task 13 was written
to eliminate.

Neither failure is caught by the test suite. The suite exercises the app's write
paths (`createPost` / `updatePost`), which always maintain both columns correctly.
Only pre-existing rows are affected, and only on the deploy that introduces the
columns. Locally this never bit us because Task 12 pushed and backfilled while
`docType` was still present — which is exactly the order this document restores.

**The safe order is: back up → push while `docType` still exists → backfill
`documentType` → backfill `effectiveDate` → push the `docType` removal.**

---

## Step 0 — Get the two versions of `schema.prisma` you will need

Steps 2 and 6 need two *different* schema files:

- **Schema A** — new columns present, `docType` still present. Used in step 2.
- **Schema B** — new columns present, `docType` gone. This is what is committed
  on `main` today. Used in step 6.

You already have Schema B: it is the working tree. To produce Schema A, add the
legacy column back temporarily.

Open `prisma/schema.prisma`, find this block in `model Post`:

```prisma
  /// The document type as a closed set. Backfilled from the legacy free-text
  /// docType column, which was dropped in Task 14.
  documentType        DocType?
```

and insert one line directly above it, so the block reads:

```prisma
  docType             String?
  /// The document type as a closed set. Backfilled from the legacy free-text
  /// docType column, which was dropped in Task 14.
  documentType        DocType?
```

That single added line **is** Schema A. Do not commit it. After step 5 you will
discard it with `git checkout -- prisma/schema.prisma`, which restores Schema B
exactly.

> Cross-check, if you would rather read Schema A than write it: commit `604362a`
> ("fix: repeatable effectiveDate backfill…", the last commit before Task 14)
> carries Schema A as-committed — `git show 604362a:prisma/schema.prisma` prints
> it. Compare the **column lines** only. That version's `///` comments around
> `documentType` are worded differently (they still describe `docType` as a live
> column); comments have no effect on the pushed schema, so ignore the difference
> rather than copying the old file wholesale over your working tree.

Set your target once, and check it before every command in this document:

```bash
export DATABASE_URL="postgresql://USER:PASSWORD@PROD-HOST:5432/portal?schema=public"
```

---

## Step 1 — Take a real backup

```bash
pg_dump "$DATABASE_URL" > portal-pre-task14-$(date +%Y%m%dT%H%M%S).sql
```

**Do not use `npm run db:backup` for this.** That script shells out to
`docker compose exec db pg_dump -U portal portal_dev` — it is hardwired to the
local development container and the `portal_dev` database, and it ignores
`DATABASE_URL` entirely. Run against production it will either fail or, worse,
hand you a dump of your laptop's dev data under a confident filename.

**If you skip this step:** the `docType` drop in step 6 is irreversible. This dump
is the only copy of the legacy free-text column that will exist afterwards.

Confirm the dump is real before continuing — a truncated dump is worse than none,
because it looks like insurance:

```bash
ls -l portal-pre-task14-*.sql
grep -c "INSERT INTO\|COPY public" portal-pre-task14-*.sql
```

---

## Step 2 — Push Schema A (adds the new columns, keeps `docType`)

With Schema A in place from step 0:

```bash
npx prisma db push
```

Expect Prisma to report added columns and **no** data-loss warning. If it warns
that it is about to drop `docType`, you are pushing Schema B — stop, and redo
step 0.

**If you skip this step or merge it with step 6:** this is the failure described
at the top. `documentType` is added and `docType` is dropped in the same
operation, and the backfill in step 3 has nothing left to read.

Verify the new columns exist and the legacy one survived:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'Post'
  AND column_name IN ('docType', 'documentType', 'orderState', 'documentDate', 'effectiveDate')
ORDER BY column_name;
```

All five rows must be present.

---

## Step 3 — Backfill `documentType` from `docType`

```bash
npm run db:backfill
```

This reads `docType` through raw SQL (the Prisma client has no field for it any
more), maps the known free-text values onto the `DocType` enum, and writes
`other` for anything unrecognised — it never guesses. Unmapped values are printed
as warnings; read them.

**If you skip this step:** every row keeps `documentType = NULL`. `resolveLifecycle`
treats NULL as a plain state document, so recruitment notifications lose their
application stepper — the exact defect Task 14 set out to fix, inverted.

**If you move it after step 6:** `docType` no longer exists and the script fails
on a missing column. That is the *good* outcome; the bad one is having already
dropped the column and reaching for a dump.

Verify — the first query must return `0`:

```sql
-- Rows the backfill failed to reach.
SELECT count(*) AS missing_document_type FROM "Post" WHERE "documentType" IS NULL;

-- Sanity: how the legacy values actually mapped. Eyeball this.
SELECT "docType", "documentType", count(*)
FROM "Post"
GROUP BY 1, 2
ORDER BY 3 DESC;
```

A large `other` bucket is not automatically wrong, but it means the legacy data
held values the map does not know about. Check the second query before moving on;
after step 6 you can no longer ask this question.

---

## Step 4 — Backfill `effectiveDate`

```bash
npm run db:backfill-effective-date
```

**If you skip this step:** no error, no failing test — every row that existed
before step 2 sorts by the deploy timestamp instead of its real document date.
The portal's ordering is quietly wrong everywhere `ORDER_BY_OFFICIAL_DATE` is
used: the homepage, `/orders`, category pages, search, and the sibling-post rail.

The script is idempotent and only touches rows that have actually drifted, so
running it twice is safe. Expect it to report a row count equal to roughly the
whole table on this first run.

Verify — must return `0`:

```sql
SELECT count(*) AS drifted
FROM "Post"
WHERE "effectiveDate" IS DISTINCT FROM COALESCE("documentDate", "createdAt");
```

`IS DISTINCT FROM`, not `<>`: with NULLs involved, `<>` returns NULL rather than
true and the query would report `0` no matter how badly the column had drifted.

---

## Step 5 — Check the application before removing anything

Deploy the application build and confirm the portal renders correctly while
`docType` is still present. Everything from here on is reversible; after step 6 it
is not.

- A circular or GO shows **Document Status**, not a stepper.
- A recruitment notification shows the four-stage stepper.
- `/orders` and the homepage are sorted newest-first by document date.
- The admin edit form pre-selects the stored Document Type and Order State.

**If you skip this step:** you drop the legacy column before knowing whether the
migrated data is right, and lose the ability to re-run step 3 against real values.

---

## Step 6 — Push Schema B (drops `docType`)

Discard the temporary edit from step 0:

```bash
git checkout -- prisma/schema.prisma
git diff --stat prisma/schema.prisma   # must print nothing
```

Then:

```bash
npx prisma db push --accept-data-loss
```

Prisma will warn that it is about to drop `docType` and report how many non-null
values it contains. That warning is expected here and only here — you have a
dump from step 1 and a verified backfill from step 3. `--accept-data-loss` is
required for this one command; do not carry the habit into any other step.

Confirm the column is gone and nothing else changed:

```sql
SELECT count(*) AS should_be_zero
FROM information_schema.columns
WHERE table_name = 'Post' AND column_name = 'docType';
```

---

## Rollback

Before step 6, rollback is: restore Schema A, `npx prisma db push`, redeploy the
previous build. The data is intact throughout.

After step 6, the legacy column is gone and rollback means restoring the step 1
dump into a scratch database and re-deriving what you need from it. This is the
reason step 5 exists.

---

## Afterwards

Once this migration has run in production, `prisma/backfill-document-type.ts` has
no remaining purpose — it reads a column that no longer exists anywhere. Leave it
until the production migration is confirmed complete, then delete it along with
this document.
