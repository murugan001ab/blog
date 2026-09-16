import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/LoginForm";
import { Container } from "@/components/ui/Container";
import { isAdmin, usingDefaultPassword } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <Container width="prose" className="flex min-h-screen items-center py-16">
      <div className="mx-auto w-full max-w-sm">
        <p className="text-sm font-semibold text-zinc-900">The Journal</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          Admin sign in
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Enter the admin password to manage posts and categories.
        </p>

        {usingDefaultPassword() ? (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            No <code>ADMIN_PASSWORD</code> is set in your environment, so the
            default password <code>admin</code> is active. Set one in{" "}
            <code>.env.local</code> before deploying.
          </p>
        ) : null}

        <LoginForm />
      </div>
    </Container>
  );
}
