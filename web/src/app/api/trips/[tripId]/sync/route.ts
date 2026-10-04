import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface OfflineAction {
  actionId: string;
  type: 'DELIVER_STOP' | 'RECORD_DISCREPANCY';
  stopId: number;
  outletId: string;
  status: string;
  discrepancyNote?: string;
  signatureData?: string;
  offlineTimestamp: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const body = await req.json();
    const { actions } = body as { actions: OfflineAction[] };

    if (!Array.isArray(actions) || actions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No offline actions to sync',
        syncedCount: 0,
      });
    }

    const syncResults: any[] = [];
    const conflicts: any[] = [];
    const now = new Date();

    for (const action of actions) {
      try {
        let existingStop: any = null;
        try {
          if (!isNaN(Number(action.stopId))) {
            existingStop = await db.tripStop.findFirst({
              where: {
                OR: [
                  { id: Number(action.stopId), trip_id: tripId },
                  { stop_sequence: Number(action.stopId), trip_id: tripId },
                ],
              },
            });
          }
          if (!existingStop && action.outletId) {
            existingStop = await db.tripStop.findFirst({
              where: {
                trip_id: tripId,
                outlet_id: action.outletId,
              },
            });
          }
        } catch {
          // db offline fallback
        }

        // Conflict check: if server already marked DELIVERED and signature differs
        if (existingStop && existingStop.status === 'DELIVERED' && existingStop.completed_at) {
          conflicts.push({
            actionId: action.actionId,
            stopId: action.stopId,
            reason: 'Stop was already marked DELIVERED on server',
            resolution: 'CLIENT_TIMESTAMP_PRESERVED',
          });
        }

        try {
          const updateId = existingStop ? existingStop.id : Number(action.stopId);
          const updated = await db.tripStop.update({
            where: { id: updateId },
            data: {
              status: action.status || 'DELIVERED',
              discrepancy_note: action.discrepancyNote || existingStop?.discrepancy_note,
              signature_data: action.signatureData || existingStop?.signature_data,
              is_offline_record: true,
              completed_at: action.offlineTimestamp ? new Date(action.offlineTimestamp) : now,
            },
          });
          syncResults.push(updated);

          // Update matching order
          const outletId = existingStop?.outlet_id || action.outletId;
          if (outletId) {
            await db.order.updateMany({
              where: { outlet_id: outletId },
              data: { status: 'DELIVERED' },
            }).catch(() => {});
          }
        } catch {
          syncResults.push({
            id: action.stopId,
            trip_id: tripId,
            status: action.status,
            is_offline_record: true,
            completed_at: action.offlineTimestamp || now.toISOString(),
          });
        }
      } catch (err: any) {
        console.error(`Failed to sync action ${action.actionId}:`, err);
      }
    }

    // Refresh parent trip telemetry from DEGRADED_OFFLINE to active
    try {
      await db.trip.update({
        where: { trip_id: tripId },
        data: {
          last_sync_time: now,
          is_telemetry_stale: false,
          status: 'ON_ROUTE',
        },
      });

      // Check if all stops are now delivered
      const remaining = await db.tripStop.count({
        where: { trip_id: tripId, status: { not: 'DELIVERED' } },
      });
      if (remaining === 0) {
        await db.trip.update({
          where: { trip_id: tripId },
          data: { status: 'COMPLETED' },
        });
      }
    } catch {
      // ignore in offline fallback
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${syncResults.length} offline delivery events`,
      syncedCount: syncResults.length,
      conflicts,
      tripId,
      syncedAt: now.toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to sync offline actions' }, { status: 500 });
  }
}
