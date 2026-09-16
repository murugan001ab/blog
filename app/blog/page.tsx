import type { Metadata } from "next";

import { PostBrowser } from "@/components/blog/PostBrowser";
import { SiteShell } from "@/components/site/SiteShell";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCategories, getPublishedPosts } from "@/lib/blog/queries";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "Every published article — search by keyword or filter by topic.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndexPage() {
  const [posts, categories] = await Promise.all([
    getPublishedPosts(),
    getCategories(),
  ]);

  return (
    <SiteShell>
      <Container className="py-16 sm:py-20">
        <header className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            Articles
          </h1>
          <p className="mt-4 text-lg leading-8 text-zinc-600">
            Everything published so far, newest first.
          </p>
        </header>

        <div className="mt-12">
          {posts.length === 0 ? (
            <EmptyState
              title="No articles yet"
              description="Once you publish a post from the admin dashboard it will show up here."
            />
          ) : (
            <PostBrowser posts={posts} categories={categories} />
          )}
        </div>
      </Container>
    </SiteShell>
  );
}
