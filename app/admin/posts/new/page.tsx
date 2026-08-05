import PostForm from "../_components/PostForm";
import { createPost } from "@/app/actions/posts";

export const dynamic = "force-dynamic";

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-xl font-bold mb-6">New Post</h1>
      <PostForm action={createPost} />
    </div>
  );
}
