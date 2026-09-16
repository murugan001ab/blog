import Link from "next/link";

import { CoverImage } from "@/components/blog/CoverImage";
import { PostCard } from "@/components/blog/PostCard";
import { SiteShell } from "@/components/site/SiteShell";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getCategoriesWithCounts,
  getPublishedPosts,
} from "@/lib/blog/queries";
import { formatDate, isoDate, readingTime } from "@/lib/utils/date";
import { countWords } from "@/lib/utils/rich-text";

export default async function HomePage() {
  const [posts, categories] = await Promise.all([
    getPublishedPosts(),
    getCategoriesWithCounts(),
  ]);

  const [lead, ...rest] = posts;
  const categoryBySlug = new Map(
    categories.map((category) => [category.slug, category]),
  );

  return (
    <SiteShell>
      <Container className="pt-16 pb-6 sm:pt-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.12em] text-zinc-400 uppercase">
            Writing
          </p>
          <h1 className="mt-4 text-4xl leading-[1.1] font-semibold tracking-tight text-balance text-zinc-900 sm:text-5xl">
            Notes on design, engineering and shipping software.
          </h1>
          <p className="mt-5 text-lg leading-8 text-zinc-600">
            Long-form essays and short field notes, published whenever there is
            something worth saying.
          </p>
        </div>
      </Container>

      {lead ? (
        <Container className="pt-10">
          <Link
            href={`/blog/${lead.slug}`}
            className="group grid gap-8 md:grid-cols-2 md:items-center"
          >
            <CoverImage
              src={lead.featuredImage}
              alt={lead.title}
              title={lead.title}
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="aspect-[16/10] rounded-2xl"
            />

            <div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="font-medium text-zinc-700">
                  {categoryBySlug.get(lead.category)?.name ?? "Latest"}
                </span>
                <span aria-hidden="true">·</span>
                <time dateTime={isoDate(lead.publishedAt)}>
                  {formatDate(lead.publishedAt)}
                </time>
              </div>

              <h2 className="mt-3 text-2xl leading-tight font-semibold tracking-tight text-balance text-zinc-900 transition-colors group-hover:text-zinc-600 sm:text-3xl">
                {lead.title}
              </h2>

              <p className="mt-4 text-base leading-7 text-zinc-600">
                {lead.excerpt}
              </p>

              <p className="mt-5 text-xs text-zinc-400">
                {lead.author} · {readingTime(countWords(lead.content))}
              </p>
            </div>
          </Link>
        </Container>
      ) : (
        <Container className="py-10">
          <EmptyState
            title="No posts published yet"
            description="Head to the admin dashboard to write your first article and publish it."
            action={
              <Link
                href="/admin/blogs/new"
                className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
              >
                Write a post
              </Link>
            }
          />
        </Container>
      )}

      {rest.length > 0 ? (
        <Container className="pt-20">
          <div className="flex items-baseline justify-between border-b border-zinc-100 pb-4">
            <h2 className="text-sm font-semibold tracking-wide text-zinc-900 uppercase">
              Recent
            </h2>
            <Link
              href="/blog"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
            >
              All articles →
            </Link>
          </div>

          <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(0, 6).map((post) => (
              <PostCard
                key={post.id}
                post={post}
                category={categoryBySlug.get(post.category)}
              />
            ))}
          </div>
        </Container>
      ) : null}

      {categories.length > 0 ? (
        <Container className="pt-20">
          <h2 className="border-b border-zinc-100 pb-4 text-sm font-semibold tracking-wide text-zinc-900 uppercase">
            Browse by topic
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories
              .filter((category) => category.count > 0)
              .map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="rounded-full bg-zinc-100 px-4 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-200"
                >
                  {category.name}
                  <span className="ml-1.5 text-zinc-400">{category.count}</span>
                </Link>
              ))}
          </div>
        </Container>
      ) : null}
    </SiteShell>
  );
}
