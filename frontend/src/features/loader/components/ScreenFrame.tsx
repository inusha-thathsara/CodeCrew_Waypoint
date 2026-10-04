import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { useDashboard } from "../hooks/useLoaderData";
import { STEPS } from "../utils/steps";
import { LoaderHeader } from "./LoaderHeader";
import { PlanUpdateBanner } from "./PlanUpdateBanner";
import { StepIndicator } from "./StepIndicator";

interface Props {
  title: string;
  status: string;
  step?: number;
  footer?: ReactNode;
  children: ReactNode;
}

export function ScreenFrame({ title, status, step, footer, children }: Props) {
  const navigate = useNavigate();
  const { data, isError, refetch } = useDashboard();

  if (isError)
    return (
      <div className="p-6">
        <p className="font-bold">Could not load the shift plan.</p>
        <p className="text-sm text-muted">
          Check the connection. Work already saved on this device is kept.
        </p>
        <PrimaryButton className="mt-3" onClick={() => refetch()}>
          Retry
        </PrimaryButton>
      </div>
    );
  if (!data) return <p className="p-6 font-semibold">Loading shift…</p>;

  const active = data.bays.find((b) => b.isActive)!;
  return (
    <div className="flex min-h-svh flex-col bg-canvas">
      <LoaderHeader
        title={title}
        depot={data.depot}
        loaderName={data.loader.name}
        vehicleId={active.vehicleId}
        driverName={active.driverName}
        reeferTempC={data.reeferTempC}
        bayStatus={status}
      />
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col">
        <PlanUpdateBanner />
        {step && (
          <div className="px-4 pt-2 md:px-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex min-h-11 items-center gap-1 pr-3 text-sm font-bold text-brand focus-visible:outline-2 focus-visible:outline-brand"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <p className="text-xs font-bold text-muted sm:hidden">
                Step {step} of {STEPS.length} · {STEPS[step - 1]}
              </p>
            </div>
            <StepIndicator step={step} />
          </div>
        )}
        <main className="flex-1 space-y-3 p-4 md:space-y-4 md:p-6">
          {children}
        </main>
      </div>
      {footer && (
        <div className="sticky bottom-0 z-20 border-t border-line bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-5xl p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:px-6">
            {footer}
          </div>
        </div>
      )}
    </div>
  );
}
