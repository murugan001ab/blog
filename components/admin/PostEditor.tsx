"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import type { BlogPost, BlogPostInput, Category, ContentBlock } from "@/types/blog";
import { BlockEditor } from "@/components/admin/BlockEditor";
import { Field, inputClass } from "@/components/admin/Field";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { TagsInput } from "@/components/admin/TagsInput";
import { ContentRenderer } from "@/components/blog/ContentRenderer";
import { CoverImage } from "@/components/blog/CoverImage";
import { savePostAction } from "@/lib/blog/actions";
import { autoExcerpt } from "@/lib/utils/rich-text";
import { slugify } from "@/lib/utils/slug";

export function PostEditor({
  post,
  categories,
  images,
}: {
  post?: BlogPost;
  categories: Category[];
  images: string[];
}) {
  const router = useRouter();

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState<ContentBlock[]>(post?.content ?? []);
  const [featuredImage, setFeaturedImage] = useState<string | null>(
    post?.featuredImage ?? null,
  );
  const [author, setAuthor] = useState(post?.author ?? "");
  const [category, setCategory] = useState(
    post?.category ?? categories[0]?.slug ?? "",
  );
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    post?.seoDescription ?? "",
  );
  const [showSeo, setShowSeo] = useState(false);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const displaySlug = slugTouched ? slug : slugify(title);
  const displayExcerpt = excerpt.trim() || autoExcerpt(content);

  function handleTitleChange(next: string) {
    setTitle(next);
    if (!slugTouched) setSlug(slugify(next));
  }

  function buildInput(published: boolean): BlogPostInput {
    return {
      id: post?.id,
      title,
      slug: displaySlug,
      excerpt,
      content,
      featuredImage,
      author,
      category,
      tags,
      published,
      seoTitle,
      seoDescription,
    };
  }

  function submit(published: boolean) {
    if (!title.trim()) {
      setError("Give the post a title before saving.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await savePostAction(buildInput(published));
      if (!result.ok) {
        setError(result.message ?? "Something went wrong. Try again.");
        return;
      }
      router.push("/admin/blogs");
      router.refresh();
    });
  }

  const categoryOptions = useMemo(
    () =>
      categories.length > 0
        ? categories
        : [{ id: "none", name: "Uncategorized", slug: "uncategorized", description: "" }],
    [categories],
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {post ? "Edit post" : "New post"}
        </h1>

        <div className="flex items-center gap-2">
          <div className="mr-2 flex rounded-lg bg-zinc-100 p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                mode === "edit" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => setMode("preview")}
              className={`rounded-md px-3 py-1.5 transition-colors ${
                mode === "preview" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500"
              }`}
            >
              Preview
            </button>
          </div>

          <button
            type="button"
            onClick={() => submit(false)}
            disabled={pending}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60"
          >
            Save draft
          </button>
          <button
            type="button"
            onClick={() => submit(true)}
            disabled={pending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60"
          >
            {pending ? "Saving…" : post?.published ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {mode === "preview" ? (
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-8 sm:p-12">
          <div className="mx-auto max-w-2xl">
            <p className="text-sm font-medium text-zinc-500">
              {categoryOptions.find((c) => c.slug === category)?.name}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance text-zinc-900">
              {title || "Untitled post"}
            </h1>
            <p className="mt-4 text-lg leading-8 text-zinc-600">
              {displayExcerpt}
            </p>
            {featuredImage ? (
              <CoverImage
                src={featuredImage}
                alt={title}
                title={title}
                className="mt-8 aspect-[16/9] rounded-xl"
              />
            ) : null}
            <div className="mt-8">
              <ContentRenderer blocks={content} />
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <Field label="Title" htmlFor="title">
                <input
                  id="title"
                  value={title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  placeholder="Post title"
                  className={inputClass}
                />
              </Field>

              <div className="mt-4">
                <Field
                  label="URL slug"
                  htmlFor="slug"
                  hint={`/blog/${displaySlug || "your-post-slug"}`}
                >
                  <input
                    id="slug"
                    value={displaySlug}
                    onChange={(event) => {
                      setSlugTouched(true);
                      setSlug(slugify(event.target.value));
                    }}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="mt-4">
                <Field
                  label="Excerpt"
                  htmlFor="excerpt"
                  hint="Shown on listing pages. Leave blank to auto-generate from the content."
                >
                  <textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(event) => setExcerpt(event.target.value)}
                    rows={2}
                    placeholder={autoExcerpt(content) || "A short summary…"}
                    className={`${inputClass} resize-y`}
                  />
                </Field>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-900 uppercase">
                Content
              </h2>
              <BlockEditor blocks={content} onChange={setContent} images={images} />
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <button
                type="button"
                onClick={() => setShowSeo((v) => !v)}
                className="flex w-full items-center justify-between text-sm font-medium text-zinc-900"
              >
                SEO metadata
                <span className="text-zinc-400">{showSeo ? "−" : "+"}</span>
              </button>

              {showSeo ? (
                <div className="mt-4 space-y-4">
                  <Field
                    label="SEO title"
                    htmlFor="seoTitle"
                    hint="Defaults to the post title if left blank."
                  >
                    <input
                      id="seoTitle"
                      value={seoTitle}
                      onChange={(event) => setSeoTitle(event.target.value)}
                      placeholder={title}
                      className={inputClass}
                    />
                  </Field>
                  <Field
                    label="SEO description"
                    htmlFor="seoDescription"
                    hint="Defaults to the excerpt if left blank."
                  >
                    <textarea
                      id="seoDescription"
                      value={seoDescription}
                      onChange={(event) => setSeoDescription(event.target.value)}
                      rows={2}
                      placeholder={displayExcerpt}
                      className={`${inputClass} resize-y`}
                    />
                  </Field>
                </div>
              ) : null}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <p className="text-sm font-medium text-zinc-900">Featured image</p>
              <div className="mt-3">
                <ImagePicker
                  images={images}
                  value={featuredImage}
                  onSelect={(url) => setFeaturedImage(url || null)}
                  label="featured image"
                />
              </div>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-5">
              <Field label="Author" htmlFor="author">
                <input
                  id="author"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  placeholder="Author name"
                  className={inputClass}
                />
              </Field>

              <div className="mt-4">
                <Field label="Category" htmlFor="category">
                  <select
                    id="category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className={inputClass}
                  >
                    {categoryOptions.map((option) => (
                      <option key={option.id} value={option.slug}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="mt-4">
                <Field label="Tags" htmlFor="tags">
                  <TagsInput tags={tags} onChange={setTags} />
                </Field>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
