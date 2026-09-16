"use client";

import { useRef } from "react";

import { InlineFormatToolbar } from "@/components/admin/InlineFormatToolbar";

/** A textarea plus a Bold/Italic/Code/Link toolbar. Used for every block's text. */
export function RichTextField({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 focus-within:border-zinc-400">
      <InlineFormatToolbar textareaRef={ref} value={value} onChange={onChange} />
      <textarea
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:ring-0 focus:outline-none"
      />
    </div>
  );
}
