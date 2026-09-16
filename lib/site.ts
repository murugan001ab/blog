/** Single source of truth for site-wide metadata. */
export const siteConfig = {
  name: "The Journal",
  title: "The Journal — Notes on building for the web",
  description:
    "Essays and field notes on design, engineering and the craft of shipping software.",
  /**
   * Used to build absolute URLs for canonical tags, Open Graph and the sitemap.
   * Set NEXT_PUBLIC_SITE_URL in .env.local before deploying.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en_US",
} as const;

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, siteConfig.url).toString();
}
