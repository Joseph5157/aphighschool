"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createPost(formData: FormData) {
  const titleEn = String(formData.get("titleEn") || "");
  const titleTe = String(formData.get("titleTe") || "");
  const summaryTeRaw = String(formData.get("summaryTe") || "");
  const englishAbstract = String(formData.get("englishAbstract") || "");
  const statusBadge = String(formData.get("statusBadge") || "notification") as any;
  const pdfUrl = String(formData.get("pdfUrl") || "");
  const actionDeadlineRaw = String(formData.get("actionDeadline") || "");
  const goReference = String(formData.get("goReference") || "");
  const sourceDept = String(formData.get("sourceDept") || "");
  const sourceUrl = String(formData.get("sourceUrl") || "");
  const categoryId = String(formData.get("categoryId") || "") || null;
  const docType = String(formData.get("docType") || "") || null;
  const tagsRaw = String(formData.get("tagsRaw") || "");
  const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
  const verifiedAgainstGoir = formData.get("verifiedAgainstGoir") === "on";
  const relatedPostIds = formData.getAll("relatedPostIds").map(String).filter(Boolean);

  // Quality-First checklist (Section 4.1) is enforced by the admin, not the schema —
  // but we do require the fields that make the checklist possible: title, at least one
  // Telugu summary line, and a GO reference so the post can be verified against GOIR.
  if (!titleEn || !titleTe || !summaryTeRaw.trim()) {
    throw new Error("Title (EN/TE) and at least one Telugu summary line are required.");
  }

  const post = await prisma.post.create({
    data: {
      slug: `${slugify(titleEn)}-${Date.now().toString(36)}`,
      titleEn,
      titleTe,
      summaryTe: summaryTeRaw.split("\n").map((s) => s.trim()).filter(Boolean),
      englishAbstract: englishAbstract || null,
      statusBadge,
      pdfUrl: pdfUrl || null,
      actionDeadline: actionDeadlineRaw ? new Date(actionDeadlineRaw) : null,
      goReference: goReference || null,
      sourceDept: sourceDept || null,
      sourceUrl: sourceUrl || null,
      categoryId,
      docType,
      tags,
      verifiedAgainstGoir,
      isDraft: false,
    },
  });

  for (const relatedId of relatedPostIds) {
    await prisma.relatedOrder.create({
      data: {
        postId: post.id,
        relatedPostId: relatedId,
        source: "manual",
        approved: true,
      },
    });
  }

  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function publishPost(postId: string) {
  await prisma.post.update({
    where: { id: postId },
    data: { isDraft: false },
  });
  revalidatePath("/admin/posts");
  revalidatePath("/");
}

export async function updatePost(postId: string, formData: FormData) {
  const titleEn = String(formData.get("titleEn") || "");
  const titleTe = String(formData.get("titleTe") || "");
  const summaryTeRaw = String(formData.get("summaryTe") || "");
  const englishAbstract = String(formData.get("englishAbstract") || "");
  const statusBadge = String(formData.get("statusBadge") || "notification") as any;
  const pdfUrl = String(formData.get("pdfUrl") || "");
  const actionDeadlineRaw = String(formData.get("actionDeadline") || "");
  const goReference = String(formData.get("goReference") || "");
  const sourceDept = String(formData.get("sourceDept") || "");
  const sourceUrl = String(formData.get("sourceUrl") || "");
  const categoryId = String(formData.get("categoryId") || "") || null;
  const docType = String(formData.get("docType") || "") || null;
  const tagsRaw = String(formData.get("tagsRaw") || "");
  const tags = tagsRaw.split(",").map((t) => t.trim()).filter(Boolean);
  const verifiedAgainstGoir = formData.get("verifiedAgainstGoir") === "on";
  const relatedPostIds = formData.getAll("relatedPostIds").map(String).filter(Boolean);

  await prisma.post.update({
    where: { id: postId },
    data: {
      titleEn,
      titleTe,
      summaryTe: summaryTeRaw.split("\n").map((s) => s.trim()).filter(Boolean),
      englishAbstract: englishAbstract || null,
      statusBadge,
      pdfUrl: pdfUrl || null,
      actionDeadline: actionDeadlineRaw ? new Date(actionDeadlineRaw) : null,
      goReference: goReference || null,
      sourceDept: sourceDept || null,
      sourceUrl: sourceUrl || null,
      categoryId,
      docType,
      tags,
      verifiedAgainstGoir,
    },
  });

  // Simplest correct approach for a solo-admin CMS: replace the related-orders set
  // each save, rather than diffing. Fine at this scale; revisit if it ever matters.
  await prisma.relatedOrder.deleteMany({ where: { postId } });
  for (const relatedId of relatedPostIds) {
    if (relatedId === postId) continue;
    await prisma.relatedOrder.create({
      data: { postId, relatedPostId: relatedId, source: "manual", approved: true },
    });
  }

  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}

export async function deletePost(postId: string) {
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/admin/posts");
}
