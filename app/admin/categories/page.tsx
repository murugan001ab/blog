import type { Metadata } from "next";

import { CategoryManager } from "@/components/admin/CategoryManager";
import { getCategoriesWithCounts } from "@/lib/blog/queries";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        Categories
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Organize posts into topics. A category can't be deleted while posts
        still use it.
      </p>

      <div className="mt-8">
        <CategoryManager categories={categories} />
      </div>
    </div>
  );
}
