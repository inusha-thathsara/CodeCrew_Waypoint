import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;

    let trip: any = null;

    try {
      trip = await db.trip.findUnique({
        where: { trip_id: tripId },
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
      });
    } catch (dbErr) {
      console.warn('DB error fetching trip detail, using mock fallback:', dbErr);
    }

    if (!trip) {
      // Mock lookup
      if (tripId === 'TRIP-WF-1043') {
        trip = {
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
        };
      } else {
        return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }
    }

    // Compute reverse LIFO loading plan for Warehouse Loaders
    // Last stop delivery = First loaded into vehicle (Deepest in truck)
    // First stop delivery = Last loaded into vehicle (Near rear doors)
    const lifoManifest = [...trip.stops]
      .sort((a: any, b: any) => b.stop_sequence - a.stop_sequence)
      .map((stop: any, index: number) => ({
        loading_step: index + 1,
        position: index === 0 ? 'FRONT (Deepest)' : index === trip.stops.length - 1 ? 'REAR (Door)' : 'MIDDLE',
        stop_sequence: stop.stop_sequence,
        outlet_id: stop.outlet_id,
        outlet_name: `${stop.outlet?.brand || 'Outlet'} ${stop.outlet_id} (${stop.outlet?.district || ''})`,
        dock_type: stop.outlet?.dock_type,
        eta_window: `${stop.eta_start} - ${stop.eta_end}`,
        status: stop.status,
      }));

    return NextResponse.json({
      success: true,
      trip: {
        ...trip,
        lifo_manifest: lifoManifest,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch trip detail' }, { status: 500 });
  }
}
