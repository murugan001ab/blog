import postgres from "postgres";

/**
 * Single shared connection, reused across Server Component / Server Action
 * invocations within the same serverless instance. Next.js spins up several
 * parallel workers during `next build` (and Vercel runs many functions
 * concurrently), and each one gets its own pool — so `max` is kept small per
 * pool to avoid exhausting Aiven's total connection limit.
 */
const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL!, {
    ssl: "require",
    max: 1,
    idle_timeout: 20,
    onnotice: () => {}, // silence "relation already exists, skipping" spam
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.sql = sql;
}

let ready: Promise<void> | null = null;

/** Creates the tables on first use. Safe to call on every request. */
export function ensureSchema(): Promise<void> {
  if (!ready) {
    ready = sql`
      CREATE TABLE IF NOT EXISTS posts (
        id text PRIMARY KEY,
        data jsonb NOT NULL
      )
    `
      .then(
        () => sql`
          CREATE TABLE IF NOT EXISTS categories (
            id text PRIMARY KEY,
            data jsonb NOT NULL
          )
        `,
      )
      .then(() => undefined);
  }
  return ready;
}
