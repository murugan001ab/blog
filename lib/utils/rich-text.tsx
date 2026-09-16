import type { ReactNode } from "react";
import type { ContentBlock } from "@/types/blog";

/**
 * A deliberately tiny inline formatter.
 *
 * The admin editor writes these markers for the user via toolbar buttons, so
 * nobody has to type Markdown by hand — but the stored value stays plain text,
 * which keeps the JSON readable and avoids shipping a Markdown parser or using
 * dangerouslySetInnerHTML.
 *
 * Supported: **bold**  *italic*  `code`  [label](https://url)
 */
const INLINE_PATTERN =
  /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;

export function renderRichText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  // `matchAll` needs the global flag, which INLINE_PATTERN has.
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      nodes.push(text.slice(lastIndex, index));
    }

    const [full, bold, italic, code, linkLabel, linkHref] = match;

    if (bold !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-zinc-900">
          {bold}
        </strong>,
      );
    } else if (italic !== undefined) {
      nodes.push(<em key={key++}>{italic}</em>);
    } else if (code !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.875em] text-zinc-800"
        >
          {code}
        </code>,
      );
    } else if (linkLabel !== undefined && linkHref !== undefined) {
      const external = /^https?:\/\//i.test(linkHref);
      nodes.push(
        <a
          key={key++}
          href={linkHref}
          className="font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-[3px] transition-colors hover:decoration-zinc-900"
          {...(external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {linkLabel}
        </a>,
      );
    }

    lastIndex = index + full.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

/** Strip inline markers — used for excerpts, SEO descriptions and word counts. */
export function toPlainText(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1");
}

/** Flatten a whole post to plain text, for excerpts and reading time. */
export function blocksToPlainText(blocks: ContentBlock[]): string {
  const parts: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "heading":
      case "paragraph":
        parts.push(toPlainText(block.text));
        break;
      case "list":
        parts.push(block.items.map(toPlainText).join(" "));
        break;
      case "quote":
        parts.push(toPlainText(block.text));
        break;
      case "image":
        if (block.caption) parts.push(block.caption);
        break;
      case "code":
        parts.push(block.code);
        break;
      case "divider":
        break;
    }
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

export function countWords(blocks: ContentBlock[]): number {
  const text = blocksToPlainText(blocks);
  return text ? text.split(/\s+/).length : 0;
}

/** Build a fallback excerpt when the author leaves the field empty. */
export function autoExcerpt(blocks: ContentBlock[], max = 160): string {
  const text = blocksToPlainText(blocks);
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
