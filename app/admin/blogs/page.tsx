import Link from "next/link";

import { DeletePostButton } from "@/components/admin/DeletePostButton";
import { PublishToggle } from "@/components/admin/PublishToggle";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAllPosts, getCategories } from "@/lib/blog/queries";
import { formatDate } from "@/lib/utils/date";

export default async function AdminPostsPage() {
  const [posts, categories] = await Promise.all([
    getAllPosts(),
    getCategories(),
  ]);

  const categoryName = new Map(
    categories.map((category) => [category.slug, category.name]),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Posts
        </h1>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          New post
        </Link>
      </div>

      <div className="mt-8">
        {posts.length === 0 ? (
          <EmptyState
            title="No posts yet"
            description="Create your first post to see it listed here."
            action={
              <Link
                href="/admin/blogs/new"
                className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
              >
                New post
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 bg-zinc-50 text-xs text-zinc-500 uppercase">
                <tr>
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {posts.map((post) => (
                  <tr key={post.id} className="align-middle">
                    <td className="max-w-xs truncate px-5 py-4 font-medium text-zinc-900">
                      <Link
                        href={`/admin/blogs/${post.id}/edit`}
                        className="hover:underline"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-zinc-500">
                      {categoryName.get(post.category) ?? "Uncategorized"}
                    </td>
                    <td className="px-5 py-4">
                      <PublishToggle id={post.id} published={post.published} />
                    </td>
                    <td className="px-5 py-4 text-zinc-500">
                      {formatDate(post.updatedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/blogs/${post.id}/edit`}
                          className="text-xs font-medium text-zinc-600 hover:text-zinc-900"
                        >
                          Edit
                        </Link>
                        <DeletePostButton id={post.id} title={post.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
