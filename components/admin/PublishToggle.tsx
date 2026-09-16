"use client";

import { useState, useTransition } from "react";

import { setPublishedAction } from "@/lib/blog/actions";

export function PublishToggle({
  id,
  published,
}: {
  id: string;
  published: boolean;
}) {
  const [isPublished, setIsPublished] = useState(published);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !isPublished;
    setIsPublished(next); // optimistic; reverted below on failure
    startTransition(async () => {
      const result = await setPublishedAction(id, next);
      if (!result.ok) setIsPublished(!next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={isPublished}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors disabled:opacity-60 ${
        isPublished
          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "bg-amber-50 text-amber-700 hover:bg-amber-100"
      }`}
    >
      {isPublished ? "Published" : "Draft"}
    </button>
  );
}
