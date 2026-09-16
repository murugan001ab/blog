import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Minimal single-password gate for the admin area.
 *
 * Server Actions are reachable by direct POST, not just through the UI, so
 * every mutation calls `requireAdmin()` rather than relying on the admin
 * layout redirect alone. This is intentionally the smallest thing that works —
 * swap in a real auth provider if the blog ever gets more than one author.
 */

const COOKIE_NAME = "blog_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "admin";
}

/** The cookie stores a hash, never the password itself. */
function sessionToken(): string {
  return createHash("sha256")
    .update(`${adminPassword()}::blog-admin-session`)
    .digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function verifyPassword(candidate: string): boolean {
  return safeEqual(candidate, adminPassword());
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return Boolean(value) && safeEqual(value as string, sessionToken());
}

/** Throws unless the caller holds a valid session. Use at the top of actions. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized.");
  }
}

export async function startSession(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, sessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

/** Surfaced in the UI so nobody ships the default password by accident. */
export function usingDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}
