"use client";

import { useState } from "react";

import { deletePostFormAction } from "@/lib/blog/actions";

export function DeletePostButton({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <form
        action={deletePostFormAction}
        className="flex items-center gap-2 text-xs"
      >
        <input type="hidden" name="id" value={id} />
        <span className="text-zinc-500">Delete “{title}”?</span>
        <button
          type="submit"
          className="font-medium text-red-600 hover:text-red-700"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-zinc-500 hover:text-zinc-800"
        >
          Cancel
        </button>
      </form>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs font-medium text-zinc-500 transition-colors hover:text-red-600"
    >
      Delete
    </button>
  );
}
