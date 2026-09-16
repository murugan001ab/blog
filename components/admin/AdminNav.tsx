"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/lib/auth-actions";

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/blogs", label: "Posts" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/media", label: "Media" },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-14 items-center justify-between gap-6">
      <div className="flex items-center gap-8">
        <Link
          href="/admin"
          className="text-sm font-semibold tracking-tight text-zinc-900"
        >
          Admin
        </Link>
        <nav className="flex items-center gap-5">
          {LINKS.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  active
                    ? "font-medium text-zinc-900"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          target="_blank"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
        >
          View site ↗
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
