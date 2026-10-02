import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Layers,
  Package,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusChip } from "@/components/ui/StatusChip";
import { ScreenFrame } from "../components/ScreenFrame";
import { useDashboard, useTrip } from "../hooks/useLoaderData";
import { loaderApi } from "../services";
import { useWorkflow } from "../store/workflowStore";
import { nextRoute } from "../utils/selectors";
import type { BayStatus } from "../types";

const statusView: Record<
  BayStatus,
  { label: string; tone: "ok" | "warn" | "neutral"; icon: ReactNode }
> = {
  READY_TO_LOAD: {
    label: "READY TO LOAD",
    tone: "ok",
    icon: <CheckCircle2 size={12} />,
  },
  PRE_COOLING: {
    label: "PRE-COOLING",
    tone: "warn",
    icon: <Clock size={12} />,
  },
  IN_STAGING: {
    label: "IN STAGING",
    tone: "neutral",
    icon: <Layers size={12} />,
  },
};

function Kpi({
  icon,
  label,
  value,
  tone = "",
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-white px-3 py-2.5">
      <dt className="flex items-center gap-1 text-[11px] font-semibold text-muted">
        {icon}
        {label}
      </dt>
      <dd className={`text-xl font-bold ${tone}`}>{value}</dd>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data } = useDashboard();
  const { data: trip } = useTrip();
  const wf = useWorkflow();
  if (!data || !trip)
    return <p className="p-6 font-semibold">Loading shift…</p>;

  const active = data.bays.find((b) => b.isActive)!;
  const upNext = data.bays.filter((b) => !b.isActive);
  const started = !!wf.checkApprovedAt;
  const go = () => navigate(nextRoute(trip, wf));
  const s = statusView[active.status];

  return (
    <ScreenFrame
      title="Dock Dashboard"
      status={wf.departed ? "Departed" : started ? "Loading" : "Shift active"}
    >
      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Kpi
          icon={<Truck size={13} />}
          label="Vehicles"
          value={data.kpis.vehicles}
          tone="text-brand"
        />
        <Kpi
          icon={<Package size={13} />}
          label="Crates"
          value={data.kpis.crates}
        />
        <Kpi
          icon={<ShieldCheck size={13} />}
          label="Breaches"
          value={data.kpis.breaches}
          tone="text-ok-dark"
        />
        <Kpi
          icon={<Clock size={13} />}
          label="Departs"
          value={data.kpis.plannedDeparture}
          tone="text-warn"
        />
      </dl>

      <Card active className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted">
              {active.bay} · LOAD THIS VEHICLE
            </p>
            <p className="text-4xl font-bold tracking-tight">
              {active.vehicleId}
            </p>
            <p className="mt-1 text-sm text-muted">
              {trip.vehicle.label} · {active.driverName}
            </p>
          </div>
          <StatusChip tone={s.tone} icon={s.icon}>
            {s.label}
          </StatusChip>
        </div>
        <p className="mt-2 text-sm font-semibold text-brand">
          {active.routeLabel}
        </p>
        <PrimaryButton className="mt-4 w-full" onClick={go}>
          <Zap size={16} className="mr-1 inline" aria-hidden />
          {wf.departed
            ? "View departure"
            : started
              ? "Continue loading"
              : `Open ${active.bay.replace("BAY", "Bay")}`}
        </PrimaryButton>
      </Card>

      <h2 className="pt-1 text-xs font-bold text-muted">UP NEXT</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {upNext.map((b) => {
          const v = statusView[b.status];
          return (
            <Card key={b.bay} compact>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold">
                  {b.bay} · {b.vehicleId}
                </p>
                <StatusChip tone={v.tone} icon={v.icon}>
                  {v.label}
                </StatusChip>
              </div>
              <p className="mt-1 text-xs text-muted">
                {b.scheduled} · {b.drops} drops · {b.driverName}
              </p>
            </Card>
          );
        })}
      </div>

      <details className="rounded-xl border border-dashed border-line p-3 text-sm">
        <summary className="min-h-8 cursor-pointer font-bold text-muted">
          Demo tools
        </summary>
        <div className="mt-3 flex flex-wrap gap-2">
          <PrimaryButton
            variant="secondary"
            onClick={async () =>
              wf.receivePlanUpdate(await loaderApi.getPlanUpdate())
            }
          >
            Simulate Dispatcher plan update
          </PrimaryButton>
          <PrimaryButton variant="secondary" onClick={() => void wf.reset()}>
            Reset demo data
          </PrimaryButton>
        </div>
      </details>
    </ScreenFrame>
  );
}
