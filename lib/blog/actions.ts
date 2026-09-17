"use server";

import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type {
  ActionResult,
  BlogPost,
  BlogPostInput,
  Category,
  MediaImage,
} from "@/types/blog";
import { requireAdmin } from "@/lib/auth";
import {
  getAllCategories,
  getAllPosts,
  getPostById,
  removeImage,
  removePost,
  saveCategories,
  savePost,
  writeImage,
} from "@/lib/blog/store";
import { autoExcerpt } from "@/lib/utils/rich-text";
import { createId, slugify, uniqueSlug } from "@/lib/utils/slug";

/**
 * All write operations live here. Every export re-checks authorization because
 * Server Actions are individually addressable endpoints.
 */

/** Refresh every route whose output depends on post data. */
function revalidateBlog(slug?: string, previousSlug?: string): void {
  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/category/[category]", "page");
  revalidatePath("/admin");
  revalidatePath("/admin/blogs");
  revalidatePath("/sitemap.xml");

  if (slug) revalidatePath(`/blog/${slug}`);
  if (previousSlug && previousSlug !== slug) {
    revalidatePath(`/blog/${previousSlug}`);
  }
}

/* ── Posts ─────────────────────────────────────────────────────────────── */

export async function savePostAction(
  input: BlogPostInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  await requireAdmin();

  const title = input.title.trim();
  if (!title) {
    return { ok: false, message: "A title is required." };
  }

  const now = new Date().toISOString();
  const existing = input.id ? await getPostById(input.id) : null;

  if (input.id && !existing) {
    return { ok: false, message: "That post no longer exists." };
  }

  // Slug must stay unique across every post except the one being edited.
  const allPosts = await getAllPosts();
  const takenSlugs = allPosts
    .filter((post) => post.id !== existing?.id)
    .map((post) => post.slug);

  const requestedSlug = slugify(input.slug || title);
  const slug =
    existing && existing.slug === requestedSlug
      ? existing.slug
      : uniqueSlug(requestedSlug, takenSlugs);

  const content = Array.isArray(input.content) ? input.content : [];
  const excerpt = input.excerpt.trim() || autoExcerpt(content);

  const post: BlogPost = {
    id: existing?.id ?? createId(),
    title,
    slug,
    excerpt,
    content,
    featuredImage: input.featuredImage || null,
    author: input.author.trim() || "Anonymous",
    category: input.category || "uncategorized",
    tags: normalizeTags(input.tags),
    published: Boolean(input.published),
    // publishedAt is stamped once, the first time a post goes live.
    publishedAt: input.published ? (existing?.publishedAt ?? now) : null,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    seoTitle: input.seoTitle.trim() || title,
    seoDescription: input.seoDescription.trim() || excerpt,
  };

  await savePost(post);
  revalidateBlog(post.slug, existing?.slug);

  return { ok: true, data: { id: post.id, slug: post.slug } };
}

export async function setPublishedAction(
  id: string,
  published: boolean,
): Promise<ActionResult> {
  await requireAdmin();

  const post = await getPostById(id);
  if (!post) return { ok: false, message: "That post no longer exists." };

  const now = new Date().toISOString();

  await savePost({
    ...post,
    published,
    publishedAt: published ? (post.publishedAt ?? now) : null,
    updatedAt: now,
  });

  revalidateBlog(post.slug);
  return { ok: true };
}

export async function deletePostAction(id: string): Promise<ActionResult> {
  await requireAdmin();

  const post = await getPostById(id);
  if (!post) return { ok: false, message: "That post no longer exists." };

  await removePost(id);
  revalidateBlog(post.slug);

  return { ok: true };
}

/** Form-bound variant so the delete button works without JavaScript. */
export async function deletePostFormAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await deletePostAction(id);
  redirect("/admin/blogs");
}

function normalizeTags(tags: string[] | undefined): string[] {
  if (!Array.isArray(tags)) return [];
  const seen = new Set<string>();

  for (const tag of tags) {
    const clean = tag.trim();
    if (clean) seen.add(clean);
  }

  return [...seen];
}

/* ── Categories ────────────────────────────────────────────────────────── */

export async function saveCategoryAction(input: {
  id?: string;
  name: string;
  description: string;
}): Promise<ActionResult<Category>> {
  await requireAdmin();

  const name = input.name.trim();
  if (!name) return { ok: false, message: "A category name is required." };

  const categories = await getAllCategories();
  const existing = input.id
    ? categories.find((category) => category.id === input.id)
    : undefined;

  const takenSlugs = categories
    .filter((category) => category.id !== existing?.id)
    .map((category) => category.slug);

  const slug = existing
    ? existing.slug // keep the slug stable so published URLs never break
    : uniqueSlug(name, takenSlugs);

  const category: Category = {
    id: existing?.id ?? createId("cat"),
    name,
    slug,
    description: input.description.trim(),
  };

  const next = existing
    ? categories.map((item) => (item.id === existing.id ? category : item))
    : [...categories, category];

  await saveCategories(next);

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/categories");
  revalidatePath("/category/[category]", "page");

  return { ok: true, data: category };
}

export async function deleteCategoryAction(
  id: string,
): Promise<ActionResult> {
  await requireAdmin();

  const categories = await getAllCategories();
  const category = categories.find((item) => item.id === id);
  if (!category) return { ok: false, message: "That category is gone." };

  const posts = await getAllPosts();
  const inUse = posts.filter((post) => post.category === category.slug).length;

  if (inUse > 0) {
    return {
      ok: false,
      message: `${inUse} post${inUse === 1 ? "" : "s"} still use this category. Reassign them first.`,
    };
  }

  await saveCategories(categories.filter((item) => item.id !== id));

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/categories");

  return { ok: true };
}

/* ── Images ────────────────────────────────────────────────────────────── */

const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
  ["image/gif", ".gif"],
]);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export async function uploadImageAction(
  formData: FormData,
): Promise<ActionResult<MediaImage>> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Choose an image to upload." };
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: "Images must be smaller than 5 MB." };
  }

  const extension = ALLOWED_IMAGE_TYPES.get(file.type);
  if (!extension) {
    return { ok: false, message: "Use a JPG, PNG, WebP, AVIF or GIF file." };
  }

  // Rebuild the filename from scratch; never trust the uploaded one.
  const base = slugify(path.parse(file.name).name) || "image";
  const filename = `${base}-${Date.now().toString(36)}${extension}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const image = await writeImage(filename, buffer);
    revalidatePath("/admin");
    return { ok: true, data: image };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed. Please try again.";
    return { ok: false, message };
  }
}

export async function deleteImageAction(url: string): Promise<ActionResult> {
  await requireAdmin();

  const posts = await getAllPosts();
  const inUse = posts.some(
    (post) =>
      post.featuredImage === url ||
      post.content.some(
        (block) => block.type === "image" && block.src === url,
      ),
  );

  if (inUse) {
    return { ok: false, message: "That image is still used by a post." };
  }

  try {
    await removeImage(url);
    revalidatePath("/admin");
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Couldn't delete that image.";
    return { ok: false, message };
  }
}
