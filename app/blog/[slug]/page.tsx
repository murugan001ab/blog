import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ContentRenderer } from "@/components/blog/ContentRenderer";
import { CoverImage } from "@/components/blog/CoverImage";
import { PostCard } from "@/components/blog/PostCard";
import { SiteShell } from "@/components/site/SiteShell";
import { Container } from "@/components/ui/Container";
import {
  getAdjacentPosts,
  getCategories,
  getCategoryBySlug,
  getPublishedPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
} from "@/lib/blog/queries";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { formatDate, isoDate, readingTime } from "@/lib/utils/date";
import { countWords } from "@/lib/utils/rich-text";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) return {};

  const url = `/blog/${post.slug}`;
  const description = post.seoDescription || post.excerpt;

  return {
    title: post.seoTitle || post.title,
    description,
    alternates: { canonical: url },
    authors: [{ name: post.author }],
    openGraph: {
      type: "article",
      url,
      title: post.seoTitle || post.title,
      description,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
    },
    twitter: {
      card: post.featuredImage ? "summary_large_image" : "summary",
      title: post.seoTitle || post.title,
      description,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  };
}

export default async function BlogPostPage(
  props: PageProps<"/blog/[slug]">,
) {
  const { slug } = await props.params;
  const post = await getPublishedPostBySlug(slug);
  if (!post) notFound();

  const [category, { previous, next }, related] = await Promise.all([
    getCategoryBySlug(post.category),
    getAdjacentPosts(post.slug),
    getRelatedPosts(post),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    author: { "@type": "Person", name: post.author },
    datePublished: isoDate(post.publishedAt),
    dateModified: isoDate(post.updatedAt),
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
    ...(post.featuredImage
      ? { image: [absoluteUrl(post.featuredImage)] }
      : {}),
    publisher: { "@type": "Organization", name: siteConfig.name },
  };

  return (
    <SiteShell>
      {/* Structured data for search engines; not user-visible markup. */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="article-body py-14 sm:py-20">
        <Container width="prose">
          <div className="flex items-center gap-2 text-sm">
            {category ? (
              <Link
                href={`/category/${category.slug}`}
                className="font-medium text-zinc-900 transition-colors hover:text-zinc-600"
              >
                {category.name}
              </Link>
            ) : null}
          </div>

          <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-balance text-zinc-900 sm:text-4xl">
            {post.title}
          </h1>

          <p className="mt-5 text-lg leading-8 text-zinc-600">
            {post.excerpt}
          </p>

          <div className="mt-6 flex items-center gap-3 border-y border-zinc-100 py-4 text-sm text-zinc-500">
            <span className="font-medium text-zinc-800">{post.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={isoDate(post.publishedAt)}>
              {formatDate(post.publishedAt)}
            </time>
            <span aria-hidden="true">·</span>
            <span>{readingTime(countWords(post.content))}</span>
          </div>
        </Container>

        {post.featuredImage ? (
          <Container width="prose" className="mt-10">
            <CoverImage
              src={post.featuredImage}
              alt={post.title}
              title={post.title}
              priority
              sizes="42rem"
              className="aspect-[16/9] rounded-2xl"
            />
          </Container>
        ) : null}

        <Container width="prose" className="mt-10">
          <ContentRenderer blocks={post.content} />

          {post.tags.length > 0 ? (
            <div className="mt-14 flex flex-wrap gap-2 border-t border-zinc-100 pt-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </Container>
      </article>

      {previous || next ? (
        <Container width="prose">
          <nav
            aria-label="More articles"
            className="grid gap-3 border-t border-zinc-100 py-10 sm:grid-cols-2"
          >
            {previous ? (
              <Link
                href={`/blog/${previous.slug}`}
                className="group rounded-xl border border-zinc-100 p-5 transition-colors hover:border-zinc-200"
              >
                <p className="text-xs text-zinc-400">← Previous</p>
                <p className="mt-1 line-clamp-2 font-medium text-zinc-900 transition-colors group-hover:text-zinc-600">
                  {previous.title}
                </p>
              </Link>
            ) : (
              <div />
            )}

            {next ? (
              <Link
                href={`/blog/${next.slug}`}
                className="group rounded-xl border border-zinc-100 p-5 text-right transition-colors hover:border-zinc-200"
              >
                <p className="text-xs text-zinc-400">Next →</p>
                <p className="mt-1 line-clamp-2 font-medium text-zinc-900 transition-colors group-hover:text-zinc-600">
                  {next.title}
                </p>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </Container>
      ) : null}

      {related.length > 0 ? (
        <Container className="pb-20">
          <h2 className="border-t border-zinc-100 pt-10 pb-6 text-sm font-semibold tracking-wide text-zinc-900 uppercase">
            Related articles
          </h2>
          <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PostCard key={item.id} post={item} category={category ?? undefined} />
            ))}
          </div>
        </Container>
      ) : null}
    </SiteShell>
  );
}
