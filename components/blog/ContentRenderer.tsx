import Image from "next/image";

import type { ContentBlock } from "@/types/blog";
import { renderRichText } from "@/lib/utils/rich-text";

/**
 * Renders stored blocks as semantic HTML.
 *
 * No `dangerouslySetInnerHTML` anywhere: content is structured data, so what
 * gets rendered is always a known element with known attributes.
 */
export function ContentRenderer({ blocks }: { blocks: ContentBlock[] }) {
  if (blocks.length === 0) {
    return <p className="text-zinc-400 italic">This post has no content yet.</p>;
  }

  return (
    <div className="space-y-6">
      {blocks.map((block) => (
        <Block key={block.id} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "heading": {
      const content = renderRichText(block.text);

      if (block.level === 2) {
        return (
          <h2 className="mt-12 scroll-mt-24 text-2xl leading-tight font-semibold tracking-tight text-zinc-900">
            {content}
          </h2>
        );
      }
      if (block.level === 3) {
        return (
          <h3 className="mt-10 scroll-mt-24 text-xl leading-snug font-semibold tracking-tight text-zinc-900">
            {content}
          </h3>
        );
      }
      return (
        <h4 className="mt-8 scroll-mt-24 text-lg leading-snug font-semibold text-zinc-900">
          {content}
        </h4>
      );
    }

    case "paragraph":
      return (
        <p className="text-[1.0625rem] leading-8 text-zinc-700">
          {renderRichText(block.text)}
        </p>
      );

    case "list": {
      const items = block.items.map((item, index) => (
        <li key={index} className="pl-1.5 leading-8">
          {renderRichText(item)}
        </li>
      ));

      return block.ordered ? (
        <ol className="list-decimal space-y-2 pl-6 text-[1.0625rem] text-zinc-700 marker:text-zinc-400">
          {items}
        </ol>
      ) : (
        <ul className="list-disc space-y-2 pl-6 text-[1.0625rem] text-zinc-700 marker:text-zinc-300">
          {items}
        </ul>
      );
    }

    case "quote":
      return (
        <blockquote className="border-l-2 border-zinc-900 py-1 pl-6">
          <p className="text-lg leading-8 text-zinc-800 italic">
            {renderRichText(block.text)}
          </p>
          {block.cite ? (
            <cite className="mt-2 block text-sm text-zinc-500 not-italic">
              — {block.cite}
            </cite>
          ) : null}
        </blockquote>
      );

    case "image":
      return (
        <figure className="my-10">
          <Image
            src={block.src}
            alt={block.alt}
            width={1600}
            height={900}
            sizes="(min-width: 768px) 42rem, 100vw"
            className="h-auto w-full rounded-xl bg-zinc-100"
          />
          {block.caption ? (
            <figcaption className="mt-3 text-center text-sm text-zinc-500">
              {block.caption}
            </figcaption>
          ) : null}
        </figure>
      );

    case "code":
      return (
        <pre className="overflow-x-auto rounded-xl bg-zinc-900 p-5 text-sm leading-6 text-zinc-100">
          <code className="font-mono">{block.code}</code>
        </pre>
      );

    case "divider":
      return (
        <hr className="mx-auto my-12 w-16 border-t border-zinc-200" />
      );

    default:
      return null;
  }
}
