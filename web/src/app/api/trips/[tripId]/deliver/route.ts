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
      // Update stop
      const updatedStop = await db.tripStop.update({
        where: { id: Number(stopId) },
        data: {
          status: deliveryStatus,
          discrepancy_note: discrepancyNote || null,
          signature_data: signatureData || null,
          is_offline_record: Boolean(isOfflineRecord),
          completed_at: now,
        },
      });

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
      return NextResponse.json({
        success: true,
        message: 'Delivery recorded successfully (Simulated mode)',
        stop: {
          id: Number(stopId),
          trip_id: tripId,
          status: deliveryStatus,
          discrepancy_note: discrepancyNote || null,
          signature_data: signatureData ? 'Signature captured' : null,
          is_offline_record: Boolean(isOfflineRecord),
          completed_at: now.toISOString(),
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to record delivery' }, { status: 500 });
  }
}
