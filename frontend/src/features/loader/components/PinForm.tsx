import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { pinSchema } from "../schemas";
import { loaderApi } from "../services";

interface Props {
  role: "supervisor" | "driver";
  label: string;
  submitLabel: string;
  hint?: string;
  onVerified: () => void;
}

export function PinForm({ role, label, submitLabel, hint, onVerified }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<{ pin: string }>({ resolver: zodResolver(pinSchema) });
  const id = `pin-${role}`;

  const submit = handleSubmit(async ({ pin }) => {
    const ok = await loaderApi.verifyPin(role, pin);
    if (ok) onVerified();
    else
      setError("pin", {
        message: "Incorrect PIN. Check the PIN and try again.",
      });
  });

  return (
    <form onSubmit={submit} noValidate className="space-y-2">
      <label htmlFor={id} className="text-xs font-bold">
        {label}
      </label>
      <input
        id={id}
        type="password"
        inputMode="numeric"
        maxLength={4}
        autoComplete="off"
        aria-invalid={!!errors.pin}
        {...register("pin")}
        className="block h-12 w-full rounded-xl border border-line bg-white px-4 text-lg tracking-[0.5em] focus-visible:outline-2 focus-visible:outline-brand"
      />
      {hint && <p className="text-[11px] text-muted">{hint}</p>}
      {errors.pin && (
        <p role="alert" className="text-xs font-bold text-danger">
          ✕ {errors.pin.message}
        </p>
      )}
      <PrimaryButton type="submit" disabled={isSubmitting} className="w-full">
        {submitLabel}
      </PrimaryButton>
    </form>
  );
}
