import postgres from "postgres";

/**
 * Single shared connection, reused across Server Component / Server Action
 * invocations within the same serverless instance. `max: 5` keeps us well
 * under Aiven's connection cap even if several functions are warm at once.
 */
const globalForDb = globalThis as unknown as { sql?: ReturnType<typeof postgres> };

export const sql =
  globalForDb.sql ??
  postgres(process.env.DATABASE_URL!, {
    ssl: "require",
    max: 5,
    idle_timeout: 20,
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
