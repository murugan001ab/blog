import type { BlogPost, Category } from "@/types/blog";
import {
  getAllCategories,
  getAllPosts,
  getPostById,
  listImages,
} from "@/lib/blog/store";

/**
 * Read-side helpers used by public pages and the admin.
 *
 * Nothing here writes. Public pages should always go through the
 * `*Published*` helpers so drafts can never leak into the live site.
 */

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  return posts.filter((post) => post.published);
}

export async function getPublishedPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  const posts = await getPublishedPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getPostsByCategory(
  categorySlug: string,
): Promise<BlogPost[]> {
  const posts = await getPublishedPosts();
  return posts.filter((post) => post.category === categorySlug);
}

export async function getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
  const posts = await getPublishedPosts();
  return posts.slice(0, limit);
}

/** Previous / next by publication order, for in-article navigation. */
export async function getAdjacentPosts(slug: string): Promise<{
  previous: BlogPost | null;
  next: BlogPost | null;
}> {
  const posts = await getPublishedPosts();
  const index = posts.findIndex((post) => post.slug === slug);
  if (index === -1) return { previous: null, next: null };

  return {
    // `posts` is newest-first, so the *next* entry is the older post.
    previous: posts[index + 1] ?? null,
    next: posts[index - 1] ?? null,
  };
}

export async function getRelatedPosts(
  post: BlogPost,
  limit = 3,
): Promise<BlogPost[]> {
  const posts = await getPublishedPosts();

  return posts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => {
      const sharedTags = candidate.tags.filter((tag) =>
        post.tags.includes(tag),
      ).length;
      const sameCategory = candidate.category === post.category ? 2 : 0;
      return { candidate, score: sharedTags + sameCategory };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export async function getCategories(): Promise<Category[]> {
  return getAllCategories();
}

export async function getCategoryBySlug(
  slug: string,
): Promise<Category | null> {
  const categories = await getAllCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}

/** Category list decorated with how many published posts each one holds. */
export async function getCategoriesWithCounts(): Promise<
  Array<Category & { count: number }>
> {
  const [categories, posts] = await Promise.all([
    getAllCategories(),
    getPublishedPosts(),
  ]);

  return categories.map((category) => ({
    ...category,
    count: posts.filter((post) => post.category === category.slug).length,
  }));
}

export async function getAllTags(): Promise<string[]> {
  const posts = await getPublishedPosts();
  const tags = new Set<string>();
  for (const post of posts) {
    for (const tag of post.tags) tags.add(tag);
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

/** Admin-side counts for the dashboard. */
export async function getDashboardStats(): Promise<{
  total: number;
  published: number;
  drafts: number;
  categories: number;
}> {
  const [posts, categories] = await Promise.all([
    getAllPosts(),
    getAllCategories(),
  ]);

  const published = posts.filter((post) => post.published).length;

  return {
    total: posts.length,
    published,
    drafts: posts.length - published,
    categories: categories.length,
  };
}

export async function getImageLibrary(): Promise<string[]> {
  return listImages();
}

export { getAllPosts, getPostById };
