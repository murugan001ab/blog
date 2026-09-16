import Link from "next/link";

import type { BlogPost, Category } from "@/types/blog";
import { CoverImage } from "@/components/blog/CoverImage";
import { formatDate, isoDate, readingTime } from "@/lib/utils/date";
import { countWords } from "@/lib/utils/rich-text";

export function PostCard({
  post,
  category,
  priority = false,
}: {
  post: BlogPost;
  category?: Category;
  priority?: boolean;
}) {
  return (
    <article className="group flex flex-col">
      <Link href={`/blog/${post.slug}`} className="block">
        <CoverImage
          src={post.featuredImage}
          alt={post.title}
          title={post.title}
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="aspect-[16/10] rounded-xl"
        />
      </Link>

      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          {category ? (
            <>
              <Link
                href={`/category/${category.slug}`}
                className="font-medium text-zinc-700 transition-colors hover:text-zinc-900"
              >
                {category.name}
              </Link>
              <span aria-hidden="true">·</span>
            </>
          ) : null}
          <time dateTime={isoDate(post.publishedAt)}>
            {formatDate(post.publishedAt)}
          </time>
        </div>

        <h3 className="mt-2 text-lg leading-snug font-semibold tracking-tight text-zinc-900">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-zinc-600"
          >
            {post.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-6 text-zinc-600">
          {post.excerpt}
        </p>

        <p className="mt-3 text-xs text-zinc-400">
          {post.author} · {readingTime(countWords(post.content))}
        </p>
      </div>
    </article>
  );
}
