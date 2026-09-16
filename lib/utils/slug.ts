/** Turn arbitrary text into a URL-safe, SEO-friendly slug. */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Append -2, -3, ... until the slug is unique within `taken`. */
export function uniqueSlug(base: string, taken: string[]): string {
  const clean = slugify(base) || "post";
  if (!taken.includes(clean)) return clean;

  let n = 2;
  while (taken.includes(`${clean}-${n}`)) n += 1;
  return `${clean}-${n}`;
}

/** Short, sortable, collision-resistant id. No dependency needed. */
export function createId(prefix = "post"): string {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${time}${rand}`;
}
