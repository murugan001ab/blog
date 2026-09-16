import type { ReactNode } from "react";

import { getCategories } from "@/lib/blog/queries";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

/**
 * Header + footer chrome for every public page.
 *
 * This is a component rather than a route-group layout so that public URLs stay
 * literal (`/blog`, `/category/x`). That keeps `revalidatePath` calls in
 * `lib/blog/actions.ts` simple and unambiguous.
 */
export async function SiteShell({ children }: { children: ReactNode }) {
  const categories = await getCategories();

  return (
    <>
      <SiteHeader categories={categories} />
      <main className="flex-1">{children}</main>
      <SiteFooter categories={categories} />
    </>
  );
}
