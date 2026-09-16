"use client";

import { type RefObject } from "react";

/**
 * Wraps the current textarea selection with Markdown-lite markers so authors
 * never have to type `**bold**` by hand. The stored value is still plain text
 * — `lib/utils/rich-text.tsx` renders these markers on the public site.
 */
export function InlineFormatToolbar({
  textareaRef,
  value,
  onChange,
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (next: string) => void;
}) {
  function wrap(before: string, after = before) {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || "text";
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;

    onChange(next);

    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function insertLink() {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const label = value.slice(start, end) || "link text";
    const markup = `[${label}](https://)`;
    const next = `${value.slice(0, start)}${markup}${value.slice(end)}`;

    onChange(next);

    // Place the cursor inside the URL placeholder so it's easy to replace.
    const urlStart = start + label.length + 3;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(urlStart, urlStart + 8);
    });
  }

  const buttonClass =
    "rounded px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900";

  return (
    <div className="flex items-center gap-0.5 border-b border-zinc-100 px-1 py-1">
      <button type="button" onClick={() => wrap("**")} className={`${buttonClass} font-semibold`}>
        B
      </button>
      <button type="button" onClick={() => wrap("*")} className={`${buttonClass} italic`}>
        I
      </button>
      <button type="button" onClick={() => wrap("`")} className={`${buttonClass} font-mono`}>
        {"</>"}
      </button>
      <button type="button" onClick={insertLink} className={buttonClass}>
        Link
      </button>
    </div>
  );
}
