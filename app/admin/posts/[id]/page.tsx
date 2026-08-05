import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import PostForm from "../_components/PostForm";
import { updatePost } from "@/app/actions/posts";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { relatedFrom: true },
  });

  if (!post) notFound();

  const updateWithId = async (formData: FormData) => {
    "use server";
    await updatePost(post!.id, formData);
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Edit Post</h1>
      <PostForm
        action={updateWithId}
        postId={post.id}
        initial={{
          titleEn: post.titleEn,
          titleTe: post.titleTe,
          summaryTe: post.summaryTe,
          englishAbstract: post.englishAbstract,
          statusBadge: post.statusBadge,
          pdfUrl: post.pdfUrl,
          actionDeadline: post.actionDeadline,
          goReference: post.goReference,
          sourceDept: post.sourceDept,
          sourceUrl: post.sourceUrl,
          categoryId: post.categoryId,
          docType: post.docType,
          tags: post.tags,
          verifiedAgainstGoir: post.verifiedAgainstGoir,
          relatedPostIds: post.relatedFrom.map((r: { relatedPostId: string }) => r.relatedPostId),
        }}
      />
    </div>
  );
}
