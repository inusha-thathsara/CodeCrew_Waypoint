import { TriangleAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useWorkflow } from "../store/workflowStore";
import { useTrip } from "../hooks/useLoaderData";

export function PlanUpdateBanner() {
  const navigate = useNavigate();
  const { data: trip } = useTrip();
  const pu = useWorkflow((s) => s.planUpdate);
  const acknowledge = useWorkflow((s) => s.acknowledgePlanUpdate);
  if (!pu || pu.status !== "pending" || !trip) return null;
  return (
    <div
      role="alert"
      className="mx-4 mt-4 rounded-2xl border-2 border-warn bg-warn-bg p-4 md:mx-6"
    >
      <p className="flex items-center gap-2 text-sm font-bold text-warn">
        <TriangleAlert size={18} /> LOADING PLAN UPDATED
      </p>
      <p className="mt-1 text-sm">
        Dispatcher changed Drop {pu.drop} · {pu.outletId}. Previous position:{" "}
        <b>{pu.from}</b>. New position: <b>{pu.to}</b>.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <PrimaryButton
          variant="secondary"
          onClick={() => navigate(`/loader/trip/${trip.id}/load-plan`)}
        >
          View Updated Plan
        </PrimaryButton>
        <PrimaryButton onClick={acknowledge}>Acknowledge Update</PrimaryButton>
      </div>
    </div>
  );
}
