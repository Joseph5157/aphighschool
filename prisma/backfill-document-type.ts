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

// Read through raw SQL, not the Prisma client. "docType" is a legacy column
// that no longer exists in schema.prisma (dropped in Task 14), so the generated
// client has no field for it and a typed select would not compile. This script
// is a one-shot migration that must run against a database where the column is
// still present — see docs/PRODUCTION-MIGRATION.md for the required ordering.
type LegacyRow = { id: string; docType: string | null; slug: string };

async function main() {
  const posts = await prisma.$queryRaw<LegacyRow[]>`
    SELECT "id", "docType", "slug" FROM "Post" WHERE "documentType" IS NULL
  `;

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
