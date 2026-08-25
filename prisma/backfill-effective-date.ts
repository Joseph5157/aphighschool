import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// effectiveDate (NOT NULL, DEFAULT now()) is app/actions/posts.ts's own sort
// helper for ORDER_BY_OFFICIAL_DATE — see lib/dates.ts — always meant to equal
// COALESCE(documentDate, createdAt). createPost/updatePost keep it correct for
// every row they write. But `prisma db push` cannot express that formula as a
// column default: when the column is first added to a table that already has
// rows, Postgres fills every existing row with the *migration's own
// timestamp*, not each row's real documentDate/createdAt. Undetectable by any
// query or test that only exercises the app's write paths, and silent in
// production — the symptom is a wrong sort order, not an error. This script
// repairs exactly that gap, and is safe to run any number of times: it only
// touches rows that have actually drifted from the formula.
async function main() {
  const affected = await prisma.$executeRaw`
    UPDATE "Post"
    SET "effectiveDate" = COALESCE("documentDate", "createdAt")
    WHERE "effectiveDate" IS DISTINCT FROM COALESCE("documentDate", "createdAt")
  `;

  console.log(`effectiveDate backfill: ${affected} row(s) corrected.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
