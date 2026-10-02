import type { ReactNode } from "react";

export type Tone = "ok" | "warn" | "danger" | "cold" | "brand" | "neutral";

const TONES: Record<Tone, string> = {
  ok: "bg-ok-bg text-ok-dark",
  warn: "bg-warn-bg text-warn",
  danger: "bg-danger-bg text-danger",
  cold: "bg-cold-bg text-cold",
  brand: "bg-info-bg text-info-ink",
  neutral: "bg-neutral-bg text-neutral-ink",
};

interface Props {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
}

export function StatusChip({ tone = "neutral", icon, children }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${TONES[tone]}`}
    >
      {icon}
      {children}
    </span>
  );
}
