import Link from "next/link";

import { SiteShell } from "@/components/site/SiteShell";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <SiteShell>
      <Container className="flex flex-col items-center py-32 text-center">
        <p className="text-sm font-semibold text-zinc-400">404</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-500">
          The article or page you're looking for may have been moved or
          unpublished.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
        >
          Back to home
        </Link>
      </Container>
    </SiteShell>
  );
}
