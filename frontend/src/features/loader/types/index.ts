export type Depot = "Peliyagoda" | "Kandy";

export interface Vehicle {
  id: string;
  label: string;
  depot: Depot;
  weightCapKg: number;
  volumeCapM3: number;
  reefer: boolean;
}

export type BayStatus = "READY_TO_LOAD" | "PRE_COOLING" | "IN_STAGING";

export interface BayCardData {
  bay: string;
  scheduled: string;
  status: BayStatus;
  vehicleId: string;
  driverName: string;
  routeLabel: string;
  drops: number;
  isActive: boolean;
}

export interface DashboardData {
  loader: { name: string; badge: string };
  depot: Depot;
  reeferTempC: number;
  kpis: {
    vehicles: number;
    crates: number;
    breaches: number;
    plannedDeparture: string;
  };
  bays: BayCardData[];
}

export interface Stop {
  drop: number; // 1 = first unloaded
  outletId: string;
  brand: string;
  district: string;
  dockType: string;
  position: string;
  palletTag: string;
  orderRef: string;
  crates: number;
  weightKg: number;
  volumeM3: number;
}

export interface Crate {
  id: string;
  outletId: string;
  description: string;
  weightKg: number;
  tempC: number;
  fault?: "damaged";
  faultNote?: string;
}

export interface CheckItem {
  key: string;
  title: string;
  description: string;
  data: string[];
  auto?: boolean;
}

export interface Trip {
  id: string;
  vehicleId: string;
  vehicle: Vehicle;
  driverName: string;
  loader: { name: string; badge: string };
  supervisor: { name: string; badge: string };
  brand: string;
  district: string;
  depot: Depot;
  hasChilled: boolean;
  plannedDeparture: string;
  gateWindow: string;
  nextVehicle: string;
  gatePassNo: string;
  datalogger: string;
  axleBalance: string;
  cold: { min: number; max: number; probesC: number[]; stowageTempC: number };
  times: {
    check: string;
    supervisor: string;
    loader: string;
    driver: string;
    gate: string;
  };
  contacts: {
    dispatcher: string;
    storeManager: string;
    driver: string;
    invoice: { id: string; before: number; after: number };
  };
  checklist: CheckItem[];
  stops: Stop[]; // already in LOAD order (deepest drop first)
  crates: Crate[];
}

export type ScanFailure =
  | "INVALID_FORMAT"
  | "NOT_EXPECTED"
  | "WRONG_DESTINATION"
  | "DUPLICATE"
  | "DAMAGED"
  | "TEMP_FAIL";

export type ScanOutcome =
  | { ok: true; crate: Crate }
  | {
      ok: false;
      reason: ScanFailure;
      message: string;
      crate?: Crate;
      expected?: string;
      scanned?: string;
    };

export interface ScanRecord {
  at: string;
  tempC: number;
  weightKg: number;
}

export interface ExceptionRecord {
  code: string;
  crateId: string;
  outletId: string;
  quarantined: boolean;
  variance: boolean;
  supervisor: null | { at: string; downstream: "synced" | "queued" };
}

export interface PlanUpdate {
  drop: number;
  outletId: string;
  from: string;
  to: string;
  status: "pending" | "acknowledged";
}

export interface WorkflowSnapshot {
  checks: Record<string, boolean>;
  checkApprovedAt: string | null;
  scans: Record<string, ScanRecord>;
  lastOutcome: ScanOutcome | null;
  exception: ExceptionRecord | null;
  planUpdate: PlanUpdate | null;
  stowChecks: Record<string, boolean>;
  seal: string | null;
  loaderSignedAt: string | null;
  driverSignedAt: string | null;
  departed: boolean;
}

export interface LoaderApi {
  getDashboard(): Promise<DashboardData>;
  getTrip(): Promise<Trip>;
  getPlanUpdate(): Promise<PlanUpdate>;
  verifyPin(role: "supervisor" | "driver", pin: string): Promise<boolean>;
  sync(records: { id: string }[]): Promise<{ acceptedIds: string[] }>;
}
