"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";

import { uploadImageAction } from "@/lib/blog/actions";

/**
 * Upload + select UI shared by the featured-image field and inline image
 * blocks. Keeps its own copy of the library so a fresh upload shows up
 * immediately without a full page reload.
 */
export function ImagePicker({
  images,
  value,
  onSelect,
  label = "Image",
}: {
  images: string[];
  value: string | null;
  onSelect: (url: string) => void;
  label?: string;
}) {
  const [library, setLibrary] = useState(images);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, startUpload] = useTransition();
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
      setLibrary((current) => [result.data!.url, ...current]);
      onSelect(result.data.url);
      setOpen(false);
    });
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative h-16 w-24 overflow-hidden rounded-lg bg-zinc-100">
            <Image src={value} alt="" fill sizes="6rem" className="object-cover" />
          </div>
        ) : (
          <div className="flex h-16 w-24 items-center justify-center rounded-lg border border-dashed border-zinc-300 text-xs text-zinc-400">
            None
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            {value ? `Change ${label.toLowerCase()}` : `Choose ${label.toLowerCase()}`}
          </button>
          {value ? (
            <button
              type="button"
              onClick={() => onSelect("")}
              className="text-xs text-zinc-400 transition-colors hover:text-red-600"
            >
              Remove
            </button>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-zinc-600">Image library</p>
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
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60"
              >
                {uploading ? "Uploading…" : "Upload new"}
              </button>
            </div>
          </div>

          {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}

          {library.length === 0 ? (
            <p className="mt-3 py-6 text-center text-xs text-zinc-400">
              No images yet — upload one to get started.
            </p>
          ) : (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
              {library.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => {
                    onSelect(url);
                    setOpen(false);
                  }}
                  className={`relative aspect-square overflow-hidden rounded-lg ring-2 transition-shadow ${
                    url === value ? "ring-zinc-900" : "ring-transparent hover:ring-zinc-300"
                  }`}
                >
                  <Image src={url} alt="" fill sizes="6rem" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
