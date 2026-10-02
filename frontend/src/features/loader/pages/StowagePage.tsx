import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusChip } from "@/components/ui/StatusChip";
import { ScreenFrame } from "../components/ScreenFrame";
import { useTrip } from "../hooks/useLoaderData";
import { sealSchema } from "../schemas";
import { useWorkflow } from "../store/workflowStore";
import {
  activeStops,
  currentPalletIndex,
  stowageDone,
  totals,
} from "../utils/selectors";

export default function StowagePage() {
  const navigate = useNavigate();
  const { data: trip } = useTrip();
  const s = useWorkflow();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<{ seal: string }>({ resolver: zodResolver(sealSchema) });
  if (!trip) return null;
  if (!s.checkApprovedAt || currentPalletIndex(trip, s) >= 0)
    return <Navigate to={`/loader/trip/${trip.id}/load-plan`} replace />;

  const stops = activeStops(trip, s);
  const t = totals(trip, s);
  const coldOk =
    trip.cold.stowageTempC >= trip.cold.min &&
    trip.cold.stowageTempC <= trip.cold.max;
  const ready = stowageDone(s) && coldOk;

  const toggles = [
    {
      key: "bars",
      title: "Cargo Load Bars & Ratchet Straps",
      detail: "Cross-bars torqued to 350 daN",
      done: "LOCKED",
    },
    {
      key: "curtain",
      title: "Thermal Curtain Partition",
      detail: "Insulating curtain drawn between zones",
      done: "DRAWN & SEALED",
    },
  ];

  return (
    <ScreenFrame
      title="Bay 04 Kiosk"
      status="Stowage & Sealing"
      step={5}
      footer={
        <PrimaryButton
          className="w-full"
          disabled={!ready}
          onClick={() => navigate(`/loader/trip/${trip.id}/departure`)}
        >
          Proceed to Joint Dual Sign-Off & Security Gate Pass
        </PrimaryButton>
      }
    >
      <div className="rounded-2xl border border-ok bg-ok-bg p-5">
        <p className="text-sm font-bold text-ok-dark">
          ✓ All {stops.length} Pallets Loaded & Secured in {trip.vehicleId}
        </p>
        <p className="mt-1 text-xs font-medium text-ok-dark">
          Final load: {t.loadedUnits} / {t.plannedUnits} units · {t.payloadKg}{" "}
          kg payload · Axle balance {trip.axleBalance}
        </p>
        <div className="mt-2">
          <StatusChip tone="ok">ALL {stops.length} STOPS IN CARGO</StatusChip>
        </div>
      </div>

      <Card active={!s.seal}>
        <h2 className="text-sm font-bold">
          TAMPER-EVIDENT REAR DOOR BOLT SEAL
        </h2>
        {s.seal ? (
          <div className="mt-2 space-y-2">
            <StatusChip tone="ok">✓ SCANNED & VERIFIED</StatusChip>
            <p className="text-xs text-muted">Seal barcode number</p>
            <p className="text-lg font-bold">#{s.seal}</p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(({ seal }) => s.setSeal(seal))}
            noValidate
            className="mt-2 space-y-2"
          >
            <label htmlFor="seal" className="text-xs font-bold">
              Seal barcode number
            </label>
            <input
              id="seal"
              placeholder="SEAL-LK-884921"
              autoComplete="off"
              aria-invalid={!!errors.seal}
              {...register("seal")}
              className="block h-12 w-full rounded-xl border border-line px-4 focus-visible:outline-2 focus-visible:outline-brand"
            />
            {errors.seal && (
              <p role="alert" className="text-xs font-bold text-danger">
                ✕ {errors.seal.message}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <PrimaryButton type="submit">Verify Seal</PrimaryButton>
              <PrimaryButton
                type="button"
                variant="secondary"
                onClick={() => setValue("seal", "SEAL-LK-884921")}
              >
                Use demo seal
              </PrimaryButton>
            </div>
          </form>
        )}
      </Card>

      <h2 className="text-xs font-bold text-muted">
        FINAL PHYSICAL DEPARTURE CHECKLIST
      </h2>
      {toggles.map((c) => {
        const on = !!s.stowChecks[c.key];
        return (
          <Card key={c.key}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold">{c.title}</p>
                <p className="text-xs text-muted">{c.detail}</p>
              </div>
              <StatusChip tone={on ? "ok" : "warn"}>
                {on ? `✓ ${c.done}` : "PENDING"}
              </StatusChip>
            </div>
            <PrimaryButton
              variant={on ? "secondary" : "brand"}
              aria-pressed={on}
              className="mt-3"
              onClick={() => s.toggleStow(c.key)}
            >
              {on ? "Confirmed (tap to undo)" : "Confirm"}
            </PrimaryButton>
          </Card>
        );
      })}
      <Card>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold">Reefer Compartment Temperature</p>
            <p className="text-xs text-muted">Setpoint +{trip.cold.max}.0°C</p>
          </div>
          <StatusChip tone={coldOk ? "ok" : "danger"}>
            {coldOk ? "✓ STABILIZED" : "✕ OUT OF RANGE"} +
            {trip.cold.stowageTempC}°C
          </StatusChip>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-bold">Datalogger {trip.datalogger}</p>
            <p className="text-xs text-muted">
              Bluetooth logger inside pallet 1
            </p>
          </div>
          <StatusChip tone="ok">✓ TRANSMITTING</StatusChip>
        </div>
      </Card>
    </ScreenFrame>
  );
}
