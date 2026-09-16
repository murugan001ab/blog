import type { Metadata } from "next";

import { PostEditor } from "@/components/admin/PostEditor";
import { getCategories, getImageLibrary } from "@/lib/blog/queries";

export const metadata: Metadata = { title: "New post" };

export default async function NewPostPage() {
  const [categories, images] = await Promise.all([
    getCategories(),
    getImageLibrary(),
  ]);

  return <PostEditor categories={categories} images={images} />;
}
