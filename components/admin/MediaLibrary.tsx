"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";

import type { MediaImage } from "@/types/blog";
import { deleteImageAction, uploadImageAction } from "@/lib/blog/actions";
import { EmptyState } from "@/components/ui/EmptyState";

/** Formats a byte count as a short human-readable size, e.g. "482 KB", "1.4 MB". */
function formatBytes(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

export function MediaLibrary({ images: initial }: { images: MediaImage[] }) {
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
      setImages((current) => [result.data!, ...current]);
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
      setImages((current) => current.filter((item) => item.url !== url));
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
          {images.map(({ url, size }) => (
            <div
              key={url}
              className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100"
            >
              <Image src={url} alt="" fill sizes="12rem" className="object-cover" />
              <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
                {formatBytes(size)}
              </span>
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
