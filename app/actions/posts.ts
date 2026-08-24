"use server";

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

  await prisma.post.update({
    where: { id: postId },
    data: {
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
