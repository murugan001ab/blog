import Link from "next/link";

import { getAllPosts, getDashboardStats } from "@/lib/blog/queries";
import { formatDate } from "@/lib/utils/date";

export default async function AdminDashboardPage() {
  const [stats, posts] = await Promise.all([
    getDashboardStats(),
    getAllPosts(),
  ]);

  const recent = posts.slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          New post
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total posts" value={stats.total} />
        <StatCard label="Published" value={stats.published} />
        <StatCard label="Drafts" value={stats.drafts} />
        <StatCard label="Categories" value={stats.categories} />
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-zinc-900 uppercase">
            Recent posts
          </h2>
          <Link
            href="/admin/blogs"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
          >
            View all →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-white px-5 py-8 text-center text-sm text-zinc-500">
            No posts yet.{" "}
            <Link href="/admin/blogs/new" className="font-medium text-zinc-900 underline">
              Write your first one
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 bg-white">
            {recent.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/admin/blogs/${post.id}/edit`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-zinc-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900">
                      {post.title}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {post.published
                        ? `Published ${formatDate(post.publishedAt)}`
                        : "Draft"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      post.published
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4">
      <p className="text-2xl font-semibold tracking-tight text-zinc-900">
        {value}
      </p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}
