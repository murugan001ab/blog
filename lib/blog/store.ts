import { promises as fs } from "node:fs";
import path from "node:path";

import type { BlogPost, Category } from "@/types/blog";
import { ensureSchema, sql } from "@/lib/db";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * STORAGE ADAPTER — the only module that knows where content physically lives.
 *
 * Posts and categories live in Postgres (Aiven), stored as JSONB so the
 * BlogPost / Category shape can keep evolving without a migration each time.
 * Uploaded images still live on the local filesystem — see the note at the
 * bottom of this file, since that has the same "read-only on Vercel" problem
 * posts used to have.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "blogs");

/** Public URL prefix that maps to UPLOAD_DIR. */
export const UPLOAD_URL_PREFIX = "/images/blogs";

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/* ── Posts ─────────────────────────────────────────────────────────────── */

/** Every post, drafts included. Newest first. */
export async function getAllPosts(): Promise<BlogPost[]> {
  await ensureSchema();
  const rows = await sql<{ data: BlogPost }[]>`SELECT data FROM posts`;

  return rows
    .map((row) => row.data)
    .sort((a, b) => {
      const aDate = a.publishedAt ?? a.updatedAt ?? a.createdAt;
      const bDate = b.publishedAt ?? b.updatedAt ?? b.createdAt;
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  if (!isSafeId(id)) return null;
  await ensureSchema();

  const rows = await sql<{ data: BlogPost }[]>`
    SELECT data FROM posts WHERE id = ${id}
  `;
  return rows[0]?.data ?? null;
}

export async function savePost(post: BlogPost): Promise<BlogPost> {
  if (!isSafeId(post.id)) throw new Error("Invalid post id.");
  await ensureSchema();

  await sql`
    INSERT INTO posts (id, data)
    VALUES (${post.id}, ${sql.json(post)})
    ON CONFLICT (id) DO UPDATE SET data = ${sql.json(post)}
  `;
  return post;
}

export async function removePost(id: string): Promise<void> {
  if (!isSafeId(id)) throw new Error("Invalid post id.");
  await ensureSchema();
  await sql`DELETE FROM posts WHERE id = ${id}`;
}

/* ── Categories ────────────────────────────────────────────────────────── */

export async function getAllCategories(): Promise<Category[]> {
  await ensureSchema();
  const rows = await sql<{ data: Category }[]>`SELECT data FROM categories`;

  return rows
    .map((row) => row.data)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Replaces the entire category list, same contract the JSON-file version had. */
export async function saveCategories(categories: Category[]): Promise<void> {
  await ensureSchema();

  await sql.begin(async (tx) => {
    await tx`DELETE FROM categories`;
    for (const category of categories) {
      await tx`
        INSERT INTO categories (id, data)
        VALUES (${category.id}, ${tx.json(category)})
      `;
    }
  });
}

/* ── Image library (still filesystem — see note below) ───────────────── */

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
