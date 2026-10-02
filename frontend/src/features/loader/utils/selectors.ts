import type { Crate, Stop, Trip, WorkflowSnapshot } from "../types";

export function movedOutlets(s: WorkflowSnapshot): string[] {
  return s.planUpdate?.status === "acknowledged" ? [s.planUpdate.outletId] : [];
}

export function activeStops(trip: Trip, s: WorkflowSnapshot): Stop[] {
  const moved = movedOutlets(s);
  return trip.stops.filter((x) => !moved.includes(x.outletId));
}

export function isResolved(crateId: string, s: WorkflowSnapshot): boolean {
  return !!s.exception?.supervisor && s.exception.crateId === crateId;
}

export function palletProgress(trip: Trip, s: WorkflowSnapshot, stop: Stop) {
  const crates = trip.crates.filter((c) => c.outletId === stop.outletId);
  const verified = crates.filter((c) => s.scans[c.id]).length;
  const resolved = crates.filter((c) => isResolved(c.id, s)).length;
  return {
    total: crates.length,
    verified,
    resolved,
    complete: verified + resolved === crates.length,
  };
}

/** Index of the pallet being staged now, or -1 when every pallet is done. */
export function currentPalletIndex(trip: Trip, s: WorkflowSnapshot): number {
  return activeStops(trip, s).findIndex(
    (st) => !palletProgress(trip, s, st).complete,
  );
}

export function nextCrate(trip: Trip, s: WorkflowSnapshot): Crate | undefined {
  const idx = currentPalletIndex(trip, s);
  if (idx < 0) return undefined;
  const outlet = activeStops(trip, s)[idx].outletId;
  return trip.crates.find(
    (c) => c.outletId === outlet && !s.scans[c.id] && !isResolved(c.id, s),
  );
}

export function totals(trip: Trip, s: WorkflowSnapshot) {
  const stops = activeStops(trip, s);
  const outlets = stops.map((x) => x.outletId);
  const scanned = trip.crates.filter(
    (c) => s.scans[c.id] && outlets.includes(c.outletId),
  );
  return {
    plannedUnits: stops.reduce((n, x) => n + x.crates, 0),
    plannedKg: stops.reduce((n, x) => n + x.weightKg, 0),
    plannedM3: Math.round(stops.reduce((n, x) => n + x.volumeM3, 0) * 10) / 10,
    loadedUnits: scanned.length,
    payloadKg:
      Math.round(scanned.reduce((n, c) => n + c.weightKg, 0) * 10) / 10,
  };
}

export function stowageDone(s: WorkflowSnapshot): boolean {
  return !!s.seal && !!s.stowChecks.bars && !!s.stowChecks.curtain;
}

/** The next valid screen, so the Loader is never forced to navigate manually. */
export function nextRoute(trip: Trip, s: WorkflowSnapshot): string {
  const base = `/loader/trip/${trip.id}`;
  if (s.departed) return `${base}/departure`;
  if (!s.checkApprovedAt) return `/loader/vehicle/${trip.vehicleId}/check`;
  if (s.exception && !s.exception.supervisor) return `${base}/exception`;
  if (currentPalletIndex(trip, s) >= 0) return `${base}/load-plan`;
  if (!stowageDone(s)) return `${base}/stowage`;
  return `${base}/departure`;
}
