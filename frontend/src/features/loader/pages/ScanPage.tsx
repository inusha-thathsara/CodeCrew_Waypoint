import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, XCircle } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { InfoBanner } from "@/components/ui/InfoBanner";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ScannerPanel } from "../components/ScannerPanel";
import { ScreenFrame } from "../components/ScreenFrame";
import { useTrip } from "../hooks/useLoaderData";
import { manualScanSchema } from "../schemas";
import { useWorkflow } from "../store/workflowStore";
import {
  activeStops,
  currentPalletIndex,
  nextCrate,
  palletProgress,
} from "../utils/selectors";
import type { ScanFailure } from "../types";

const FAIL_TITLE: Record<ScanFailure, string> = {
  INVALID_FORMAT: "BARCODE NOT READABLE",
  NOT_EXPECTED: "CRATE NOT EXPECTED",
  WRONG_DESTINATION: "WRONG DESTINATION",
  DUPLICATE: "DUPLICATE SCAN",
  DAMAGED: "CRATE DAMAGED",
  TEMP_FAIL: "TEMPERATURE FAIL",
};

export default function ScanPage() {
  const navigate = useNavigate();
  const { data: trip } = useTrip();
  const s = useWorkflow();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ barcode: string }>({ resolver: zodResolver(manualScanSchema) });
  if (!trip) return null;
  if (!s.checkApprovedAt)
    return <Navigate to={`/loader/vehicle/${trip.vehicleId}/check`} replace />;

  const stops = activeStops(trip, s);
  const idx = currentPalletIndex(trip, s);
  const stop = idx >= 0 ? stops[idx] : undefined;
  const progress = stop ? palletProgress(trip, s, stop) : null;
  const blocked = !!s.exception && !s.exception.supervisor;
  const next = nextCrate(trip, s);
  const out = s.lastOutcome;
  const prefix = stop ? `CR-${stop.outletId.slice(3)}-` : "";
  const recent = Object.entries(s.scans)
    .filter(([id]) => id.startsWith(prefix))
    .slice(-4)
    .reverse();
  const stagedKg = stop
    ? Math.round(
        trip.crates
          .filter((c) => c.outletId === stop.outletId && s.scans[c.id])
          .reduce((n, c) => n + c.weightKg, 0),
      )
    : 0;
  const lastStop = out?.ok
    ? trip.stops.find((x) => x.outletId === out.crate.outletId)
    : undefined;
  const palletDone = lastStop
    ? palletProgress(trip, s, lastStop).complete
    : false;

  // Demo helper: scan everything until a problem appears
  const autoScan = () => {
    for (;;) {
      const st = useWorkflow.getState();
      const c = nextCrate(trip, st);
      if (!c) break;
      st.scan(trip, c.id);
      if (!useWorkflow.getState().lastOutcome?.ok) break;
    }
  };

  const reportDamage = () => {
    s.createException();
    navigate(`/loader/trip/${trip.id}/exception`);
  };

  return (
    <ScreenFrame
      title="Bay 04 Kiosk"
      status={blocked ? "Exception Alert" : "Active Scanning"}
      step={3}
      footer={
        stop && progress ? (
          <PrimaryButton
            className="w-full"
            disabled={blocked || !next}
            onClick={() => next && s.scan(trip, next.id)}
          >
            Scan Next Crate (
            {progress.total - progress.verified - progress.resolved} remaining)
          </PrimaryButton>
        ) : (
          <PrimaryButton
            variant="ok"
            className="w-full"
            onClick={() => navigate(`/loader/trip/${trip.id}/stowage`)}
          >
            ✓ All pallets staged. Continue to Stowage & Seal
          </PrimaryButton>
        )
      }
    >
      {blocked && (
        <InfoBanner tone="warn">
          ⚠ Resolve the open exception before scanning.{" "}
          <button
            className="underline"
            onClick={() => navigate(`/loader/trip/${trip.id}/exception`)}
          >
            Open exception
          </button>
        </InfoBanner>
      )}

      {stop && progress && (
        <Card>
          <ProgressBar
            label={`WEIGHT STAGED · ${stop.palletTag}`}
            value={stagedKg}
            max={stop.weightKg}
            valueText={`${stagedKg} / ${stop.weightKg} kg`}
          />
          <div className="mt-3">
            <ProgressBar
              label={`CRATES · ${stop.outletId} · Pallet ${idx + 1} of ${stops.length}`}
              value={progress.verified + progress.resolved}
              max={progress.total}
              valueText={`${progress.verified} / ${progress.total} verified`}
            />
          </div>
        </Card>
      )}

      <ScannerPanel />

      {out && out.ok && (
        <Card active>
          <p className="flex items-center gap-2 text-sm font-bold text-ok-dark">
            <CheckCircle2 size={18} /> ✓ CRATE VERIFIED
          </p>
          <p className="mt-1 text-lg font-bold">{out.crate.id}</p>
          <p className="text-sm">
            {out.crate.description} · {out.crate.weightKg} kg
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <dt className="text-muted">Temperature</dt>
              <dd className="font-bold text-cold">
                +{out.crate.tempC}°C · PASS
              </dd>
            </div>
            <div>
              <dt className="text-muted">Destination</dt>
              <dd className="font-bold">
                {out.crate.outletId} · {trip.brand} · {trip.district}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Order</dt>
              <dd className="font-bold">
                {lastStop?.orderRef} · Drop {lastStop?.drop}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Shock sensor</dt>
              <dd className="font-bold">0.1G · Intact</dd>
            </div>
          </dl>
          {palletDone && (
            <p className="mt-3 text-xs font-bold text-ok-dark">
              ✓ PALLET {lastStop?.palletTag} COMPLETE. Load it into the van
              before scanning the next one.
            </p>
          )}
        </Card>
      )}

      {out && !out.ok && (
        <div
          role="alert"
          className="rounded-2xl border-2 border-danger bg-danger-bg p-5"
        >
          <p className="flex items-center gap-2 text-sm font-bold text-danger">
            <XCircle size={18} /> ✕ {FAIL_TITLE[out.reason]}
          </p>
          <p className="mt-1 text-sm">{out.message}</p>
          {out.expected && (
            <p className="mt-1 text-xs font-bold">
              Expected: {out.expected} · Scanned: {out.scanned}
            </p>
          )}
          {out.reason === "DAMAGED" && (
            <PrimaryButton className="mt-3 w-full" onClick={reportDamage}>
              Report Damage & Shortfall
            </PrimaryButton>
          )}
        </div>
      )}

      <Card>
        <form
          onSubmit={handleSubmit(({ barcode }) => {
            s.scan(trip, barcode);
            reset();
          })}
          noValidate
          className="flex flex-wrap items-end gap-2"
        >
          <div className="min-w-0 flex-1">
            <label htmlFor="barcode" className="text-xs font-bold">
              Type a barcode (backup)
            </label>
            <input
              id="barcode"
              placeholder="CR-076-001"
              autoComplete="off"
              {...register("barcode")}
              className="mt-1 block h-12 w-full rounded-xl border border-line px-4 focus-visible:outline-2 focus-visible:outline-brand"
            />
          </div>
          <PrimaryButton
            type="submit"
            variant="secondary"
            disabled={blocked || !stop}
          >
            Submit
          </PrimaryButton>
        </form>
        {errors.barcode && (
          <p role="alert" className="mt-1 text-xs font-bold text-danger">
            ✕ {errors.barcode.message}
          </p>
        )}
        <PrimaryButton
          variant="secondary"
          className="mt-3 w-full"
          disabled={blocked || !stop}
          onClick={autoScan}
        >
          Demo: scan remaining crates automatically
        </PrimaryButton>
      </Card>

      {recent.length > 0 && (
        <Card>
          <h2 className="text-xs font-bold text-muted">
            RECENTLY SCANNED CRATES ({stop?.palletTag})
          </h2>
          <ul className="mt-2 divide-y divide-line">
            {recent.map(([id, r]) => (
              <li
                key={id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="font-semibold">{id}</span>
                <span className="text-muted">+{r.tempC}°C</span>
                <span className="text-xs font-bold text-ok-dark">
                  ✓ VERIFIED
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </ScreenFrame>
  );
}
