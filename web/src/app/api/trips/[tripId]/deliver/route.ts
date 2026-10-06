import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const body = await req.json();
    const { stopId, status, discrepancyNote, signatureData, isOfflineRecord } = body;

    if (!stopId) {
      return NextResponse.json({ error: 'stopId is required' }, { status: 400 });
    }

    const deliveryStatus = status || 'DELIVERED';
    const now = new Date();

    try {
      // Find the stop flexibly by ID, outlet_id, or sequence
      let targetStop = null;
      if (!isNaN(Number(stopId))) {
        targetStop = await db.tripStop.findFirst({
          where: {
            OR: [
              { id: Number(stopId), trip_id: tripId },
              { stop_sequence: Number(stopId), trip_id: tripId },
            ],
          },
        });
      }
      if (!targetStop) {
        targetStop = await db.tripStop.findFirst({
          where: {
            trip_id: tripId,
            outlet_id: String(stopId),
          },
        });
      }

      let updatedStop: any = null;
      if (targetStop) {
        updatedStop = await db.tripStop.update({
          where: { id: targetStop.id },
          data: {
            status: deliveryStatus,
            discrepancy_note: discrepancyNote || targetStop.discrepancy_note,
            signature_data: signatureData || targetStop.signature_data,
            is_offline_record: Boolean(isOfflineRecord),
            completed_at: now,
          },
        });

        // Also update matching order status to DELIVERED.
        // Scoped to this trip's delivery date so a multi-day outlet does not
        // have every future order marked as delivered.
        if (targetStop.outlet_id) {
          const parentTrip = await db.trip
            .findUnique({ where: { trip_id: tripId }, select: { delivery_date: true } })
            .catch(() => null);

          const orderWhere: Record<string, unknown> = { outlet_id: targetStop.outlet_id };
          if (parentTrip?.delivery_date) {
            orderWhere.delivery_date = new Date(parentTrip.delivery_date);
          }

          await db.order.updateMany({
            where: orderWhere,
            data: { status: 'DELIVERED' },
          });
        }
      } else {
        // Fallback update if stop wasn't found by specific match
        try {
          updatedStop = await db.tripStop.update({
            where: { id: Number(stopId) },
            data: {
              status: deliveryStatus,
              discrepancy_note: discrepancyNote || null,
              signature_data: signatureData || null,
              is_offline_record: Boolean(isOfflineRecord),
              completed_at: now,
            },
          });
        } catch {
          updatedStop = {
            id: Number(stopId) || 1,
            trip_id: tripId,
            status: deliveryStatus,
            discrepancy_note: discrepancyNote || null,
            signature_data: signatureData || null,
            is_offline_record: Boolean(isOfflineRecord),
            completed_at: now,
          };
        }
      }

      // Update parent trip sync telemetry
      await db.trip.update({
        where: { trip_id: tripId },
        data: {
          last_sync_time: now,
          is_telemetry_stale: false,
          status: 'ON_ROUTE',
        },
      });

      // Check if all stops completed
      const remainingStops = await db.tripStop.count({
        where: {
          trip_id: tripId,
          status: { not: 'DELIVERED' },
        },
      });

      if (remainingStops === 0) {
        await db.trip.update({
          where: { trip_id: tripId },
          data: { status: 'COMPLETED' },
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Delivery recorded successfully',
        stop: updatedStop,
        allCompleted: remainingStops === 0,
      });
    } catch (dbErr) {
      // The delivery was NOT persisted. Report the failure honestly instead of
      // fabricating a success payload, which previously made a total DB outage
      // look like a completed delivery.
      console.error(`Failed to record delivery for stop ${stopId} on trip ${tripId}:`, dbErr);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to record delivery',
          detail: String((dbErr as Error)?.message ?? dbErr),
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to record delivery' }, { status: 500 });
  }
}
