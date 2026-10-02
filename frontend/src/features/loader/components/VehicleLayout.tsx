import { ArrowRight } from "lucide-react";
import type { Stop } from "../types";

function Arrow() {
  return (
    <span aria-hidden className="hidden items-center text-muted sm:flex">
      <ArrowRight size={14} />
    </span>
  );
}

export function VehicleLayout({
  stops,
  currentIdx,
}: {
  stops: Stop[];
  currentIdx: number;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3 sm:p-4">
      <ol className="flex items-stretch gap-1 sm:gap-1.5">
        <li className="grid shrink-0 place-items-center rounded-lg bg-navy px-2 text-[11px] font-bold text-white sm:px-4 sm:text-xs">
          CAB
        </li>
        {stops.map((s, i) => {
          const done = currentIdx === -1 || i < currentIdx;
          const cur = i === currentIdx;
          const tone = cur
            ? "border-brand bg-info-bg text-info-ink"
            : done
              ? "border-ok bg-ok-bg text-ok-dark"
              : "border-line bg-neutral-bg text-neutral-ink";
          return (
            <li key={s.outletId} className="contents">
              <Arrow />
              <div
                className={`min-w-0 flex-1 rounded-lg border-2 px-1 py-2 text-center sm:px-3 ${tone}`}
              >
                <p className="text-[10px] font-bold sm:text-[11px]">
                  PALLET {i + 1}
                </p>
                <p className="truncate text-xs font-bold sm:text-sm">
                  {s.outletId}
                </p>
                <p className="text-[10px] font-semibold sm:text-[11px]">
                  {done ? (
                    "✓ Staged"
                  ) : cur ? (
                    <>
                      <span className="sm:hidden">▶ Now</span>
                      <span className="hidden sm:inline">▶ Load now</span>
                    </>
                  ) : (
                    `Drop ${s.drop}`
                  )}
                </p>
              </div>
            </li>
          );
        })}
        <li aria-hidden className="contents">
          <Arrow />
        </li>
        <li className="grid shrink-0 place-items-center rounded-lg bg-navy px-2 text-center text-[11px] font-bold leading-tight text-white sm:px-4 sm:text-xs">
          REAR
          <br />
          DOOR
        </li>
      </ol>
      <p className="mt-2 text-[11px] font-semibold text-muted">
        First loaded = last to unload
      </p>
    </div>
  );
}
