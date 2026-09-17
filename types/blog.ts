/**
 * Core domain types for the blog.
 *
 * These types are storage-agnostic on purpose. `lib/blog/store.ts` is the only
 * module that knows content lives in JSON files on disk, so swapping in a
 * database or headless CMS later means rewriting that one file — not this one.
 */

/** Inline text supports a tiny subset of Markdown: **bold**, *italic*, `code`, [link](url). */
export type RichText = string;

export interface HeadingBlock {
  id: string;
  type: "heading";
  /** h1 is reserved for the post title, so body headings start at 2. */
  level: 2 | 3 | 4;
  text: RichText;
}

export interface ParagraphBlock {
  id: string;
  type: "paragraph";
  text: RichText;
}

export interface ListBlock {
  id: string;
  type: "list";
  ordered: boolean;
  items: RichText[];
}

export interface QuoteBlock {
  id: string;
  type: "quote";
  text: RichText;
  cite?: string;
}

export interface ImageBlock {
  id: string;
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

export interface CodeBlock {
  id: string;
  type: "code";
  language?: string;
  code: string;
}

export interface DividerBlock {
  id: string;
  type: "divider";
}

export type ContentBlock =
  | HeadingBlock
  | ParagraphBlock
  | ListBlock
  | QuoteBlock
  | ImageBlock
  | CodeBlock
  | DividerBlock;

export type BlockType = ContentBlock["type"];

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: ContentBlock[];
  featuredImage: string | null;
  author: string;
  /** Category slug. Matches `Category.slug`. */
  category: string;
  tags: string[];
  published: boolean;
  /** ISO 8601. Set the first time a post is published, null while it is a draft. */
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  seoTitle: string;
  seoDescription: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

/** Shape the admin editor submits. Server-managed fields are derived, not trusted. */
export interface BlogPostInput {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: ContentBlock[];
  featuredImage: string | null;
  author: string;
  category: string;
  tags: string[];
  published: boolean;
  seoTitle: string;
  seoDescription: string;
}

export interface ActionResult<T = undefined> {
  ok: boolean;
  message?: string;
  data?: T;
}

/** An uploaded image as shown in the media library, with its file size in bytes. */
export interface MediaImage {
  url: string;
  size: number;
}
