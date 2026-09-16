import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/blog/PostCard";
import { SiteShell } from "@/components/site/SiteShell";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getCategories,
  getCategoryBySlug,
  getPostsByCategory,
} from "@/lib/blog/queries";

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata(
  props: PageProps<"/category/[category]">,
): Promise<Metadata> {
  const { category: slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.name,
    description:
      category.description || `Articles filed under ${category.name}.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage(
  props: PageProps<"/category/[category]">,
) {
  const { category: slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const posts = await getPostsByCategory(category.slug);

  return (
    <SiteShell>
      <Container className="py-16 sm:py-20">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.12em] text-zinc-400 uppercase">
            Topic
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {category.name}
          </h1>
          {category.description ? (
            <p className="mt-4 text-lg leading-8 text-zinc-600">
              {category.description}
            </p>
          ) : null}
        </header>

        <div className="mt-12">
          {posts.length === 0 ? (
            <EmptyState
              title="No articles here yet"
              description="Posts filed under this topic will show up as soon as they're published."
            />
          ) : (
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  category={category}
                  priority={index < 3}
                />
              ))}
            </div>
          )}
        </div>
      </Container>
    </SiteShell>
  );
}
