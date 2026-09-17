// One-time migration: content/blogs/*.json + content/categories.json → Postgres.
// Run with: npm run migrate
//
// Safe to re-run — it upserts, so it won't duplicate rows.

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import postgres from "postgres";

const CONTENT_DIR = path.join(process.cwd(), "content");
const BLOG_DIR = path.join(CONTENT_DIR, "blogs");
const CATEGORIES_FILE = path.join(CONTENT_DIR, "categories.json");

async function readJson(file, fallback) {
  try {
    const raw = await readFile(file, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function main(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id text PRIMARY KEY,
      data jsonb NOT NULL
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id text PRIMARY KEY,
      data jsonb NOT NULL
    )
  `;

  // ── Categories ──────────────────────────────────────────────────────────
  const categories = await readJson(CATEGORIES_FILE, []);
  let categoryCount = 0;

  for (const category of categories) {
    if (!category?.id) continue;
    await sql`
      INSERT INTO categories (id, data)
      VALUES (${category.id}, ${sql.json(category)})
      ON CONFLICT (id) DO UPDATE SET data = ${sql.json(category)}
    `;
    categoryCount++;
  }

  // ── Posts ───────────────────────────────────────────────────────────────
  let postCount = 0;
  try {
    const files = (await readdir(BLOG_DIR)).filter((f) => f.endsWith(".json"));

    for (const file of files) {
      const post = await readJson(path.join(BLOG_DIR, file), null);
      if (!post?.id) continue;

      await sql`
        INSERT INTO posts (id, data)
        VALUES (${post.id}, ${sql.json(post)})
        ON CONFLICT (id) DO UPDATE SET data = ${sql.json(post)}
      `;
      postCount++;
    }
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
  }

  console.log(
    `Migrated ${categoryCount} categor${categoryCount === 1 ? "y" : "ies"} and ${postCount} post${postCount === 1 ? "" : "s"}.`,
  );
}

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Make sure .env.local exists and you're running via `npm run migrate`.",
    );
  }

  // A single connection, released the moment we're done — success or not.
  const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });

  try {
    await main(sql);
  } finally {
    // Always runs, even if a query above throws, so a failed migration
    // never leaves a stuck connection slot on the server.
    await sql.end({ timeout: 5 });
  }
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exitCode = 1;
});
