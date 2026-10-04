import { Navigate, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusChip } from "@/components/ui/StatusChip";
import { useSyncStore } from "@/services/offline/syncStore";
import { PinForm } from "../components/PinForm";
import { ScreenFrame } from "../components/ScreenFrame";
import { useTrip } from "../hooks/useLoaderData";
import { useWorkflow } from "../store/workflowStore";
import { totals } from "../utils/selectors";

const THRESHOLD_PCT = 10;
const lkr = (n: number) => n.toLocaleString("en-LK");

export default function SupervisorPage() {
  const navigate = useNavigate();
  const { data: trip } = useTrip();
  const s = useWorkflow();
  const pending = useSyncStore((x) => x.pending);
  if (!trip) return null;
  const ex = s.exception;
  if (!ex || !ex.quarantined || !ex.variance)
    return <Navigate to={`/loader/trip/${trip.id}/exception`} replace />;

  const stop = trip.stops.find((x) => x.outletId === ex.outletId)!;
  const pct = Math.round((1 / stop.crates) * 1000) / 10;
  const within = pct <= THRESHOLD_PCT;
  const t = totals(trip, s);
  const auth = ex.supervisor;
  const queued = auth?.downstream === "queued" && pending > 0;

  const rows = [
    {
      who: "DISPATCHER",
      name: trip.contacts.dispatcher,
      ok: "SYNCED",
      detail: `Manifest updated to ${t.plannedUnits - 1}/${t.plannedUnits} crates`,
    },
    {
      who: "STORE MANAGER",
      name: `${trip.contacts.storeManager} · ${ex.outletId}`,
      ok: "NOTIFIED",
      detail: `${stop.crates - 1} crates expected. 1 shortfall logged for credit note`,
    },
    {
      who: "DRIVER E-MANIFEST",
      name: trip.contacts.driver,
      ok: "REFRESHED",
      detail: "Roadside manifest shows the reduced count",
    },
    {
      who: "ERP BILLING",
      name: `Invoice ${trip.contacts.invoice.id}`,
      ok: "ADJUSTED",
      detail: `LKR ${lkr(trip.contacts.invoice.before)} → LKR ${lkr(trip.contacts.invoice.after)}`,
    },
  ];

  return (
    <ScreenFrame
      title="Bay 04 Kiosk"
      status="Supervisor Sign-Off"
      step={4}
      footer={
        auth ? (
          <PrimaryButton
            variant="ok"
            className="w-full"
            onClick={() => navigate(`/loader/trip/${trip.id}/load-plan`)}
          >
            ✓ Confirm Override & Continue Loading
          </PrimaryButton>
        ) : undefined
      }
    >
      <Card active>
        <h2 className="text-sm font-bold">SUPERVISOR DISPATCH OVERRIDE</h2>
        <p className="mt-1 text-sm">
          {trip.supervisor.name} · Shift Manager {trip.supervisor.badge}
        </p>
        <p className="mt-2 text-xs text-muted">
          Reason: shortfall of {pct}% is {within ? "within" : "above"} the{" "}
          {THRESHOLD_PCT}% threshold. Replacement planned for afternoon trip #2.
        </p>
        {auth ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusChip tone="ok">✓ PIN AUTHENTICATED</StatusChip>
            <StatusChip>PIN verified (••••)</StatusChip>
            <StatusChip>Authorized {auth.at}</StatusChip>
          </div>
        ) : within ? (
          <div className="mt-4">
            <PinForm
              role="supervisor"
              label="Supervisor PIN"
              submitLabel="Authorize Shortfall Override"
              hint="Demo PIN: 4821"
              onVerified={() => s.authorize(trip.times.supervisor)}
            />
          </div>
        ) : (
          <div className="mt-3">
            <InfoBanner tone="danger">
              ✕ Shortfall exceeds the {THRESHOLD_PCT}% threshold. The dispatcher
              must replan this trip.
            </InfoBanner>
          </div>
        )}
      </Card>

      {auth && (
        <>
          <h2 className="text-xs font-bold text-muted">
            REAL-TIME DOWNSTREAM NOTIFICATIONS
          </h2>
          {rows.map((r) => (
            <Card key={r.who}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] font-bold text-muted">{r.who}</p>
                  <p className="text-sm font-bold">{r.name}</p>
                </div>
                <StatusChip tone={queued ? "warn" : "ok"}>
                  {queued ? "⏳ QUEUED · SENDS WHEN ONLINE" : `✓ ${r.ok}`}
                </StatusChip>
              </div>
              <p className="mt-1 text-xs text-muted">{r.detail}</p>
            </Card>
          ))}
        </>
      )}
    </ScreenFrame>
  );
}
