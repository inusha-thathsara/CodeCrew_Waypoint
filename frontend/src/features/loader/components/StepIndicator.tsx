import { STEPS } from "../utils/steps";

export function StepIndicator({ step }: { step: number }) {
  return (
    <nav aria-label="Progress" className="mt-2">
      <ol className="flex gap-1.5">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const bar = n === step ? "bg-brand" : n < step ? "bg-ok" : "bg-line";
          return (
            <li
              key={label}
              aria-current={n === step ? "step" : undefined}
              className="flex-1"
            >
              <div className={`h-1.5 rounded-full ${bar}`} />
              <span
                className={`mt-1 hidden text-center text-[11px] font-bold sm:block ${
                  n === step ? "text-brand" : "text-muted"
                }`}
              >
                {n < step ? "✓" : n} {label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
