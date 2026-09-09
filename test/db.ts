import { PrismaClient, type DocType, type OrderState, type PostStatus } from "@prisma/client";

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
  documentType: DocType | null;
  orderState: OrderState;
  statusBadge: PostStatus;
  verifiedAgainstGoir: boolean;
  sourceUrl: string | null;
  pdfUrl: string | null;
  /** Explicit portal-added timestamp, for tests that depend on ordering rather
   * than on the row happening to be inserted first. */
  createdAt: Date;
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
      // Spread these in only when the caller asked for them, so an omitted
      // override still exercises the column's own schema default rather than a
      // value this helper invented. test/schema-shape.test.ts depends on that.
      ...(overrides.documentType !== undefined && { documentType: overrides.documentType }),
      ...(overrides.orderState !== undefined && { orderState: overrides.orderState }),
      ...(overrides.statusBadge !== undefined && { statusBadge: overrides.statusBadge }),
      ...(overrides.verifiedAgainstGoir !== undefined && {
        verifiedAgainstGoir: overrides.verifiedAgainstGoir,
      }),
      ...(overrides.sourceUrl !== undefined && { sourceUrl: overrides.sourceUrl }),
      ...(overrides.pdfUrl !== undefined && { pdfUrl: overrides.pdfUrl }),
      ...(overrides.createdAt !== undefined && { createdAt: overrides.createdAt }),
    },
  });
}
