"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";

import { deleteImageAction, uploadImageAction } from "@/lib/blog/actions";
import { EmptyState } from "@/components/ui/EmptyState";

export function MediaLibrary({ images: initial }: { images: string[] }) {
  const [images, setImages] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();
  const [deleting, startDelete] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);

    const formData = new FormData();
    formData.set("file", file);

    startUpload(async () => {
      const result = await uploadImageAction(formData);
      if (!result.ok || !result.data) {
        setError(result.message ?? "Upload failed.");
        return;
      }
      setImages((current) => [result.data!.url, ...current]);
    });
  }

  function remove(url: string) {
    setError(null);
    startDelete(async () => {
      const result = await deleteImageAction(url);
      if (!result.ok) {
        setError(result.message ?? "Couldn't delete that image.");
        return;
      }
      setImages((current) => current.filter((item) => item !== url));
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {images.length} image{images.length === 1 ? "" : "s"}
        </p>
        <div>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60"
          >
            {uploading ? "Uploading…" : "Upload image"}
          </button>
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {images.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="No images uploaded yet"
            description="Images you upload here — or from a post's featured image field — will show up in this library."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {images.map((url) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100"
            >
              <Image src={url} alt="" fill sizes="12rem" className="object-cover" />
              <button
                type="button"
                onClick={() => remove(url)}
                disabled={deleting}
                className="absolute top-2 right-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-zinc-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hover:text-red-600 disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
