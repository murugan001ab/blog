import type { ReactNode } from "react";

const TONES = {
  neutral: "bg-zinc-100 text-zinc-700",
  outline: "border border-zinc-200 text-zinc-600",
  success: "bg-emerald-50 text-emerald-700",
  muted: "bg-amber-50 text-amber-700",
} as const;

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
