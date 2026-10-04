interface Props {
  label: string;
  value: number;
  max: number;
  valueText: string;
  danger?: boolean;
}

export function ProgressBar({ label, value, max, valueText, danger }: Props) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between gap-2 text-xs">
        <span className="font-semibold text-muted">{label}</span>
        <span className="font-bold">{valueText}</span>
      </div>
      <div
        className="mt-1 h-2 rounded bg-line"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
      >
        <div
          className={`h-2 rounded ${danger ? "bg-danger" : "bg-brand"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
