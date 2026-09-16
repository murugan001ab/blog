import type { Metadata } from "next";

import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { getImageLibrary } from "@/lib/blog/queries";

export const metadata: Metadata = { title: "Media" };

export default async function AdminMediaPage() {
  const images = await getImageLibrary();

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        Media
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Images uploaded from any post. Images still in use can't be deleted.
      </p>

      <div className="mt-8">
        <MediaLibrary images={images} />
      </div>
    </div>
  );
}
