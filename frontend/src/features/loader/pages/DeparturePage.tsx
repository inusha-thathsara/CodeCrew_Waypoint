import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusChip } from "@/components/ui/StatusChip";
import { FakeQr } from "../components/FakeQr";
import { PinForm } from "../components/PinForm";
import { ScreenFrame } from "../components/ScreenFrame";
import { useTrip } from "../hooks/useLoaderData";
import { useWorkflow } from "../store/workflowStore";
import { activeStops, totals } from "../utils/selectors";

export default function DeparturePage() {
  const navigate = useNavigate();
  const { data: trip } = useTrip();
  const s = useWorkflow();
  const [confirmOpen, setConfirmOpen] = useState(false);
  if (!trip) return null;
  if (!s.seal)
    return <Navigate to={`/loader/trip/${trip.id}/stowage`} replace />;

  const t = totals(trip, s);
  const stops = [...activeStops(trip, s)].sort((a, b) => a.drop - b.drop); // unload order
  const route = [`${trip.depot} depot`, ...stops.map((x) => x.outletId)].join(
    " → ",
  );
  const both = !!s.loaderSignedAt && !!s.driverSignedAt;

  if (s.departed) {
    return (
      <ScreenFrame
        title="Bay 04 Kiosk"
        status="Departed & Clear"
        step={6}
        footer={
          <PrimaryButton
            className="w-full"
            onClick={async () => {
              await s.reset();
              navigate("/loader");
            }}
          >
            Start a new demo run
          </PrimaryButton>
        }
      >
        <div className="rounded-2xl border border-ok bg-ok-bg p-5">
          <p className="text-base font-bold text-ok-dark">
            ✓ {trip.vehicleId} IS EN ROUTE
          </p>
          <p className="mt-1 text-sm">
            Left the gate at {trip.times.gate} · Gate pass {trip.gatePassNo} ·{" "}
            {route}
          </p>
        </div>
        <Card>
          <StatusChip tone="ok">✓ BAY CLEAR & READY</StatusChip>
          <p className="mt-2 text-xs text-muted">
            Bay 04 shutter locked. Chocks released. Next vehicle:{" "}
            {trip.nextVehicle}
          </p>
        </Card>
      </ScreenFrame>
    );
  }

  return (
    <ScreenFrame
      title="Bay 04 Kiosk"
      status={both ? "Ready for Gate" : "Joint Sign-Off"}
      step={6}
      footer={
        <PrimaryButton
          variant="ok"
          className="w-full"
          disabled={!both}
          onClick={() => setConfirmOpen(true)}
        >
          ✓ Authorize Gate Clearance & Mark Vehicle En Route
        </PrimaryButton>
      }
    >
      <h2 className="text-xs font-bold text-muted">
        JOINT CHAIN-OF-CUSTODY · BOTH SIGNATURES REQUIRED (
        {[s.loaderSignedAt, s.driverSignedAt].filter(Boolean).length} of 2)
      </h2>

      <Card active={!s.loaderSignedAt}>
        <p className="text-[11px] font-bold text-muted">1 · LOADER BAY LEAD</p>
        <p className="text-sm font-bold">
          {trip.loader.name} · Badge {trip.loader.badge}
        </p>
        {s.loaderSignedAt ? (
          <div className="mt-2">
            <StatusChip tone="ok">✓ SIGNED {s.loaderSignedAt}</StatusChip>
          </div>
        ) : (
          <PrimaryButton
            className="mt-3 w-full md:w-auto"
            onClick={() => s.signLoader(trip.times.loader)}
          >
            Sign as Loader
          </PrimaryButton>
        )}
      </Card>

      <Card active={!!s.loaderSignedAt && !s.driverSignedAt}>
        <p className="text-[11px] font-bold text-muted">
          2 · ASSIGNED TRANSPORT DRIVER
        </p>
        <p className="text-sm font-bold">
          {trip.driverName} · {trip.vehicleId}
        </p>
        {s.driverSignedAt ? (
          <div className="mt-2">
            <StatusChip tone="ok">
              ✓ DRIVER PIN VERIFIED {s.driverSignedAt}
            </StatusChip>
          </div>
        ) : s.loaderSignedAt ? (
          <div className="mt-3">
            <PinForm
              role="driver"
              label="Driver PIN"
              submitLabel="Verify Driver & Sign"
              hint="Demo PIN: 2468"
              onVerified={() => s.signDriver(trip.times.driver)}
            />
          </div>
        ) : (
          <p className="mt-2 text-xs text-muted">
            The driver countersigns after the loader.
          </p>
        )}
      </Card>

      {both && (
        <Card active>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold">
              OUTBOUND SECURITY GATE CLEARANCE PASS
            </h2>
            <StatusChip tone="ok">✓ VALID FOR EXIT</StatusChip>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4">
            <FakeQr value={trip.gatePassNo} />
            <div className="min-w-0 flex-1 space-y-1 text-sm">
              <p className="font-bold">Gate Pass {trip.gatePassNo}</p>
              <p>
                Vehicle {trip.vehicleId} · Driver {trip.driverName}
              </p>
              <p className="text-xs text-muted">Route: {route}</p>
              <p className="text-xs text-muted">
                Departure window {trip.gateWindow} (planned{" "}
                {trip.plannedDeparture})
              </p>
              <p className="text-[11px] font-bold text-muted">SCAN AT GATE</p>
            </div>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
            <div>
              <dt className="text-muted">Net cargo</dt>
              <dd className="font-bold">
                {t.loadedUnits} / {t.plannedUnits}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Payload</dt>
              <dd className="font-bold">{t.payloadKg} kg · Compliant</dd>
            </div>
            <div>
              <dt className="text-muted">Bolt seal</dt>
              <dd className="font-bold">#{s.seal}</dd>
            </div>
            <div>
              <dt className="text-muted">Destination</dt>
              <dd className="font-bold">
                {trip.district} · {trip.brand}
              </dd>
            </div>
          </dl>
        </Card>
      )}

      <ConfirmationModal
        open={confirmOpen}
        title="Release this vehicle?"
        body={`${trip.vehicleId} will be marked EN ROUTE and the bay released. This cannot be undone.`}
        confirmLabel="Yes, release vehicle"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          s.depart();
          setConfirmOpen(false);
        }}
      />
    </ScreenFrame>
  );
}
