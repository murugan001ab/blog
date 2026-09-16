import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminNav } from "@/components/admin/AdminNav";
import { Container } from "@/components/ui/Container";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: { template: "%s — Admin", default: "Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  if (!(await isAdmin())) redirect("/login");

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <Container width="wide">
          <AdminNav />
        </Container>
      </header>
      <Container width="wide" className="py-10">
        {children}
      </Container>
    </div>
  );
}
