import { promises as fs } from "node:fs";
import path from "node:path";

import type { BlogPost, Category } from "@/types/blog";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * STORAGE ADAPTER — the only module that knows where content physically lives.
 *
 * Everything above this file (queries, actions, pages) talks in terms of
 * BlogPost / Category objects. To move to Postgres, Prisma, Supabase or a
 * headless CMS later, reimplement these exported functions and delete nothing
 * else. The signatures are already async for exactly that reason.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const CONTENT_DIR = path.join(process.cwd(), "content");
const BLOG_DIR = path.join(CONTENT_DIR, "blogs");
const CATEGORIES_FILE = path.join(CONTENT_DIR, "categories.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "blogs");

/** Public URL prefix that maps to UPLOAD_DIR. */
export const UPLOAD_URL_PREFIX = "/images/blogs";

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, value: unknown): Promise<void> {
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

/* ── Posts ─────────────────────────────────────────────────────────────── */

/** Every post, drafts included. Newest first. */
export async function getAllPosts(): Promise<BlogPost[]> {
  await ensureDir(BLOG_DIR);
  const files = await fs.readdir(BLOG_DIR);

  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith(".json"))
      .map((file) =>
        readJson<BlogPost | null>(path.join(BLOG_DIR, file), null),
      ),
  );

  return posts
    .filter((post): post is BlogPost => post !== null && Boolean(post.id))
    .sort((a, b) => {
      const aDate = a.publishedAt ?? a.updatedAt ?? a.createdAt;
      const bDate = b.publishedAt ?? b.updatedAt ?? b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  if (!isSafeId(id)) return null;
  return readJson<BlogPost | null>(path.join(BLOG_DIR, `${id}.json`), null);
}

export async function savePost(post: BlogPost): Promise<BlogPost> {
  if (!isSafeId(post.id)) throw new Error("Invalid post id.");
  await writeJson(path.join(BLOG_DIR, `${post.id}.json`), post);
  return post;
}

export async function removePost(id: string): Promise<void> {
  if (!isSafeId(id)) throw new Error("Invalid post id.");
  await fs.rm(path.join(BLOG_DIR, `${id}.json`), { force: true });
}

/* ── Categories ────────────────────────────────────────────────────────── */

export async function getAllCategories(): Promise<Category[]> {
  const categories = await readJson<Category[]>(CATEGORIES_FILE, []);
  return [...categories].sort((a, b) => a.name.localeCompare(b.name));
}

export async function saveCategories(categories: Category[]): Promise<void> {
  await writeJson(CATEGORIES_FILE, categories);
}

/* ── Image library ─────────────────────────────────────────────────────── */

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
]);

/** Public URLs of every uploaded image, newest first. */
export async function listImages(): Promise<string[]> {
  await ensureDir(UPLOAD_DIR);
  const files = await fs.readdir(UPLOAD_DIR);

  const stats = await Promise.all(
    files
      .filter((file) => IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()))
      .map(async (file) => ({
        file,
        time: (await fs.stat(path.join(UPLOAD_DIR, file))).mtimeMs,
      })),
  );

  return stats
    .sort((a, b) => b.time - a.time)
    .map(({ file }) => `${UPLOAD_URL_PREFIX}/${file}`);
}

export async function writeImage(
  filename: string,
  data: Buffer,
): Promise<string> {
  if (!isSafeFilename(filename)) throw new Error("Invalid file name.");
  await ensureDir(UPLOAD_DIR);
  await fs.writeFile(path.join(UPLOAD_DIR, filename), data);
  return `${UPLOAD_URL_PREFIX}/${filename}`;
}

export async function removeImage(publicUrl: string): Promise<void> {
  const filename = path.basename(publicUrl);
  if (!isSafeFilename(filename)) throw new Error("Invalid file name.");
  await fs.rm(path.join(UPLOAD_DIR, filename), { force: true });
}

/* ── Guards ────────────────────────────────────────────────────────────── */

/** Ids and filenames come from user input, so never let them escape the dir. */
function isSafeId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

function isSafeFilename(name: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(name) && !name.startsWith(".");
}
