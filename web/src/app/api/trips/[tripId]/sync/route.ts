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

interface SyncConflict {
  actionId: string;
  stopId: number | string;
  reason: string;
  resolution: string;
}

interface SyncFailure {
  actionId: string | null;
  stopId: number | string | null;
  reason: string;
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

    const syncResults: { actionId: string; stop: unknown }[] = [];
    const conflicts: SyncConflict[] = [];
    const failed: SyncFailure[] = [];
    const conflictedIds = new Set<string>();
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
          conflictedIds.add(action.actionId);
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
          syncResults.push({ actionId: action.actionId, stop: updated });

          // Update matching order, scoped to this trip's delivery date.
          const outletId = existingStop?.outlet_id || action.outletId;
          if (outletId) {
            const parentTrip = await db.trip
              .findUnique({ where: { trip_id: tripId }, select: { delivery_date: true } })
              .catch(() => null);

            const orderWhere: Record<string, unknown> = { outlet_id: outletId };
            if (parentTrip?.delivery_date) {
              orderWhere.delivery_date = new Date(parentTrip.delivery_date);
            }

            await db.order.updateMany({
              where: orderWhere,
              data: { status: 'DELIVERED' },
            });
          }
        } catch (syncErr) {
          // Not persisted - surface it so the client keeps the action queued.
          failed.push({
            actionId: action.actionId,
            stopId: action.stopId,
            reason: String((syncErr as Error)?.message ?? syncErr),
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
    } catch (telemetryErr) {
      // Telemetry is part of persisting the sync, so surface it rather than
      // reporting a clean sync that never reached the database.
      failed.push({
        actionId: null,
        stopId: null,
        reason: `Trip telemetry update failed: ${String((telemetryErr as Error)?.message ?? telemetryErr)}`,
      });
    }

    const syncedActionIds = syncResults
      .filter((r) => !conflictedIds.has(r.actionId))
      .map((r) => r.actionId);
    const conflictActionIds = conflicts.map((c) => c.actionId);
    const allFailed = failed.length > 0 && syncedActionIds.length === 0;

    return NextResponse.json(
      {
        success: !allFailed,
        message: `Synchronized ${syncedActionIds.length} offline delivery event(s)`,
        syncedCount: syncedActionIds.length,
        syncedActionIds,
        // Client must keep these queued for a human decision.
        conflicts,
        conflictActionIds,
        failed,
        tripId,
        syncedAt: now.toISOString(),
      },
      { status: allFailed ? 500 : 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to sync offline actions' }, { status: 500 });
  }
}
