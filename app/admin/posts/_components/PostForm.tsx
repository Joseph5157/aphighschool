import { prisma } from "@/lib/prisma";
import PostFormClient from "./PostFormClient";

type PostFormProps = {
  action: (formData: FormData) => Promise<void>;
  postId?: string; // present when editing, to exclude self from Related Orders list
  initial?: {
    titleEn: string;
    titleTe: string;
    summaryTe: string[];
    englishAbstract: string | null;
    statusBadge: string;
    pdfUrl: string | null;
    actionDeadline: Date | null;
    goReference: string | null;
    sourceDept: string | null;
    sourceUrl: string | null;
    categoryId: string | null;
    docType: string | null;
    tags: string[];
    verifiedAgainstGoir: boolean;
    relatedPostIds: string[];
  };
};

export default async function PostForm({ action, postId, initial }: PostFormProps) {
  const categories = await prisma.category.findMany({ orderBy: { nameEn: "asc" } });
  const candidatePosts = await prisma.post.findMany({
    where: postId ? { id: { not: postId } } : {},
    orderBy: { createdAt: "desc" },
    select: { id: true, titleEn: true, goReference: true },
    take: 100,
  });

  return (
    <PostFormClient
      action={action}
      postId={postId}
      initial={initial}
      categories={categories}
      candidatePosts={candidatePosts}
    />
  );
}
