"use server";

import type { DocType, OrderState, PostStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth-guard";
import { parsePostForm, validatePost } from "@/lib/validation/post";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createPost(formData: FormData) {
  await requireAdmin();

  const input = parsePostForm(formData);
  const errors = validatePost(input);
  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }

  if (input.categoryId) {
    const exists = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!exists) throw new Error("Selected category does not exist.");
  }

  // statusBadge / documentType / orderState arrive from parsePostForm as raw
  // FormData strings, and validatePost only *reports* errors rather than
  // narrowing, so TypeScript cannot see that this write is reached only for
  // values that passed the enum check above. The assertions are therefore
  // load-bearing. They name the real Prisma enums rather than `never`: `never`
  // is assignable to everything, so it also silenced any genuine type change
  // on the field. lib/validation/post.ts derives its accepted values from
  // these same enum objects, which is what makes the assertions true.
  const post = await prisma.post.create({
    data: {
      slug: `${slugify(input.titleEn)}-${Date.now().toString(36)}`,
      titleEn: input.titleEn,
      titleTe: input.titleTe,
      summaryTe: input.summaryTe,
      englishAbstract: input.englishAbstract,
      statusBadge: input.statusBadge as PostStatus,
      pdfUrl: input.pdfUrl,
      actionUrl: input.actionUrl,
      actionDeadline: input.actionDeadline,
      documentDate: input.documentDate,
      // effectiveDate is the sort/index helper (see lib/dates.ts). When
      // documentDate is set, pin it explicitly. When it's null, leave the
      // field out entirely: Postgres evaluates now() once per transaction, so
      // effectiveDate's @default(now()) resolves to the exact same value as
      // createdAt's — no read-back needed on create.
      effectiveDate: input.documentDate ?? undefined,
      goReference: input.goReference,
      sourceDept: input.sourceDept,
      sourceUrl: input.sourceUrl,
      categoryId: input.categoryId,
      documentType: input.documentType as DocType | null,
      orderState: input.orderState as OrderState,
      tags: input.tags,
      verifiedAgainstGoir: input.verifiedAgainstGoir,
      // isDraft intentionally omitted — the schema defaults to true.
      // Publishing is a separate, deliberate action (publishPost).
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

export async function publishPost(postId: string) {
  await requireAdmin();
  await prisma.post.update({
    where: { id: postId },
    data: { isDraft: false },
  });
  revalidatePath("/admin/posts");
  revalidatePath("/");
}

export async function updatePost(postId: string, formData: FormData) {
  await requireAdmin();

  const input = parsePostForm(formData, postId);
  const errors = validatePost(input);
  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }

  if (input.categoryId) {
    const exists = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!exists) throw new Error("Selected category does not exist.");
  }

  // Unlike create, update never re-evaluates column defaults, so effectiveDate
  // (the COALESCE(documentDate, createdAt) sort helper — see lib/dates.ts) has
  // to be computed here explicitly on every save, in both directions: setting
  // documentDate pins it, and clearing documentDate back to null must fall
  // back to this post's own original createdAt, not "now".
  const existing = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
    select: { createdAt: true },
  });

  await prisma.post.update({
    where: { id: postId },
    data: {
      titleEn: input.titleEn,
      titleTe: input.titleTe,
      summaryTe: input.summaryTe,
      englishAbstract: input.englishAbstract,
      statusBadge: input.statusBadge as PostStatus,
      pdfUrl: input.pdfUrl,
      actionUrl: input.actionUrl,
      actionDeadline: input.actionDeadline,
      documentDate: input.documentDate,
      effectiveDate: input.documentDate ?? existing.createdAt,
      goReference: input.goReference,
      sourceDept: input.sourceDept,
      sourceUrl: input.sourceUrl,
      categoryId: input.categoryId,
      documentType: input.documentType as DocType | null,
      orderState: input.orderState as OrderState,
      tags: input.tags,
      verifiedAgainstGoir: input.verifiedAgainstGoir,
    },
  });

  // Simplest correct approach for a solo-admin CMS: replace the related-orders set
  // each save, rather than diffing. Fine at this scale; revisit if it ever matters.
  await prisma.relatedOrder.deleteMany({ where: { postId } });
  for (const relatedId of input.relatedPostIds) {
    if (relatedId === postId) continue;
    await prisma.relatedOrder.create({
      data: { postId, relatedPostId: relatedId, source: "manual", approved: true },
    });
  }

  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePost(postId: string) {
  await requireAdmin();
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/admin/posts");
}
