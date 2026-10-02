import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const SEED_TRIPS = [
  {
    trip_id: 'TRIP-WF-1043',
    vehicle_id: 'VEH057',
    driver_name: 'Kasun Silva',
    depot: 'Kandy',
    trip_number: 1,
    delivery_date: '2026-09-28',
    total_weight_kg: 865,
    total_volume_m3: 3.7,
    total_crates: 47,
    status: 'DEGRADED_OFFLINE',
    departure_time: '04:50',
    last_sync_time: '2026-09-28T06:42:00.000Z',
    is_telemetry_stale: true,
    vehicle: {
      vehicle_id: 'VEH057',
      type: 'van',
      temp: 'reefer',
      weight_cap_kg: 1040,
      volume_cap_m3: 7.0,
      fuel_type: 'diesel',
      km_per_l: 10.3,
      weekly_fuel_quota_l: 450,
      depot: 'Kandy',
    },
    stops: [
      {
        id: 1,
        trip_id: 'TRIP-WF-1043',
        outlet_id: 'OUT077',
        stop_sequence: 1,
        eta_start: '07:12',
        eta_end: '07:34',
        status: 'DELIVERED',
        discrepancy_note: 'Milk short by 3 units (loading issue recorded)',
        signature_data: 'data:image/svg+xml;utf8,<svg>MOCK_SIGNATURE</svg>',
        is_offline_record: true,
        completed_at: '2026-09-28T07:28:00.000Z',
        outlet: {
          outlet_id: 'OUT077',
          brand: 'Fresh',
          district: 'Kandy',
          depot: 'Kandy',
          dock_type: 'street',
          parking_constraint: 'van_only',
          window_open_time: '05:00',
          window_close_time: '07:30',
        },
      },
      {
        id: 2,
        trip_id: 'TRIP-WF-1043',
        outlet_id: 'OUT079',
        stop_sequence: 2,
        eta_start: '07:35',
        eta_end: '07:50',
        status: 'PLANNED',
        discrepancy_note: null,
        signature_data: null,
        is_offline_record: false,
        completed_at: null,
        outlet: {
          outlet_id: 'OUT079',
          brand: 'Fresh',
          district: 'Kandy',
          depot: 'Kandy',
          dock_type: 'street',
          parking_constraint: 'van_only',
          window_open_time: '04:00',
          window_close_time: '07:45',
        },
      },
      {
        id: 3,
        trip_id: 'TRIP-WF-1043',
        outlet_id: 'OUT080',
        stop_sequence: 3,
        eta_start: '07:55',
        eta_end: '08:10',
        status: 'PLANNED',
        discrepancy_note: null,
        signature_data: null,
        is_offline_record: false,
        completed_at: null,
        outlet: {
          outlet_id: 'OUT080',
          brand: 'Fresh',
          district: 'Kandy',
          depot: 'Kandy',
          dock_type: 'street',
          parking_constraint: 'van_only',
          window_open_time: '05:30',
          window_close_time: '08:00',
        },
      },
    ],
  },
  {
    trip_id: 'TRIP-WF-1044',
    vehicle_id: 'VEH039',
    driver_name: 'Dilan Silva',
    depot: 'Kandy',
    trip_number: 1,
    delivery_date: '2026-09-28',
    total_weight_kg: 450,
    total_volume_m3: 1.8,
    total_crates: 22,
    status: 'ON_ROUTE',
    departure_time: '05:30',
    last_sync_time: '2026-09-28T06:55:00.000Z',
    is_telemetry_stale: false,
    vehicle: {
      vehicle_id: 'VEH039',
      type: 'truck',
      temp: 'reefer',
      weight_cap_kg: 6180,
      volume_cap_m3: 29.9,
      fuel_type: 'diesel',
      km_per_l: 5.0,
      weekly_fuel_quota_l: 370,
      depot: 'Kandy',
    },
    stops: [
      {
        id: 4,
        trip_id: 'TRIP-WF-1044',
        outlet_id: 'OUT084',
        stop_sequence: 1,
        eta_start: '06:15',
        eta_end: '06:45',
        status: 'PLANNED',
        discrepancy_note: null,
        signature_data: null,
        is_offline_record: false,
        completed_at: null,
        outlet: {
          outlet_id: 'OUT084',
          brand: 'Fresh',
          district: 'Kandy',
          depot: 'Kandy',
          dock_type: 'rear_dock',
          parking_constraint: 'normal',
          window_open_time: '05:30',
          window_close_time: '08:00',
        },
      },
    ],
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date') || '2026-09-28';
    const driverParam = searchParams.get('driver');
    const vehicleParam = searchParams.get('vehicle_id');
    const statusParam = searchParams.get('status');

    try {
      const whereClause: any = {
        delivery_date: new Date(dateParam),
      };

      if (driverParam) whereClause.driver_name = { contains: driverParam, mode: 'insensitive' };
      if (vehicleParam) whereClause.vehicle_id = vehicleParam;
      if (statusParam) whereClause.status = statusParam;

      const trips = await db.trip.findMany({
        where: whereClause,
        include: {
          vehicle: true,
          stops: {
            include: {
              outlet: true,
            },
            orderBy: {
              stop_sequence: 'asc',
            },
          },
        },
        orderBy: {
          trip_id: 'asc',
        },
      });

      if (trips.length > 0) {
        return NextResponse.json({ success: true, count: trips.length, trips });
      }
    } catch (dbErr) {
      console.warn('DB fetch failed for trips, falling back to mock dataset:', dbErr);
    }

    let filtered = [...SEED_TRIPS];
    if (driverParam) filtered = filtered.filter((t) => t.driver_name.toLowerCase().includes(driverParam.toLowerCase()));
    if (vehicleParam) filtered = filtered.filter((t) => t.vehicle_id === vehicleParam);
    if (statusParam) filtered = filtered.filter((t) => t.status === statusParam);

    return NextResponse.json({ success: true, count: filtered.length, trips: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch trips' }, { status: 500 });
  }
}
