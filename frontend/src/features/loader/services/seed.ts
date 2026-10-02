import type {
  Crate,
  DashboardData,
  PlanUpdate,
  Stop,
  Trip,
  Vehicle,
} from "../types";

// VERIFY every VEH/OUT value below against vehicles.csv / outlets.csv
export const VEHICLES: Vehicle[] = [
  {
    id: "VEH057",
    label: "Reefer Van · 1.5T",
    depot: "Kandy",
    weightCapKg: 1040,
    volumeCapM3: 8,
    reefer: true,
  },
];

// Already in LOAD order: deepest drop first (LIFO). One brand + one district per trip.
const STOPS: Stop[] = [
  {
    drop: 3,
    outletId: "OUT076",
    brand: "Fresh",
    district: "Kandy",
    dockType: "rear_dock",
    position: "CAB FRONT BULKHEAD",
    palletTag: "PL-881",
    orderRef: "WF-1042",
    crates: 20,
    weightKg: 360,
    volumeM3: 2.4,
  },
  {
    drop: 2,
    outletId: "OUT080",
    brand: "Fresh",
    district: "Kandy",
    dockType: "street",
    position: "VAN CENTER SECTION",
    palletTag: "PL-882",
    orderRef: "WF-1043",
    crates: 28,
    weightKg: 320,
    volumeM3: 2.9,
  },
  {
    drop: 1,
    outletId: "OUT002",
    brand: "Fresh",
    district: "Kandy",
    dockType: "street",
    position: "REAR DOOR (1ST UNLOAD)",
    palletTag: "PL-883",
    orderRef: "WF-1044",
    crates: 24,
    weightKg: 200,
    volumeM3: 1.9,
  },
];

const NAMES = [
  "Fresh Carrots 18kg",
  "Iceberg Lettuce 12kg",
  "Highland Fresh Milk 20L",
  "Strawberries Nuwara Eliya",
  "Cabbage 15kg",
];

function makeCrates(stop: Stop): Crate[] {
  return Array.from({ length: stop.crates }, (_, i) => {
    const id = `CR-${stop.outletId.slice(3)}-${String(i + 1).padStart(3, "0")}`;
    const damaged = id === "CR-076-019";
    return {
      id,
      outletId: stop.outletId,
      description: damaged
        ? "Highland Set Yogurt 12x500g"
        : NAMES[i % NAMES.length],
      weightKg: Math.round((stop.weightKg / stop.crates) * 10) / 10,
      tempC: Math.round((3 + (i % 9) * 0.1) * 10) / 10,
      ...(damaged
        ? {
            fault: "damaged" as const,
            faultNote:
              "Crushed carton, liquid leaking. No replacement: Cold Room Rack A-12 is empty.",
          }
        : {}),
    };
  });
}

export const TRIP: Trip = {
  id: "TRIP-KDY-001",
  vehicleId: "VEH057",
  vehicle: VEHICLES[0],
  driverName: "Kasun Bandara",
  loader: { name: "Sunil Perera", badge: "#L-102" },
  supervisor: { name: "Jagath Wickramasinghe", badge: "#SUP-401" },
  brand: "Fresh",
  district: "Kandy",
  depot: "Kandy",
  hasChilled: true,
  plannedDeparture: "04:45",
  gateWindow: "04:40–04:55",
  nextVehicle: "VEH039 · 05:30",
  gatePassNo: "GP-2026-1004-B04",
  datalogger: "#DL-9920",
  axleBalance: "48 / 52%",
  cold: { min: 2, max: 4, probesC: [3.4, 3.5], stowageTempC: 3.2 },
  // One consistent demo timeline, all before the 04:45 planned departure
  times: {
    check: "04:05",
    supervisor: "04:21",
    loader: "04:38",
    driver: "04:39",
    gate: "04:41",
  },
  contacts: {
    dispatcher: "Nimal",
    storeManager: "Anura",
    driver: "Kasun",
    invoice: { id: "INV-8820", before: 148000, after: 140600 },
  },
  checklist: [
    {
      key: "coldchain",
      title: "Cold-Chain Pre-Cooling",
      description: "Pre-cooled to +2.0°C to +4.0°C for at least 30 minutes.",
      data: ["Setpoint +4.0°C", "Probe 1 +3.4°C", "Probe 2 +3.5°C"],
      auto: true,
    },
    {
      key: "sanitized",
      title: "Cargo Floor Sanitization",
      description: "Bed washed, dry and free of residue.",
      data: ["Visual clean: PASS", "Moisture: Dry"],
    },
    {
      key: "securing",
      title: "Cargo Securing Hardware",
      description: "Load bars, straps and thermal curtain present.",
      data: ["4x load bars", "2x heavy straps", "1x thermal curtain"],
    },
    {
      key: "chocks",
      title: "Dock Interlock & Wheel Chocks",
      description: "Chocks at rear tires; leveler lip locked.",
      data: ["Bay 04 lock: engaged", "Driver key: in lockbox"],
    },
  ],
  stops: STOPS,
  crates: STOPS.flatMap(makeCrates),
};

export const DASHBOARD: DashboardData = {
  loader: TRIP.loader,
  depot: "Kandy",
  reeferTempC: 3.5,
  kpis: {
    vehicles: 3,
    crates: 192,
    breaches: 0,
    plannedDeparture: TRIP.plannedDeparture,
  },
  bays: [
    {
      bay: "BAY 04",
      scheduled: "04:45",
      status: "READY_TO_LOAD",
      vehicleId: "VEH057",
      driverName: "Kasun",
      routeLabel: "Fresh · Kandy · 3 drops",
      drops: 3,
      isActive: true,
    },
    {
      bay: "BAY 02",
      scheduled: "05:30",
      status: "PRE_COOLING",
      vehicleId: "VEH039",
      driverName: "Dhammika",
      routeLabel: "Fresh · Kandy · 8 drops",
      drops: 8,
      isActive: false,
    },
    {
      bay: "BAY 06",
      scheduled: "06:15",
      status: "IN_STAGING",
      vehicleId: "VEH012",
      driverName: "Rohan",
      routeLabel: "Fresh · Kandy · 4 drops",
      drops: 4,
      isActive: false,
    },
  ],
};

export const PLAN_UPDATE: PlanUpdate = {
  drop: 2,
  outletId: "OUT080",
  from: "VAN CENTER SECTION",
  to: "TRIP 2",
  status: "pending",
};

// Demo PINs. Real authentication replaces this when the backend connects.
export const DEMO_PINS = { supervisor: "4821", driver: "2468" };
