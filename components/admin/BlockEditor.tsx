"use client";

import type { ContentBlock } from "@/types/blog";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { RichTextField } from "@/components/admin/RichTextField";
import { createId } from "@/lib/utils/slug";

const BLOCK_LABELS: Record<ContentBlock["type"], string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  list: "List",
  quote: "Quote",
  image: "Image",
  code: "Code",
  divider: "Divider",
};

function blankBlock(type: ContentBlock["type"]): ContentBlock {
  const id = createId("block");
  switch (type) {
    case "heading":
      return { id, type, level: 2, text: "" };
    case "paragraph":
      return { id, type, text: "" };
    case "list":
      return { id, type, ordered: false, items: [""] };
    case "quote":
      return { id, type, text: "", cite: "" };
    case "image":
      return { id, type, src: "", alt: "", caption: "" };
    case "code":
      return { id, type, language: "", code: "" };
    case "divider":
      return { id, type };
  }
}

export function BlockEditor({
  blocks,
  onChange,
  images,
}: {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
  images: string[];
}) {
  function updateBlock(index: number, next: ContentBlock) {
    onChange(blocks.map((block, i) => (i === index ? next : block)));
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;

    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function addBlock(type: ContentBlock["type"]) {
    onChange([...blocks, blankBlock(type)]);
  }

  return (
    <div>
      <div className="space-y-4">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">
                {BLOCK_LABELS[block.type]}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => moveBlock(index, -1)}
                  disabled={index === 0}
                  className="text-xs text-zinc-400 transition-colors hover:text-zinc-900 disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 1)}
                  disabled={index === blocks.length - 1}
                  className="text-xs text-zinc-400 transition-colors hover:text-zinc-900 disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  className="text-xs text-zinc-400 transition-colors hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>

            <BlockFields
              block={block}
              images={images}
              onChange={(next) => updateBlock(index, next)}
            />
          </div>
        ))}

        {blocks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-200 px-5 py-8 text-center text-sm text-zinc-400">
            No content yet — add a block below to start writing.
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(BLOCK_LABELS) as ContentBlock["type"][]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900"
          >
            + {BLOCK_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}

function BlockFields({
  block,
  images,
  onChange,
}: {
  block: ContentBlock;
  images: string[];
  onChange: (block: ContentBlock) => void;
}) {
  switch (block.type) {
    case "heading":
      return (
        <div className="space-y-2">
          <div className="flex gap-1.5">
            {([2, 3, 4] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange({ ...block, level })}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  block.level === level
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                H{level}
              </button>
            ))}
          </div>
          <RichTextField
            value={block.text}
            onChange={(text) => onChange({ ...block, text })}
            placeholder="Heading text"
            rows={1}
          />
        </div>
      );

    case "paragraph":
      return (
        <RichTextField
          value={block.text}
          onChange={(text) => onChange({ ...block, text })}
          placeholder="Write a paragraph…"
          rows={4}
        />
      );

    case "list":
      return (
        <div>
          <div className="mb-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => onChange({ ...block, ordered: false })}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                !block.ordered
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              Bulleted
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...block, ordered: true })}
              className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                block.ordered
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              Numbered
            </button>
          </div>

          <div className="space-y-2">
            {block.items.map((item, itemIndex) => (
              <div key={itemIndex} className="flex items-start gap-2">
                <span className="mt-2.5 text-xs text-zinc-400">
                  {block.ordered ? `${itemIndex + 1}.` : "•"}
                </span>
                <input
                  value={item}
                  onChange={(event) => {
                    const items = [...block.items];
                    items[itemIndex] = event.target.value;
                    onChange({ ...block, items });
                  }}
                  placeholder="List item"
                  className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-400 focus:ring-0 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      ...block,
                      items: block.items.filter((_, i) => i !== itemIndex),
                    })
                  }
                  disabled={block.items.length <= 1}
                  className="mt-1.5 text-xs text-zinc-400 transition-colors hover:text-red-600 disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onChange({ ...block, items: [...block.items, ""] })}
            className="mt-2 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            + Add item
          </button>
        </div>
      );

    case "quote":
      return (
        <div className="space-y-2">
          <RichTextField
            value={block.text}
            onChange={(text) => onChange({ ...block, text })}
            placeholder="Quote text"
            rows={2}
          />
          <input
            value={block.cite ?? ""}
            onChange={(event) => onChange({ ...block, cite: event.target.value })}
            placeholder="Attribution (optional)"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:ring-0 focus:outline-none"
          />
        </div>
      );

    case "image":
      return (
        <div className="space-y-3">
          <ImagePicker
            images={images}
            value={block.src || null}
            onSelect={(src) => onChange({ ...block, src })}
          />
          <input
            value={block.alt}
            onChange={(event) => onChange({ ...block, alt: event.target.value })}
            placeholder="Alt text (for accessibility and SEO)"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:ring-0 focus:outline-none"
          />
          <input
            value={block.caption ?? ""}
            onChange={(event) =>
              onChange({ ...block, caption: event.target.value })
            }
            placeholder="Caption (optional)"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:ring-0 focus:outline-none"
          />
        </div>
      );

    case "code":
      return (
        <div className="space-y-2">
          <input
            value={block.language ?? ""}
            onChange={(event) =>
              onChange({ ...block, language: event.target.value })
            }
            placeholder="Language (optional, e.g. tsx)"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 focus:border-zinc-400 focus:ring-0 focus:outline-none"
          />
          <textarea
            value={block.code}
            onChange={(event) => onChange({ ...block, code: event.target.value })}
            placeholder="code goes here"
            rows={6}
            className="w-full resize-y rounded-lg border border-zinc-200 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-zinc-600 focus:ring-0 focus:outline-none"
          />
        </div>
      );

    case "divider":
      return (
        <p className="py-2 text-center text-xs text-zinc-400">
          A horizontal rule will appear here.
        </p>
      );
  }
}
