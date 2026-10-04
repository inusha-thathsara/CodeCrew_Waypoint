import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionFromRequest } from '@/lib/auth';

// Fallback seed orders for simulated date 2026-09-28 if DB is offline
const SEED_ORDERS = [
  {
    order_id: 'WF-1043-1',
    outlet_id: 'OUT077',
    delivery_date: '2026-09-28',
    brand: 'Fresh',
    weight_kg: 320,
    volume_m3: 1.4,
    crate_count: 18,
    requires_chilled: true,
    status: 'PLANNED',
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
    order_id: 'WF-1043-2',
    outlet_id: 'OUT079',
    delivery_date: '2026-09-28',
    brand: 'Fresh',
    weight_kg: 280,
    volume_m3: 1.2,
    crate_count: 15,
    requires_chilled: true,
    status: 'PLANNED',
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
    order_id: 'WF-1043-3',
    outlet_id: 'OUT080',
    delivery_date: '2026-09-28',
    brand: 'Fresh',
    weight_kg: 265,
    volume_m3: 1.1,
    crate_count: 14,
    requires_chilled: true,
    status: 'PLANNED',
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
  {
    order_id: 'WF-1044-1',
    outlet_id: 'OUT084',
    delivery_date: '2026-09-28',
    brand: 'Fresh',
    weight_kg: 450,
    volume_m3: 1.8,
    crate_count: 22,
    requires_chilled: true,
    status: 'PLANNED',
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
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const statusParam = searchParams.get('status');
    const brandParam = searchParams.get('brand');
    const outletParam = searchParams.get('outlet_id');

    try {
      const whereClause: any = {};

      if (dateParam && dateParam !== 'all') {
        const d = new Date(dateParam);
        const startOfDay = new Date(d);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(d);
        endOfDay.setUTCHours(23, 59, 59, 999);
        whereClause.delivery_date = {
          gte: startOfDay,
          lte: endOfDay,
        };
      } else if (!outletParam) {
        // Default to simulated date if neither date nor outlet was specified
        const d = new Date('2026-09-28');
        const startOfDay = new Date(d);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(d);
        endOfDay.setUTCHours(23, 59, 59, 999);
        whereClause.delivery_date = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }

      if (statusParam) whereClause.status = statusParam;
      if (brandParam) whereClause.brand = brandParam;
      if (outletParam) whereClause.outlet_id = outletParam;

      const orders = await db.order.findMany({
        where: whereClause,
        include: {
          outlet: true,
        },
        orderBy: {
          order_id: 'asc',
        },
      });

      if (orders.length > 0) {
        return NextResponse.json({ success: true, count: orders.length, orders });
      }
    } catch (dbErr) {
      console.warn('DB fetch failed for orders, using mock fallback:', dbErr);
    }

    // Filter fallback
    let filtered = [...SEED_ORDERS];
    if (statusParam) filtered = filtered.filter((o) => o.status === statusParam);
    if (brandParam) filtered = filtered.filter((o) => o.brand === brandParam);
    if (outletParam) filtered = filtered.filter((o) => o.outlet_id === outletParam);

    return NextResponse.json({ success: true, count: filtered.length, orders: filtered });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { outlet_id, delivery_date, brand, weight_kg, volume_m3, crate_count, requires_chilled } = body;

    if (!outlet_id || !delivery_date || !brand || !weight_kg || !volume_m3 || !crate_count) {
      return NextResponse.json(
        { error: 'Missing required order fields: outlet_id, delivery_date, brand, weight_kg, volume_m3, crate_count' },
        { status: 400 }
      );
    }

    // Cutoff check: In production / simulation, verify if current time is before 16:00
    const now = new Date();
    const hours = now.getHours();
    const isPastCutoff = hours >= 16; // 4:00 PM cutoff rule
    const isEnforced = body.enforceCutoff === true;

    if (isEnforced && isPastCutoff) {
      return NextResponse.json(
        { error: 'Order submission rejected: Past 16:00 (4:00 PM) daily cutoff constraint.' },
        { status: 422 }
      );
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}-${outlet_id}`;

    try {
      const newOrder = await db.order.create({
        data: {
          order_id: orderId,
          outlet_id,
          delivery_date: new Date(delivery_date),
          brand,
          weight_kg: Number(weight_kg),
          volume_m3: Number(volume_m3),
          crate_count: Number(crate_count),
          requires_chilled: Boolean(requires_chilled),
          status: 'CONFIRMED',
        },
      });

      return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
    } catch (dbErr) {
      // Mock creation return
      const created = {
        order_id: orderId,
        outlet_id,
        delivery_date,
        brand,
        weight_kg,
        volume_m3,
        crate_count,
        requires_chilled,
        status: 'CONFIRMED',
        created_at: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, order: created }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create order' }, { status: 500 });
  }
}
