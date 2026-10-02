import type { ReactNode } from "react";

type Tone = "info" | "warn" | "danger";

const TONES: Record<Tone, string> = {
  info: "border-info-line bg-info-bg text-info-ink",
  warn: "border-warn bg-warn-bg text-warn",
  danger: "border-danger bg-danger-bg text-danger",
};

interface Props {
  tone?: Tone;
  children: ReactNode;
}

export function InfoBanner({ tone = "info", children }: Props) {
  return (
    <div
      role={tone === "info" ? "note" : "alert"}
      className={`rounded-xl border p-3 text-xs font-bold ${TONES[tone]}`}
    >
      {children}
    </div>
  );
}
