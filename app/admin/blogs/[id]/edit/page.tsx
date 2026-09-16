import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostEditor } from "@/components/admin/PostEditor";
import {
  getCategories,
  getImageLibrary,
  getPostById,
} from "@/lib/blog/queries";

export const metadata: Metadata = { title: "Edit post" };

export default async function EditPostPage(
  props: PageProps<"/admin/blogs/[id]/edit">,
) {
  const { id } = await props.params;

  const [post, categories, images] = await Promise.all([
    getPostById(id),
    getCategories(),
    getImageLibrary(),
  ]);

  if (!post) notFound();

  return <PostEditor post={post} categories={categories} images={images} />;
}
