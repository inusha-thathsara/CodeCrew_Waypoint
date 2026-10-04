import { CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusChip } from "@/components/ui/StatusChip";
import { ScreenFrame } from "../components/ScreenFrame";
import { useTrip } from "../hooks/useLoaderData";
import { useWorkflow } from "../store/workflowStore";

export default function VehicleCheckPage() {
  const navigate = useNavigate();
  const { data: trip } = useTrip();
  const checks = useWorkflow((s) => s.checks);
  const toggleCheck = useWorkflow((s) => s.toggleCheck);
  const approveCheck = useWorkflow((s) => s.approveCheck);
  if (!trip) return null;

  const v = trip.vehicle;
  const coldOk = trip.cold.probesC.every(
    (t) => t >= trip.cold.min && t <= trip.cold.max,
  );
  const reeferMissing = trip.hasChilled && !v.reefer; // chilled goods need a reefer vehicle
  const manual = trip.checklist.filter((c) => !c.auto);
  const allOk = coldOk && !reeferMissing && manual.every((c) => checks[c.key]);
  const chamber = (
    trip.cold.probesC.reduce((a, b) => a + b, 0) / trip.cold.probesC.length
  ).toFixed(1);

  return (
    <ScreenFrame
      title="Bay 04 Kiosk"
      status="Inspection Pending"
      step={1}
      footer={
        <PrimaryButton
          variant="ok"
          className="w-full"
          disabled={!allOk}
          onClick={() => {
            approveCheck(trip.times.check);
            navigate(`/loader/trip/${trip.id}/load-plan`);
          }}
        >
          ✓ Approve Inspection & Unlock Loading Bay 04
        </PrimaryButton>
      }
    >
      {reeferMissing && (
        <InfoBanner tone="danger">
          ✕ This trip carries chilled goods but {v.id} is not refrigerated. Call
          the dispatcher.
        </InfoBanner>
      )}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[15px] font-bold">
              {v.id} · {v.label}
            </p>
            <p className="text-xs text-muted">
              Capacity {v.weightCapKg} kg · {v.volumeCapM3} m³ · {trip.depot}{" "}
              depot
            </p>
          </div>
          <StatusChip tone="cold">CHAMBER +{chamber}°C</StatusChip>
        </div>
      </Card>

      {trip.checklist.map((c, i) => {
        const ok = c.auto ? coldOk : !!checks[c.key];
        return (
          <Card key={c.key}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <span className="grid size-6 place-items-center rounded-full bg-brand text-sm text-white">
                  {i + 1}
                </span>
                {c.title}
              </h2>
              <StatusChip
                tone={ok ? "ok" : "warn"}
                icon={ok ? <CheckCircle2 size={12} /> : <Clock size={12} />}
              >
                {ok
                  ? c.auto
                    ? "COMPLIANT"
                    : "CONFIRMED"
                  : c.auto
                    ? "OUT OF RANGE"
                    : "PENDING"}
              </StatusChip>
            </div>
            <p className="mt-2 text-xs text-muted">{c.description}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {c.data.map((d) => (
                <span
                  key={d}
                  className="rounded-md bg-neutral-bg px-2.5 py-1 text-[11px] font-medium"
                >
                  {d}
                </span>
              ))}
            </div>
            {!c.auto && (
              <PrimaryButton
                variant={ok ? "secondary" : "brand"}
                aria-pressed={ok}
                className="mt-3 w-full md:w-auto"
                onClick={() => toggleCheck(c.key)}
              >
                {ok ? "Confirmed (tap to undo)" : `Confirm: ${c.title}`}
              </PrimaryButton>
            )}
          </Card>
        );
      })}
    </ScreenFrame>
  );
}
