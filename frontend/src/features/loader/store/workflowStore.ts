import { create } from "zustand";
import { db } from "@/services/offline/db";
import { recordEvent, refreshPending } from "@/services/offline/outbox";
import { evaluateScan } from "../utils/scan";
import { activeStops, currentPalletIndex } from "../utils/selectors";
import type { PlanUpdate, Trip, WorkflowSnapshot } from "../types";

const EMPTY: WorkflowSnapshot = {
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

interface Actions {
  hydrate(): Promise<void>;
  toggleCheck(key: string): void;
  approveCheck(at: string): void;
  scan(trip: Trip, raw: string): void;
  createException(): void;
  quarantine(): void;
  logVariance(): void;
  authorize(at: string): void;
  toggleStow(key: string): void;
  setSeal(seal: string): void;
  signLoader(at: string): void;
  signDriver(at: string): void;
  depart(): void;
  receivePlanUpdate(u: PlanUpdate): void;
  acknowledgePlanUpdate(): void;
  reset(): Promise<void>;
}

type State = WorkflowSnapshot & Actions & { hydrated: boolean };

export const useWorkflow = create<State>((set, get) => ({
  ...EMPTY,
  hydrated: false,

  async hydrate() {
    const saved = await db.kv.get("workflow");
    set({
      ...EMPTY,
      ...(saved?.value as Partial<WorkflowSnapshot> | undefined),
      hydrated: true,
    });
    await refreshPending();
  },

  toggleCheck(key) {
    set((s) => ({ checks: { ...s.checks, [key]: !s.checks[key] } }));
  },

  approveCheck(at) {
    set({ checkApprovedAt: at });
    void recordEvent("VEHICLE_CHECK_APPROVED", { at });
  },

  scan(trip, raw) {
    const s = get();
    const stops = activeStops(trip, s);
    const idx = currentPalletIndex(trip, s);
    if (idx < 0) return;
    const outcome = evaluateScan({
      trip,
      raw,
      scans: s.scans,
      activeOutletId: stops[idx].outletId,
    });
    if (outcome.ok) {
      const c = outcome.crate;
      const rec = {
        at: new Date().toISOString(),
        tempC: c.tempC,
        weightKg: c.weightKg,
      };
      set({ scans: { ...s.scans, [c.id]: rec }, lastOutcome: outcome });
      void recordEvent("CRATE_SCANNED", {
        crateId: c.id,
        outletId: c.outletId,
        ...rec,
      });
    } else {
      set({ lastOutcome: outcome });
      void recordEvent("SCAN_REJECTED", {
        reason: outcome.reason,
        scanned: raw,
      });
    }
  },

  createException() {
    const { lastOutcome, exception } = get();
    if (
      exception ||
      !lastOutcome ||
      lastOutcome.ok ||
      lastOutcome.reason !== "DAMAGED" ||
      !lastOutcome.crate
    )
      return;
    const c = lastOutcome.crate;
    const code = `SHORT-${c.outletId.slice(3)}-B04`;
    set({
      exception: {
        code,
        crateId: c.id,
        outletId: c.outletId,
        quarantined: false,
        variance: false,
        supervisor: null,
      },
    });
    void recordEvent("EXCEPTION_CREATED", {
      code,
      crateId: c.id,
      reason: "DAMAGED",
    });
  },

  quarantine() {
    const ex = get().exception;
    if (!ex) return;
    set({ exception: { ...ex, quarantined: true } });
    void recordEvent("CRATE_QUARANTINED", { crateId: ex.crateId });
  },

  logVariance() {
    const ex = get().exception;
    if (!ex || !ex.quarantined) return;
    set({ exception: { ...ex, variance: true } });
    void recordEvent("VARIANCE_LOGGED", { code: ex.code, units: -1 });
  },

  authorize(at) {
    const ex = get().exception;
    if (!ex) return;
    const downstream = navigator.onLine ? "synced" : "queued";
    set({ exception: { ...ex, supervisor: { at, downstream } } });
    void recordEvent("SUPERVISOR_OVERRIDE", { code: ex.code, at });
  },

  toggleStow(key) {
    set((s) => ({
      stowChecks: { ...s.stowChecks, [key]: !s.stowChecks[key] },
    }));
  },

  setSeal(seal) {
    set({ seal });
    void recordEvent("SEAL_VERIFIED", { seal });
  },

  signLoader(at) {
    set({ loaderSignedAt: at });
    void recordEvent("LOADER_SIGNED", { at });
  },

  signDriver(at) {
    set({ driverSignedAt: at });
    void recordEvent("DRIVER_SIGNED", { at });
  },

  depart() {
    set({ departed: true });
    void recordEvent("VEHICLE_DEPARTED", {});
  },

  receivePlanUpdate(u) {
    const { planUpdate, scans } = get();
    const touched = Object.keys(scans).some((id) =>
      id.startsWith(`CR-${u.outletId.slice(3)}-`),
    );
    if (planUpdate || touched) return; // demo guard: don't change a stop that is already loaded
    set({ planUpdate: { ...u, status: "pending" } });
  },

  acknowledgePlanUpdate() {
    const pu = get().planUpdate;
    if (!pu) return;
    set({ planUpdate: { ...pu, status: "acknowledged" } });
    void recordEvent("PLAN_UPDATE_ACKNOWLEDGED", {
      outletId: pu.outletId,
      from: pu.from,
      to: pu.to,
    }); // audit event
  },

  async reset() {
    await db.kv.delete("workflow");
    await db.outbox.clear();
    set({ ...EMPTY });
    await refreshPending();
  },
}));

// Persist every change to IndexedDB (functions are dropped by JSON)
useWorkflow.subscribe((s) => {
  if (!s.hydrated) return;
  void db.kv.put({ key: "workflow", value: JSON.parse(JSON.stringify(s)) });
});
