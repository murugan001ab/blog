"use client";

import { useState } from "react";

export function TagsInput({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function commit() {
    const clean = draft.trim();
    if (clean && !tags.includes(clean)) onChange([...tags, clean]);
    setDraft("");
  }

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 rounded-lg border border-zinc-200 px-2 py-1.5 focus-within:border-zinc-400">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700"
        >
          {tag}
          <button
            type="button"
            onClick={() => onChange(tags.filter((t) => t !== tag))}
            className="text-zinc-400 hover:text-red-600"
            aria-label={`Remove ${tag}`}
          >
            ✕
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commit();
          } else if (event.key === "Backspace" && !draft && tags.length > 0) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={commit}
        placeholder={tags.length === 0 ? "Add tags, press Enter" : ""}
        className="min-w-[8ch] flex-1 border-0 px-1 py-0.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-0 focus:outline-none"
      />
    </div>
  );
}
