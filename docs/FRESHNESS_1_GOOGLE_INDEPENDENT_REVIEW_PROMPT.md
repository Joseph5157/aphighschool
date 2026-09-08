# FRESHNESS-1 Closure Record

## Status

Closed after the post-commit audit and closure verification on 2026-09-08.

## Historical record

- Original baseline: `58e112adea8afc97a6b377aafbd8a9fbc00cbf07`
- FRESHNESS-1 implementation: `e645941b4de8cc4a891770f824f1f8cb2f3f58e7`
- GOIR provenance hardening: `d9772bc1034c59fab7d0d1fa6eda345ecd25b036`

`e645941` is directly based on the original baseline. The earlier version of
this file incorrectly described the implementation as uncommitted.

## Verified behavior

- Collection pages describe published documents without making universal GOIR
  or official-repository claims.
- `GOIR Verified` is a per-document label, rendered only for
  `verifiedAgainstGoir === true`.
- Admin validation requires an exact `https://goir.ap.gov.in` source URL before
  a document can be marked GOIR verified.
- `documentDate` is labelled `Issued`; a `createdAt` fallback is labelled
  `Added to portal`.
- Generic `updatedAt` is not presented as a verification or freshness date.
- An explicit past action deadline is labelled `Deadline passed`; it does not
  invent a broader lifecycle state.
- Source links are labelled neutrally.

## Closure verification

The repository's documented test target is the local Docker Postgres database
named `portal_test` at port 5433, as configured in `.env.test`. It was created
empty with the local compose service and schema-synchronised using:

```powershell
$env:DATABASE_URL = "postgresql://portal:portal_dev_password@localhost:5433/portal_test?schema=public"
npx prisma db push
```

No production or `portal_dev` data was used. The focused FRESHNESS, trust,
lifecycle, detail-rendering, date, and provenance tests pass against that test
database. Rendered coverage verifies conditional GOIR presentation on Orders
previews, Category rows, and document detail pages.

## Remaining limitations

- Browser acceptance was not run: the repository has no runnable Playwright
  dependency, and neither `python` nor the Windows Python launcher is
  available for the existing local helper.
- The test database is a local development prerequisite and must be created
  and schema-synchronised before database-backed tests run on a fresh machine.
