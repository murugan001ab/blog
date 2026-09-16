import type { ReactNode } from "react";

const WIDTHS = {
  prose: "max-w-2xl",
  default: "max-w-5xl",
  wide: "max-w-6xl",
} as const;

export function Container({
  children,
  width = "default",
  className = "",
}: {
  children: ReactNode;
  width?: keyof typeof WIDTHS;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full ${WIDTHS[width]} px-5 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}
