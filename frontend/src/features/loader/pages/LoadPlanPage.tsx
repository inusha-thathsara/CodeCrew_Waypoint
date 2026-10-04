import { Check, Info, Play } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StatusChip } from "@/components/ui/StatusChip";
import { ScreenFrame } from "../components/ScreenFrame";
import { VehicleLayout } from "../components/VehicleLayout";
import { useTrip } from "../hooks/useLoaderData";
import { useWorkflow } from "../store/workflowStore";
import {
  activeStops,
  currentPalletIndex,
  palletProgress,
  totals,
} from "../utils/selectors";

export default function LoadPlanPage() {
  const navigate = useNavigate();
  const { data: trip } = useTrip();
  const s = useWorkflow();
  if (!trip) return null;
  if (!s.checkApprovedAt)
    return <Navigate to={`/loader/vehicle/${trip.vehicleId}/check`} replace />;

  const stops = activeStops(trip, s);
  const idx = currentPalletIndex(trip, s);
  const t = totals(trip, s);
  const moved = trip.stops.filter((x) => !stops.includes(x));
  const cap = trip.vehicle.weightCapKg;
  const over = t.plannedKg > cap || t.plannedM3 > trip.vehicle.volumeCapM3;

  return (
    <ScreenFrame
      title="Load Plan"
      status="Staging"
      step={2}
      footer={
        idx >= 0 ? (
          <PrimaryButton
            className="w-full"
            disabled={over}
            onClick={() => navigate(`/loader/trip/${trip.id}/scan`)}
          >
            <Play size={16} className="mr-1 inline" aria-hidden />
            Begin Staging Pallet #{idx + 1} · {stops[idx].outletId}
          </PrimaryButton>
        ) : (
          <PrimaryButton
            variant="ok"
            className="w-full"
            onClick={() => navigate(`/loader/trip/${trip.id}/stowage`)}
          >
            ✓ All staged · Continue to Stowage & Seal
          </PrimaryButton>
        )
      }
    >
      {over && (
        <InfoBanner tone="danger">
          ✕ Load exceeds this vehicle's weight or volume limit. Call the
          dispatcher.
        </InfoBanner>
      )}

      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        <Card compact>
          <div className="grid gap-3">
            <ProgressBar
              label="Weight"
              value={t.plannedKg}
              max={cap}
              danger={over}
              valueText={`${t.plannedKg} / ${cap} kg`}
            />
            <ProgressBar
              label="Staged"
              value={t.loadedUnits}
              max={t.plannedUnits}
              valueText={`${t.loadedUnits} / ${t.plannedUnits} crates`}
            />
          </div>
        </Card>
        <InfoBanner>
          <span className="flex items-start gap-2">
            <Info size={16} className="mt-px shrink-0" aria-hidden />
            Deepest stop goes in first. The first stop to unload goes in last,
            at the door.
          </span>
        </InfoBanner>
      </div>

      <VehicleLayout stops={stops} currentIdx={idx} />

      <div className="grid gap-2">
        {stops.map((st, i) => {
          const p = palletProgress(trip, s, st);
          const current = i === idx;
          return (
            <Card key={st.outletId} active={current} compact>
              <div className="flex items-center gap-3">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white ${
                    p.complete
                      ? "bg-ok-dark"
                      : current
                        ? "bg-brand"
                        : "bg-muted"
                  }`}
                >
                  {p.complete ? <Check size={16} aria-label="Staged" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold">
                    {st.outletId}
                    <span className="font-medium text-muted">
                      {" "}
                      · Drop {st.drop}
                    </span>
                  </p>
                  <p className="truncate text-xs text-muted">
                    {st.position} · {st.crates} crates · {st.weightKg} kg
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {p.complete ? (
                    <StatusChip tone="ok">STAGED</StatusChip>
                  ) : current ? (
                    <StatusChip tone="brand">LOAD NOW</StatusChip>
                  ) : (
                    <StatusChip>QUEUED</StatusChip>
                  )}
                  <span className="text-[11px] font-semibold text-muted">
                    {p.verified + p.resolved}/{p.total}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
        {moved.map((st) => (
          <Card key={st.outletId} compact>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold">
                {st.outletId} · Drop {st.drop}
              </p>
              <StatusChip tone="warn">MOVED TO TRIP 2</StatusChip>
            </div>
          </Card>
        ))}
      </div>
    </ScreenFrame>
  );
}
