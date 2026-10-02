import { useState } from "react";
import { TriangleAlert } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { StatusChip } from "@/components/ui/StatusChip";
import { ScreenFrame } from "../components/ScreenFrame";
import { useTrip } from "../hooks/useLoaderData";
import { useWorkflow } from "../store/workflowStore";

export default function ExceptionPage() {
  const navigate = useNavigate();
  const { data: trip } = useTrip();
  const s = useWorkflow();
  const [confirmOpen, setConfirmOpen] = useState(false);
  if (!trip) return null;
  const ex = s.exception;
  if (!ex) return <Navigate to={`/loader/trip/${trip.id}/scan`} replace />;

  const crate = trip.crates.find((c) => c.id === ex.crateId)!;
  const stop = trip.stops.find((x) => x.outletId === ex.outletId)!;
  const ordered = stop.crates;
  const sound = ordered - 1;
  const fulfil = Math.round((sound / ordered) * 1000) / 10;
  const ready = ex.quarantined && ex.variance;

  const steps = [
    {
      title: "Quarantine Damaged Crate",
      desc: `Move ${crate.id} to quarantine bin QUAR-BAY04`,
      done: ex.quarantined,
      doneLabel: "QUARANTINED",
      pending: "TO DO",
      action: () => setConfirmOpen(true),
      actionLabel: "Quarantine crate",
      enabled: true,
    },
    {
      title: "Inventory Variance Logging",
      desc: `Deduct 1 crate from order ${stop.orderRef}`,
      done: ex.variance,
      doneLabel: "RECORDED",
      pending: "TO DO",
      action: s.logVariance,
      actionLabel: "Record variance",
      enabled: ex.quarantined,
    },
    {
      title: "Supervisor PIN Authorization",
      desc: `Shift manager must approve departure at ${fulfil}% fulfillment`,
      done: !!ex.supervisor,
      doneLabel: "AUTHORIZED",
      pending: "ACTION REQUIRED",
    },
    {
      title: "Downstream Notification",
      desc: "Dispatcher, store manager and driver are alerted on sign-off",
      done: !!ex.supervisor,
      doneLabel: "SENT",
      pending: "QUEUED ON SIGN-OFF",
    },
  ];

  return (
    <ScreenFrame
      title="Bay 04 Kiosk"
      status={ex.supervisor ? "Exception Resolved" : "Exception Alert"}
      step={4}
      footer={
        ex.supervisor ? (
          <PrimaryButton
            variant="ok"
            className="w-full"
            onClick={() => navigate(`/loader/trip/${trip.id}/load-plan`)}
          >
            Continue Loading
          </PrimaryButton>
        ) : (
          <PrimaryButton
            className="w-full"
            disabled={!ready}
            onClick={() => navigate(`/loader/trip/${trip.id}/supervisor`)}
          >
            Request Supervisor Sign-Off & Shortfall Override
          </PrimaryButton>
        )
      }
    >
      <div
        role="alert"
        className="rounded-2xl border-2 border-warn bg-warn-bg p-5"
      >
        <p className="flex items-center gap-2 text-sm font-bold text-warn">
          <TriangleAlert size={18} /> ⚠ OPERATIONAL EXCEPTION: CRATE SHORTFALL
        </p>
        <p className="mt-1 text-xs font-bold">CODE: {ex.code}</p>
        <p className="mt-2 text-sm">
          <b>Crate {crate.id.slice(-3)}</b> · {crate.description}
        </p>
        <p className="text-sm font-bold text-danger">
          ✕ DAMAGED: {crate.faultNote}
        </p>
      </div>

      <Card>
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div>
            <dt className="text-[11px] text-muted">Ordered</dt>
            <dd className="text-lg font-bold">{ordered}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">Verified / Sound</dt>
            <dd className="text-lg font-bold text-ok-dark">{sound}</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">Damaged / Short</dt>
            <dd className="text-lg font-bold text-danger">1</dd>
          </div>
          <div>
            <dt className="text-[11px] text-muted">Fulfillment</dt>
            <dd className="text-lg font-bold">{fulfil}%</dd>
          </div>
        </dl>
      </Card>

      <h2 className="text-xs font-bold text-muted">
        REQUIRED EXCEPTION RESOLUTION PROTOCOL
      </h2>
      {steps.map((st, i) => (
        <Card key={st.title}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <span className="grid size-6 place-items-center rounded-full bg-brand text-sm text-white">
                {i + 1}
              </span>
              {st.title}
            </h3>
            <StatusChip tone={st.done ? "ok" : "warn"}>
              {st.done ? `✓ ${st.doneLabel}` : st.pending}
            </StatusChip>
          </div>
          <p className="mt-1 text-xs text-muted">{st.desc}</p>
          {st.action && !st.done && (
            <PrimaryButton
              variant="secondary"
              className="mt-3"
              disabled={!st.enabled}
              onClick={st.action}
            >
              {st.actionLabel}
            </PrimaryButton>
          )}
        </Card>
      ))}

      <ConfirmationModal
        open={confirmOpen}
        title="Quarantine this crate?"
        body={`${crate.id} will be removed from the load and moved to quarantine. This cannot be undone.`}
        confirmLabel="Yes, quarantine"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          s.quarantine();
          setConfirmOpen(false);
        }}
      />
    </ScreenFrame>
  );
}
