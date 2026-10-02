import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "brand" | "secondary" | "ok";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-blue-700",
  brand: "bg-brand text-white hover:bg-blue-700",
  ok: "bg-ok-dark text-white hover:bg-emerald-700",
  secondary: "border border-line bg-white text-ink hover:bg-neutral-bg",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function PrimaryButton({
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={`min-h-12 rounded-xl px-5 py-3 text-sm leading-tight font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-40 ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  );
}
