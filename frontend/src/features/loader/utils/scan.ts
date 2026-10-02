import { barcodeSchema } from "../schemas";
import type { ScanOutcome, ScanRecord, Trip } from "../types";

interface Args {
  trip: Trip;
  raw: string;
  scans: Record<string, ScanRecord>;
  activeOutletId: string;
}

export function evaluateScan({
  trip,
  raw,
  scans,
  activeOutletId,
}: Args): ScanOutcome {
  const parsed = barcodeSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "INVALID_FORMAT",
      message:
        "Barcode not readable. Expected a code like CR-076-001. Rescan or type it in.",
      scanned: raw,
    };
  }
  const id = parsed.data;
  const crate = trip.crates.find((c) => c.id === id);
  if (!crate) {
    return {
      ok: false,
      reason: "NOT_EXPECTED",
      message: `${id} is not on this trip's manifest. Set it aside and tell the supervisor.`,
      scanned: id,
    };
  }
  if (scans[id]) {
    return {
      ok: false,
      reason: "DUPLICATE",
      message: `${id} is already verified. Do not load it twice.`,
      crate,
    };
  }
  if (crate.outletId !== activeOutletId) {
    return {
      ok: false,
      reason: "WRONG_DESTINATION",
      message:
        "This crate belongs to a different stop. Return it to its own pallet.",
      crate,
      expected: activeOutletId,
      scanned: crate.outletId,
    };
  }
  if (crate.fault === "damaged") {
    return {
      ok: false,
      reason: "DAMAGED",
      message: crate.faultNote ?? "Crate is damaged.",
      crate,
    };
  }
  if (crate.tempC < trip.cold.min || crate.tempC > trip.cold.max) {
    return {
      ok: false,
      reason: "TEMP_FAIL",
      message: `Core temperature ${crate.tempC}°C is outside +${trip.cold.min}°C to +${trip.cold.max}°C. Reject it and re-check the cold chain.`,
      crate,
    };
  }
  return { ok: true, crate };
}
