"use client";

import { useMemo, useState } from "react";

import type { BlogPost, Category } from "@/types/blog";
import { PostCard } from "@/components/blog/PostCard";
import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Search and category filtering run in the browser over data the server already
 * rendered. That keeps `/blog` a static page — no `searchParams`, so no
 * request-time rendering — while still feeling instant.
 */
export function PostBrowser({
  posts,
  categories,
}: {
  posts: BlogPost[];
  categories: Category[];
}) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const categoryBySlug = useMemo(
    () => new Map(categories.map((category) => [category.slug, category])),
    [categories],
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return posts.filter((post) => {
      if (activeCategory !== "all" && post.category !== activeCategory) {
        return false;
      }
      if (!needle) return true;

      const haystack = [
        post.title,
        post.excerpt,
        post.author,
        ...post.tags,
        categoryBySlug.get(post.category)?.name ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [posts, query, activeCategory, categoryBySlug]);

  const usedCategories = categories.filter((category) =>
    posts.some((post) => post.category === category.slug),
  );

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-zinc-100 pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          >
            All
          </FilterChip>
          {usedCategories.map((category) => (
            <FilterChip
              key={category.id}
              active={activeCategory === category.slug}
              onClick={() => setActiveCategory(category.slug)}
            >
              {category.name}
            </FilterChip>
          ))}
        </div>

        <div className="relative md:w-64">
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          >
            <circle cx="9" cy="9" r="5.5" />
            <path d="M13.5 13.5L17 17" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search articles"
            aria-label="Search articles"
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pr-3 pl-9 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-0 focus:outline-none"
          />
        </div>
      </div>

      <p className="mt-6 text-xs text-zinc-400">
        {visible.length} {visible.length === 1 ? "article" : "articles"}
      </p>

      {visible.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="Nothing matches that"
            description="Try a different search term, or clear the filters to see everything."
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              category={categoryBySlug.get(post.category)}
              priority={index < 3}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? "bg-zinc-900 text-white"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
      }`}
    >
      {children}
    </button>
  );
}
