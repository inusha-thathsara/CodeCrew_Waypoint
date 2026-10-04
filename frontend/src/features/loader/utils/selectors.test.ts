import { describe, expect, it } from "vitest";
import { TRIP } from "../services/seed";
import type { WorkflowSnapshot } from "../types";
import { currentPalletIndex, nextCrate, totals } from "./selectors";

const empty: WorkflowSnapshot = {
  checks: {},
  checkApprovedAt: null,
  scans: {},
  lastOutcome: null,
  exception: null,
  planUpdate: null,
  stowChecks: {},
  seal: null,
  loaderSignedAt: null,
  driverSignedAt: null,
  departed: false,
};

describe("selectors", () => {
  it("starts with pallet 1 (deepest drop) active", () => {
    expect(currentPalletIndex(TRIP, empty)).toBe(0);
    expect(nextCrate(TRIP, empty)?.id).toBe("CR-076-001");
  });
  it("moves to pallet 2 once pallet 1 is verified or resolved", () => {
    const scans = Object.fromEntries(
      TRIP.crates
        .filter((c) => c.outletId === "OUT076" && c.id !== "CR-076-019")
        .map((c) => [c.id, { at: "", tempC: 3, weightKg: c.weightKg }]),
    );
    const s: WorkflowSnapshot = {
      ...empty,
      scans,
      exception: {
        code: "X",
        crateId: "CR-076-019",
        outletId: "OUT076",
        quarantined: true,
        variance: true,
        supervisor: { at: "04:21", downstream: "synced" },
      },
    };
    expect(currentPalletIndex(TRIP, s)).toBe(1);
  });
  it("drops a stop the dispatcher moved to trip 2", () => {
    const s: WorkflowSnapshot = {
      ...empty,
      planUpdate: {
        drop: 2,
        outletId: "OUT080",
        from: "A",
        to: "B",
        status: "acknowledged",
      },
    };
    expect(totals(TRIP, s).plannedUnits).toBe(44);
  });
});
