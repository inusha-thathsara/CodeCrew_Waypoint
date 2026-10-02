import type { ReactNode } from "react";

interface Props {
  active?: boolean;
  compact?: boolean;
  className?: string;
  children: ReactNode;
}

export function Card({
  active = false,
  compact = false,
  className = "",
  children,
}: Props) {
  return (
    <section
      className={`min-w-0 rounded-2xl bg-white ${compact ? "p-3" : "p-4"} ${
        active ? "border-2 border-brand" : "border border-line"
      } ${className}`}
    >
      {children}
    </section>
  );
}
