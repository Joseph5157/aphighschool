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
