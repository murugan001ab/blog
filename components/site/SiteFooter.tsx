import Link from "next/link";

import type { Category } from "@/types/blog";
import { Container } from "@/components/ui/Container";

export function SiteFooter({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-24 border-t border-zinc-100 py-12">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xs">
            <p className="text-sm font-semibold text-zinc-900">The Journal</p>
            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Notes on building for the web — written slowly, published openly.
            </p>
          </div>

          {categories.length > 0 ? (
            <div>
              <p className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">
                Topics
              </p>
              <ul className="mt-3 space-y-2">
                {categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-zinc-100 pt-6 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} The Journal. All rights reserved.</p>
          <Link href="/admin" className="transition-colors hover:text-zinc-700">
            Admin
          </Link>
        </div>
      </Container>
    </footer>
  );
}
