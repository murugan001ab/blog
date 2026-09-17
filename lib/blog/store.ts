import path from "node:path";

import type { BlogPost, Category, MediaImage } from "@/types/blog";
import { ensureSchema, sql } from "@/lib/db";
import { imagekit, IMAGEKIT_FOLDER } from "@/lib/imagekit";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * STORAGE ADAPTER — the only module that knows where content physically lives.
 *
 * Posts and categories live in Postgres (Aiven), stored as JSONB so the
 * BlogPost / Category shape can keep evolving without a migration each time.
 * Uploaded images live in ImageKit — Vercel's filesystem is read-only, so
 * local disk never worked in production; ImageKit gives durable storage plus
 * a CDN URL back from the upload call itself.
 * ─────────────────────────────────────────────────────────────────────────────
 */

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
    VALUES (${post.id}, ${sql.json(post as unknown as any)})
    ON CONFLICT (id) DO UPDATE SET data = ${sql.json(post as unknown as any)}
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
        VALUES (${category.id}, ${tx.json(category as unknown as any)})
      `;
    }
  });
}

/* ── Image library (ImageKit) ─────────────────────────────────────────── */

/** Every uploaded image with its size, newest first. Returns [] if the
 * ImageKit call fails, instead of crashing the media page. */
export async function listImages(): Promise<MediaImage[]> {
  try {
    const files = await imagekit.listFiles({
      path: IMAGEKIT_FOLDER,
      sort: "DESC_CREATED",
      limit: 1000,
    });

    return files
      .filter(
        (file): file is typeof file & { url: string; size: number; type?: string } =>
          "url" in file && (file as { type?: string }).type !== "folder",
      )
      .map((file) => ({ url: file.url, size: file.size ?? 0 }));
  } catch (error) {
    console.error("ImageKit listFiles failed:", error);
    return [];
  }
}

export async function writeImage(
  filename: string,
  data: Buffer,
): Promise<MediaImage> {
  if (!isSafeFilename(filename)) throw new Error("Invalid file name.");

  try {
    const response = await imagekit.upload({
      file: data,
      fileName: filename,
      folder: IMAGEKIT_FOLDER,
      useUniqueFileName: false,
    });
    return { url: response.url, size: response.size ?? data.byteLength };
  } catch (error) {
    console.error("ImageKit upload failed:", error);
    throw new Error("Image upload failed. Please try again.");
  }
}

export async function removeImage(publicUrl: string): Promise<void> {
  const filename = path.basename(publicUrl);
  if (!isSafeFilename(filename)) throw new Error("Invalid file name.");

  try {
    const matches = await imagekit.listFiles({
      path: IMAGEKIT_FOLDER,
      searchQuery: `name = "${filename}"`,
      limit: 1,
    });

    const match = matches.find(
      (file): file is typeof file & { fileId: string } => "fileId" in file,
    );
    if (match) await imagekit.deleteFile(match.fileId);
  } catch (error) {
    console.error("ImageKit delete failed:", error);
    throw new Error("Couldn't delete that image. Please try again.");
  }
}

/* ── Guards ────────────────────────────────────────────────────────────── */

/** Ids and filenames come from user input, so never let them escape the dir. */
function isSafeId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

function isSafeFilename(name: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(name) && !name.startsWith(".");
}
