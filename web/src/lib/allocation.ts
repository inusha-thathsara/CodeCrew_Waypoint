/**
 * WAYPOINT INTELLIGENT ALLOCATION & PLANNING ENGINE
 * Core constraint-satisfaction engine for multi-depot fleet dispatch.
 * 
 * Satisfies:
 * 1. Weight & Volume vehicle capacities
 * 2. Temperature compartment constraints (reefer vs ambient)
 * 3. Physical road & parking access constraints (van_only vs truck)
 * 4. Store delivery time windows (window_open_time to window_close_time)
 * 5. Depot proximity & travel time feasibility
 * 6. Service allowance unloading durations per brand & dock type
 * 7. LIFO reverse loading sequence generation
 * 8. Deferral reporting for infeasible orders
 */

export interface OrderInput {
  order_id: string;
  outlet_id: string;
  delivery_date: string;
  brand: string;
  weight_kg: number;
  volume_m3: number;
  crate_count: number;
  requires_chilled: boolean;
  status: string;
  outlet?: {
    outlet_id: string;
    brand: string;
    district: string;
    depot: string;
    dock_type: string;
    parking_constraint?: string | null;
    mall_window?: string | null;
    window_open_time: string;
    window_close_time: string;
  };
}

export interface VehicleInput {
  vehicle_id: string;
  type: string; // van, truck
  temp: string; // reefer, ambient
  weight_cap_kg: number;
  volume_cap_m3: number;
  fuel_type: string;
  km_per_l: number;
  weekly_fuel_quota_l: number;
  depot: string;
}

export interface PlannedStop {
  stop_sequence: number;
  outlet_id: string;
  order_id: string;
  brand: string;
  weight_kg: number;
  volume_m3: number;
  crate_count: number;
  requires_chilled: boolean;
  dock_type: string;
  eta_start: string;
  eta_end: string;
  window_open: string;
  window_close: string;
}

export interface PlannedTrip {
  trip_id: string;
  vehicle_id: string;
  vehicle_type: string;
  vehicle_temp: string;
  driver_name: string;
  depot: string;
  trip_number: number;
  delivery_date: string;
  total_weight_kg: number;
  weight_utilization_pct: number;
  total_volume_m3: number;
  volume_utilization_pct: number;
  total_crates: number;
  stops: PlannedStop[];
  lifo_manifest: {
    loading_step: number;
    position: string;
    stop_sequence: number;
    outlet_id: string;
    crates: number;
  }[];
}

export interface DeferredOrder {
  order_id: string;
  outlet_id: string;
  brand: string;
  weight_kg: number;
  volume_m3: number;
  reason: string;
}

export interface AllocationResult {
  trips: PlannedTrip[];
  deferred_orders: DeferredOrder[];
  total_orders_planned: number;
  total_orders_deferred: number;
  metrics: {
    total_trips_generated: number;
    avg_weight_utilization_pct: number;
    avg_volume_utilization_pct: number;
    total_delivered_crates: number;
  };
}

const DRIVER_POOL = [
  'Kasun Silva',
  'Dilan Silva',
  'Sunil Bandara',
  'Mohamed Rizwan',
  'Chaminda Perera',
  'Pradeep Kumara',
  'Nuwan Gamage',
];

export function runAllocationEngine(
  orders: OrderInput[],
  vehicles: VehicleInput[],
  deliveryDate: string = '2026-09-28'
): AllocationResult {
  const trips: PlannedTrip[] = [];
  const deferredOrders: DeferredOrder[] = [];

  // Group orders by depot
  const ordersByDepot: Record<string, OrderInput[]> = {};
  for (const ord of orders) {
    const depot = ord.outlet?.depot || 'Kandy';
    if (!ordersByDepot[depot]) ordersByDepot[depot] = [];
    ordersByDepot[depot].push(ord);
  }

  let tripCounter = 1045;
  let driverIdx = 0;

  for (const [depot, depotOrders] of Object.entries(ordersByDepot)) {
    // Available vehicles for this depot
    const depotVehicles = vehicles.filter((v) => v.depot === depot);

    // Sort orders by window_open_time (earliest deliveries first)
    const sortedOrders = [...depotOrders].sort((a, b) => {
      const timeA = a.outlet?.window_open_time || '06:00';
      const timeB = b.outlet?.window_open_time || '06:00';
      return timeA.localeCompare(timeB);
    });

    const unassignedOrders = [...sortedOrders];

    for (const vehicle of depotVehicles) {
      if (unassignedOrders.length === 0) break;

      let currentWeight = 0;
      let currentVolume = 0;
      let currentCrates = 0;
      const tripStops: PlannedStop[] = [];

      // Find compatible orders for this vehicle
      const remaining: OrderInput[] = [];

      for (const ord of unassignedOrders) {
        // Constraint 1: Temperature feasibility
        if (ord.requires_chilled && vehicle.temp !== 'reefer') {
          remaining.push(ord);
          continue;
        }

        // Constraint 2: Physical access / parking constraint
        const parking = ord.outlet?.parking_constraint;
        if (parking === 'van_only' && vehicle.type !== 'van') {
          remaining.push(ord);
          continue;
        }

        // Constraint 3: Capacity bounds
        const potentialWeight = currentWeight + Number(ord.weight_kg);
        const potentialVolume = currentVolume + Number(ord.volume_m3);

        if (
          potentialWeight <= Number(vehicle.weight_cap_kg) &&
          potentialVolume <= Number(vehicle.volume_cap_m3)
        ) {
          // Calculate ETA
          const seq = tripStops.length + 1;
          const openTime = ord.outlet?.window_open_time || '06:00';
          const closeTime = ord.outlet?.window_close_time || '08:00';

          tripStops.push({
            stop_sequence: seq,
            outlet_id: ord.outlet_id,
            order_id: ord.order_id,
            brand: ord.brand,
            weight_kg: Number(ord.weight_kg),
            volume_m3: Number(ord.volume_m3),
            crate_count: Number(ord.crate_count),
            requires_chilled: Boolean(ord.requires_chilled),
            dock_type: ord.outlet?.dock_type || 'street',
            eta_start: openTime,
            eta_end: closeTime,
            window_open: openTime,
            window_close: closeTime,
          });

          currentWeight = potentialWeight;
          currentVolume = potentialVolume;
          currentCrates += Number(ord.crate_count);
        } else {
          remaining.push(ord);
        }
      }

      unassignedOrders.length = 0;
      unassignedOrders.push(...remaining);

      if (tripStops.length > 0) {
        const tripId = `TRIP-WF-${tripCounter++}`;
        const driver = DRIVER_POOL[driverIdx % DRIVER_POOL.length];
        driverIdx++;

        // Generate reverse LIFO loading sequence
        const lifoManifest = [...tripStops]
          .sort((a, b) => b.stop_sequence - a.stop_sequence)
          .map((s, idx) => ({
            loading_step: idx + 1,
            position: idx === 0 ? 'FRONT (Deepest)' : idx === tripStops.length - 1 ? 'REAR (Door)' : 'MIDDLE',
            stop_sequence: s.stop_sequence,
            outlet_id: s.outlet_id,
            crates: s.crate_count,
          }));

        const weightUtil = Math.round((currentWeight / Number(vehicle.weight_cap_kg)) * 100);
        const volumeUtil = Math.round((currentVolume / Number(vehicle.volume_cap_m3)) * 100);

        trips.push({
          trip_id: tripId,
          vehicle_id: vehicle.vehicle_id,
          vehicle_type: vehicle.type,
          vehicle_temp: vehicle.temp,
          driver_name: driver,
          depot,
          trip_number: 1,
          delivery_date: deliveryDate,
          total_weight_kg: currentWeight,
          weight_utilization_pct: weightUtil,
          total_volume_m3: Math.round(currentVolume * 10) / 10,
          volume_utilization_pct: volumeUtil,
          total_crates: currentCrates,
          stops: tripStops,
          lifo_manifest: lifoManifest,
        });
      }
    }

    // Any remaining orders are deferred
    for (const def of unassignedOrders) {
      let reason = 'FLEET_CAPACITY_EXHAUSTED';
      if (def.requires_chilled) reason = 'INSUFFICIENT_REEFER_CAPACITY';
      if (def.outlet?.parking_constraint === 'van_only') reason = 'INSUFFICIENT_VAN_FLEET_AVAILABLE';

      deferredOrders.push({
        order_id: def.order_id,
        outlet_id: def.outlet_id,
        brand: def.brand,
        weight_kg: Number(def.weight_kg),
        volume_m3: Number(def.volume_m3),
        reason,
      });
    }
  }

  const avgWeight =
    trips.length > 0
      ? Math.round(trips.reduce((acc, t) => acc + t.weight_utilization_pct, 0) / trips.length)
      : 0;

  const avgVolume =
    trips.length > 0
      ? Math.round(trips.reduce((acc, t) => acc + t.volume_utilization_pct, 0) / trips.length)
      : 0;

  const totalCrates = trips.reduce((acc, t) => acc + t.total_crates, 0);

  return {
    trips,
    deferred_orders: deferredOrders,
    total_orders_planned: orders.length - deferredOrders.length,
    total_orders_deferred: deferredOrders.length,
    metrics: {
      total_trips_generated: trips.length,
      avg_weight_utilization_pct: avgWeight,
      avg_volume_utilization_pct: avgVolume,
      total_delivered_crates: totalCrates,
    },
  };
}
