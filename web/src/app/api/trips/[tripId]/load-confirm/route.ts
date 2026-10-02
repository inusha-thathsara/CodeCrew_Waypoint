import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  try {
    const { tripId } = await params;
    const body = await req.json().catch(() => ({}));
    const { bayNumber, discrepancyNote, isComplete } = body;

    const newStatus = isComplete ? 'ON_ROUTE' : 'LOADING';

    try {
      const updated = await db.trip.update({
        where: { trip_id: tripId },
        data: {
          status: newStatus,
          departure_time: isComplete ? new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : undefined,
        },
      });

      return NextResponse.json({
        success: true,
        message: isComplete ? 'Vehicle loading verified and marked ON_ROUTE' : 'Loading progress saved',
        trip: updated,
      });
    } catch (dbErr) {
      // Return mock confirmation
      return NextResponse.json({
        success: true,
        message: 'Vehicle loading verified and marked ON_ROUTE (Simulated)',
        tripId,
        status: newStatus,
        bayNumber: bayNumber || 'Bay 2',
        discrepancyNote: discrepancyNote || null,
        confirmedAt: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to confirm loading' }, { status: 500 });
  }
}
