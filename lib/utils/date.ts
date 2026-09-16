/**
 * Dates are formatted in UTC on purpose: the same string is produced on the
 * server and in the browser, so static HTML never mismatches during hydration.
 */
export function formatDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/** Machine-readable value for <time dateTime="..."> */
export function isoDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

/** Rough reading time from the plain-text length of a post. */
export function readingTime(words: number): string {
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min read`;
}
