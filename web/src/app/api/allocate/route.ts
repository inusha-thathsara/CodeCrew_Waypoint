import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runAllocationEngine, OrderInput, VehicleInput } from '@/lib/allocation';

// Fallback vehicle fleet matching db/init.sql
const FALLBACK_VEHICLES: VehicleInput[] = [
  { vehicle_id: 'VEH057', type: 'van', temp: 'reefer', weight_cap_kg: 1040, volume_cap_m3: 7.0, fuel_type: 'diesel', km_per_l: 10.3, weekly_fuel_quota_l: 450, depot: 'Kandy' },
  { vehicle_id: 'VEH058', type: 'van', temp: 'reefer', weight_cap_kg: 1040, volume_cap_m3: 7.0, fuel_type: 'diesel', km_per_l: 10.3, weekly_fuel_quota_l: 550, depot: 'Kandy' },
  { vehicle_id: 'VEH059', type: 'van', temp: 'ambient', weight_cap_kg: 1200, volume_cap_m3: 9.0, fuel_type: 'diesel', km_per_l: 10.8, weekly_fuel_quota_l: 610, depot: 'Kandy' },
  { vehicle_id: 'VEH039', type: 'truck', temp: 'reefer', weight_cap_kg: 6180, volume_cap_m3: 29.9, fuel_type: 'diesel', km_per_l: 5.0, weekly_fuel_quota_l: 370, depot: 'Kandy' },
  { vehicle_id: 'VEH040', type: 'truck', temp: 'reefer', weight_cap_kg: 5510, volume_cap_m3: 26.4, fuel_type: 'diesel', km_per_l: 4.7, weekly_fuel_quota_l: 380, depot: 'Kandy' },
  { vehicle_id: 'VEH001', type: 'truck', temp: 'reefer', weight_cap_kg: 5510, volume_cap_m3: 26.4, fuel_type: 'diesel', km_per_l: 4.7, weekly_fuel_quota_l: 340, depot: 'Peliyagoda' },
  { vehicle_id: 'VEH035', type: 'van', temp: 'reefer', weight_cap_kg: 1040, volume_cap_m3: 7.0, fuel_type: 'diesel', km_per_l: 10.3, weekly_fuel_quota_l: 480, depot: 'Peliyagoda' },
  { vehicle_id: 'VEH037', type: 'van', temp: 'ambient', weight_cap_kg: 1100, volume_cap_m3: 8.0, fuel_type: 'diesel', km_per_l: 11.5, weekly_fuel_quota_l: 340, depot: 'Peliyagoda' },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const deliveryDate = body.delivery_date || '2026-09-28';

    let orders: OrderInput[] = [];
    let vehicles: VehicleInput[] = [];

    try {
      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('DB_TIMEOUT')), 600)
      );

      const dbOrders = (await Promise.race([
        db.order.findMany({
          where: {
            delivery_date: new Date(deliveryDate),
            status: { in: ['CONFIRMED', 'PLANNED'] },
          },
          include: {
            outlet: true,
          },
        }),
        timeoutPromise,
      ])) as any[];

      if (dbOrders && dbOrders.length > 0) {
        orders = dbOrders.map((o) => ({
          order_id: o.order_id,
          outlet_id: o.outlet_id || '',
          delivery_date: deliveryDate,
          brand: o.brand,
          weight_kg: Number(o.weight_kg),
          volume_m3: Number(o.volume_m3),
          crate_count: o.crate_count,
          requires_chilled: o.requires_chilled,
          status: o.status,
          outlet: o.outlet || undefined,
        }));
      }

      const dbVehicles = (await Promise.race([
        db.vehicle.findMany(),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error('DB_TIMEOUT')), 400)
        ),
      ])) as any[];

      if (dbVehicles && dbVehicles.length > 0) {
        vehicles = dbVehicles.map((v) => ({
          vehicle_id: v.vehicle_id,
          type: v.type,
          temp: v.temp,
          weight_cap_kg: Number(v.weight_cap_kg),
          volume_cap_m3: Number(v.volume_cap_m3),
          fuel_type: v.fuel_type,
          km_per_l: Number(v.km_per_l),
          weekly_fuel_quota_l: Number(v.weekly_fuel_quota_l),
          depot: v.depot,
        }));
      }
    } catch (dbErr) {
      console.warn('DB read failed or timed out during allocation, using mock dataset:', dbErr);
    }

    if (vehicles.length === 0) {
      vehicles = FALLBACK_VEHICLES;
    }

    // Run the constraint planning engine
    const result = runAllocationEngine(orders, vehicles, deliveryDate);

    // Persist planned trips if DB is connected
    try {
      for (const plannedTrip of result.trips) {
        await db.trip.upsert({
          where: { trip_id: plannedTrip.trip_id },
          create: {
            trip_id: plannedTrip.trip_id,
            vehicle_id: plannedTrip.vehicle_id,
            driver_name: plannedTrip.driver_name,
            depot: plannedTrip.depot,
            trip_number: plannedTrip.trip_number,
            delivery_date: new Date(plannedTrip.delivery_date),
            total_weight_kg: plannedTrip.total_weight_kg,
            total_volume_m3: plannedTrip.total_volume_m3,
            total_crates: plannedTrip.total_crates,
            status: 'PLANNED',
          },
          update: {
            total_weight_kg: plannedTrip.total_weight_kg,
            total_volume_m3: plannedTrip.total_volume_m3,
            total_crates: plannedTrip.total_crates,
          },
        });

        // Insert stops
        for (const stop of plannedTrip.stops) {
          await db.tripStop.create({
            data: {
              trip_id: plannedTrip.trip_id,
              outlet_id: stop.outlet_id,
              stop_sequence: stop.stop_sequence,
              eta_start: stop.eta_start,
              eta_end: stop.eta_end,
              status: 'PLANNED',
            },
          });
        }
      }
    } catch (saveErr) {
      // In offline/mock mode, client receives full computed results regardless
    }

    return NextResponse.json({
      success: true,
      message: `Planning Engine generated ${result.trips.length} optimal routes (${result.total_orders_planned} orders planned, ${result.total_orders_deferred} deferred)`,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Allocation failed' }, { status: 500 });
  }
}
