'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Store,
  Plus,
  Package,
  Clock,
  Truck,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Search,
  Check,
  ThermometerSnowflake,
  ShieldCheck,
  Calendar,
  Layers,
  LogOut,
  MapPin,
  RefreshCw,
  PhoneCall,
  UserCheck,
  SlidersHorizontal,
} from 'lucide-react';

interface StoreItem {
  id: string;
  product: string;
  category: 'Chilled' | 'Ambient';
  available: number;
  quantity: number;
}

interface StoreOrder {
  id: string;
  outlet_id: string;
  order_date: string;
  delivery_date: string;
  status: 'On the way' | 'Delivered' | 'Deferred' | 'Submitted' | 'Issue Reported';
  vehicle: string;
  driver: string;
  eta: string;
  delivery_window: string;
  items: {
    product: string;
    expected: number;
    received: number;
    status: string;
  }[];
}

const BRAND_CATALOGS: Record<string, { name: string; category: 'Chilled' | 'Ambient'; available: number }[]> = {
  'Waypoint Fresh': [
    { name: 'Milk', category: 'Chilled', available: 40 },
    { name: 'Yogurt', category: 'Chilled', available: 40 },
    { name: 'Vegetables', category: 'Ambient', available: 40 },
    { name: 'Chilled Chicken', category: 'Chilled', available: 30 },
    { name: 'Eggs Farm Fresh', category: 'Ambient', available: 50 },
    { name: 'Curd Pots (Clay)', category: 'Chilled', available: 25 },
    { name: 'Fresh Carrots', category: 'Ambient', available: 35 },
    { name: 'Nuwara Eliya Strawberries', category: 'Chilled', available: 20 },
  ],
  'Waypoint Style': [
    { name: 'Cotton T-Shirts (Pack of 50)', category: 'Ambient', available: 20 },
    { name: 'Denim Apparel Crate', category: 'Ambient', available: 15 },
    { name: 'Footwear Assortment', category: 'Ambient', available: 25 },
    { name: 'Textile Fabric Rolls', category: 'Ambient', available: 10 },
  ],
  'Waypoint Tech': [
    { name: 'Fast Charger Accessories', category: 'Ambient', available: 30 },
    { name: 'Smart Power Banks (Bulk)', category: 'Ambient', available: 25 },
    { name: 'Wireless Headsets', category: 'Ambient', available: 20 },
    { name: 'LED Display Panels', category: 'Ambient', available: 15 },
  ],
};

const STORES_LIST = [
  { id: 'OUT077', name: 'OUT077 : Kandy Fresh (Katugastota)', brand: 'Waypoint Fresh', district: 'Kandy', delivery_window: '5.30 AM - 8.00 AM' },
  { id: 'OUT076', name: 'OUT076 : Kandy Fresh (Peradeniya)', brand: 'Waypoint Fresh', district: 'Kandy', delivery_window: '6.00 AM - 8.00 AM' },
  { id: 'OUT080', name: 'OUT080 : Kadugannawa Outlet', brand: 'Waypoint Fresh', district: 'Kandy', delivery_window: '5.00 AM - 7.30 AM' },
  { id: 'OUT002', name: 'OUT002 : Pannipitiya Central', brand: 'Waypoint Fresh', district: 'Colombo', delivery_window: '6.30 AM - 8.30 AM' },
  { id: 'OUT015', name: 'OUT015 : Galle Fort Lifestyle', brand: 'Waypoint Style', district: 'Galle', delivery_window: '9.00 AM - 12.00 PM' },
  { id: 'OUT022', name: 'OUT022 : Colombo Tech Hub', brand: 'Waypoint Tech', district: 'Colombo', delivery_window: '10.00 AM - 2.00 PM' },
];

export default function StoreManagerPage() {
  const router = useRouter();

  // Navigation states
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'orders' | 'deliveries' | 'issues'>('dashboard');
  const [viewState, setViewState] = useState<
    'dashboard' | 'place-order' | 'review-order' | 'order-submitted' | 'order-tracking' | 'receive-delivery' | 'report-issue' | 'issue-submitted'
  >('dashboard');

  const [currentStore, setCurrentStore] = useState(STORES_LIST[0]);
  const [showStoreSelector, setShowStoreSelector] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<StoreOrder[]>([
    {
      id: 'WF-1043',
      outlet_id: 'OUT077',
      order_date: '27 Sep 2026',
      delivery_date: '28 Sep 2026',
      status: 'On the way',
      vehicle: 'VEH057 (Reefer Van 1.5T)',
      driver: 'Kasun Bandara (077-492104)',
      eta: '7:12 AM',
      delivery_window: '5.30 AM - 8.00 AM',
      items: [
        { product: 'Milk', expected: 18, received: 15, status: 'Shortfall Flagged (3 units)' },
        { product: 'Yogurt', expected: 10, received: 10, status: 'Verified' },
        { product: 'Vegetables', expected: 8, received: 8, status: 'Verified' },
        { product: 'Chilled Chicken', expected: 4, received: 4, status: 'Verified' },
      ],
    },
    {
      id: 'WF-1031',
      outlet_id: 'OUT077',
      order_date: '26 Sep 2026',
      delivery_date: '28 Sep 2026',
      status: 'Deferred',
      vehicle: 'VEH019 (Afternoon Trip #2)',
      driver: 'Dhammika Silva',
      eta: '2:30 PM',
      delivery_window: '2.00 PM - 4.00 PM',
      items: [
        { product: 'Eggs Farm Fresh', expected: 8, received: 0, status: 'Deferred (Fleet Limit)' },
        { product: 'Vegetables', expected: 4, received: 0, status: 'Deferred (Fleet Limit)' },
      ],
    },
    {
      id: 'WF-1020',
      outlet_id: 'OUT077',
      order_date: '25 Sep 2026',
      delivery_date: '26 Sep 2026',
      status: 'Delivered',
      vehicle: 'VEH039 (10T Truck)',
      driver: 'Nimal Gamage',
      eta: 'Completed 6:45 AM',
      delivery_window: '5.30 AM - 8.00 AM',
      items: [
        { product: 'Milk', expected: 20, received: 20, status: 'Delivered Full' },
        { product: 'Yogurt', expected: 15, received: 15, status: 'Delivered Full' },
      ],
    },
  ]);

  // Selected Order / Draft
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder>(orders[0]);
  const [draftItems, setDraftItems] = useState<StoreItem[]>([
    { id: '1', product: 'Milk', category: 'Chilled', available: 40, quantity: 18 },
    { id: '2', product: 'Yogurt', category: 'Chilled', available: 40, quantity: 10 },
    { id: '3', product: 'Vegetables', category: 'Ambient', available: 40, quantity: 8 },
    { id: '4', product: 'Chilled Chicken', category: 'Chilled', available: 30, quantity: 4 },
  ]);

  const [deliveryWindow, setDeliveryWindow] = useState('5.30 AM - 8.00 AM');
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState('2026-09-29');

  // Issues State
  const [issues, setIssues] = useState([
    {
      ticket_id: 'ISSUE-077-01',
      order_id: 'WF-1043',
      product: 'Milk (20L Crate)',
      expected_qty: 18,
      received_qty: 15,
      variance: -3,
      root_cause: 'Shortfall at Central Cold Room (Advance alert issued by Bay 04)',
      status: 'Credit Note Pending',
    },
  ]);

  const [issueForm, setIssueForm] = useState({
    order_id: 'WF-1043',
    product: 'Highland Fresh Milk (20L)',
    expected_qty: 18,
    received_qty: 15,
    root_cause: 'Crushed carton / liquid leakage at loading dock',
    notes: 'Driver confirmed 3 crates damaged prior to dispatch. Advance credit requested.',
  });

  const handleLogout = () => {
    localStorage.removeItem('waypoint_token');
    localStorage.removeItem('waypoint_user');
    router.push('/');
  };

  const celebrateSuccess = () => {
    confetti({
      particleCount: 75,
      spread: 65,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6'],
    });
  };

  // Synchronize orders and live delivery telemetry from backend
  const fetchStoreData = async () => {
    try {
      const tripsRes = await fetch('/api/trips?date=2026-09-28').then((r) => r.json()).catch(() => null);

      if (tripsRes?.trips?.length > 0) {
        const matchedTrip = tripsRes.trips.find((t: any) =>
          t.stops?.some((s: any) => s.outlet_id === currentStore.id)
        );
        if (matchedTrip) {
          const matchedStop = matchedTrip.stops.find((s: any) => s.outlet_id === currentStore.id);
          const isDelivered = matchedStop?.status === 'DELIVERED';

          setOrders((prev) =>
            prev.map((ord) => {
              if (ord.id === 'WF-1043') {
                return {
                  ...ord,
                  status: isDelivered ? 'Delivered' : matchedTrip.status === 'COMPLETED' ? 'Delivered' : 'On the way',
                  eta: isDelivered
                    ? matchedStop?.completed_at
                      ? `Delivered at ${new Date(matchedStop.completed_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
                      : 'Completed 7:28 AM'
                    : '7:12 AM',
                  driver: `${matchedTrip.driver_name} (077-492104)`,
                  vehicle: `${matchedTrip.vehicle_id} (Reefer Van 1.5T)`,
                };
              }
              return ord;
            })
          );
        }
      }
    } catch (e) {
      console.warn('Store manager backend sync check failed:', e);
    }
  };

  useEffect(() => {
    fetchStoreData();
    const interval = setInterval(fetchStoreData, 8000);
    return () => clearInterval(interval);
  }, [currentStore.id]);

  const handlePlaceOrderSubmit = async () => {
    const totalCrates = draftItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const newOrderId = `WF-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: StoreOrder = {
      id: newOrderId,
      outlet_id: currentStore.id,
      order_date: 'Today (Prior to 4:00 PM Cutoff)',
      delivery_date: requestedDeliveryDate,
      status: 'Submitted',
      vehicle: 'Pending Fleet Allocation',
      driver: 'Assigned on Dispatch Run',
      eta: 'Next Morning 6:00 AM - 8:00 AM',
      delivery_window: deliveryWindow,
      items: draftItems.map((i) => ({
        product: i.product,
        expected: i.quantity,
        received: i.quantity,
        status: 'Scheduled',
      })),
    };

    setOrders([newOrder, ...orders]);
    setSelectedOrder(newOrder);
    celebrateSuccess();
    setViewState('order-submitted');

    // Persist to backend API
    try {
      const brandClean = currentStore.brand.includes('Fresh') ? 'Fresh' : currentStore.brand.includes('Style') ? 'Style' : 'Tech';
      const weightEst = Math.max(50, Math.round(totalCrates * 17.5));
      const volEst = Math.max(0.3, Math.round(totalCrates * 0.08 * 10) / 10);
      const isChilled = draftItems.some((i) => i.category === 'Chilled' && i.quantity > 0);

      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlet_id: currentStore.id,
          delivery_date: requestedDeliveryDate,
          brand: brandClean,
          weight_kg: weightEst,
          volume_m3: volEst,
          crate_count: totalCrates,
          requires_chilled: isChilled,
          enforceCutoff: false,
        }),
      });
    } catch (apiErr) {
      console.warn('Order submission API persist error:', apiErr);
    }
  };

  const handleConfirmDeliveryReceipt = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Delivered', eta: 'Completed Just Now' } : o))
    );
    celebrateSuccess();
    alert(`Order ${orderId} receipt successfully confirmed. POD chain-of-custody recorded in ERP.`);
    setViewState('dashboard');
    setCurrentTab('dashboard');
  };

  const handleReportIssueSubmit = () => {
    const newIssue = {
      ticket_id: `ISSUE-077-${Math.floor(10 + Math.random() * 90)}`,
      order_id: issueForm.order_id,
      product: issueForm.product,
      expected_qty: issueForm.expected_qty,
      received_qty: issueForm.received_qty,
      variance: issueForm.received_qty - issueForm.expected_qty,
      root_cause: issueForm.root_cause,
      status: 'Under Review by Dispatcher',
    };

    setIssues([newIssue, ...issues]);
    celebrateSuccess();
    setViewState('issue-submitted');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Application Header */}
      <header className="w-full bg-[#0B0F19] text-white border-b border-[#2E3A52] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          {/* Brand & Store Selector */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-purple-600 group-hover:bg-purple-500 text-white rounded-xl shadow-xs transition-colors">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-wider text-white">WAYPOINT</span>
                <span className="text-[11px] text-purple-400 font-bold ml-1.5 px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 hidden sm:inline-block">
                  Store Portal
                </span>
              </div>
            </Link>

            {/* Active Outlet Switcher */}
            <button
              onClick={() => setShowStoreSelector(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#161E2E] hover:bg-[#1E293B] border border-[#2E3A52] rounded-xl text-xs font-semibold text-slate-200 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              <span className="truncate max-w-[200px]">{currentStore.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Navigation Tabs (Desktop) */}
          <div className="hidden md:flex items-center gap-1 bg-[#161E2E] p-1 rounded-xl border border-[#2E3A52]">
            <button
              onClick={() => {
                setCurrentTab('dashboard');
                setViewState('dashboard');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => {
                setCurrentTab('orders');
                setViewState('place-order');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'orders'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Place Order
            </button>
            <button
              onClick={() => {
                setCurrentTab('deliveries');
                setViewState('order-tracking');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'deliveries'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Track Deliveries
            </button>
            <button
              onClick={() => {
                setCurrentTab('issues');
                setViewState('report-issue');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentTab === 'issues'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Report Issue
            </button>
          </div>

          {/* User Session */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="hidden lg:flex items-center gap-2">
              <span>Manager:</span>
              <strong className="text-white">Aravinda Silva</strong>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors ml-1"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: STORE DASHBOARD */}
        {viewState === 'dashboard' && (
          <div className="space-y-6">
            {/* Cutoff Notice Banner */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-purple-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span className="font-extrabold text-sm sm:text-base">
                    Daily Manifest Cutoff: Today at 4:00 PM
                  </span>
                </div>
                <p className="text-xs text-purple-200">
                  Place tomorrow&apos;s perishable orders before 4:00 PM for automated fleet allocation and 05:30 AM early store delivery.
                </p>
              </div>

              <button
                onClick={() => {
                  setViewState('place-order');
                  setCurrentTab('orders');
                }}
                className="px-4 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Place New Order</span>
              </button>
            </div>

            {/* 4 KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-black text-purple-600">
                  {orders.filter((o) => o.status === 'On the way' || o.status === 'Submitted').length} Orders
                </div>
                <div className="text-xs text-slate-500 font-semibold mt-1">Active Pipeline</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-black text-emerald-600">98.2%</div>
                <div className="text-xs text-slate-500 font-semibold mt-1">On-Time Window SLA</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-black text-blue-600">40 Crates</div>
                <div className="text-xs text-slate-500 font-semibold mt-1">Incoming Morning Drop</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-2xl font-black text-amber-600">{issues.length} Ticket</div>
                <div className="text-xs text-slate-500 font-semibold mt-1">Variance Logged</div>
              </div>
            </div>

            {/* Active Orders List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Store Deliveries & Order Pipeline
                  </h3>
                  <p className="text-xs text-slate-500">Live manifest synchronization with Peliyagoda & Kandy Depots</p>
                </div>

                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {currentStore.brand}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {orders.map((ord) => (
                  <div key={ord.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-sm text-slate-900">{ord.id}</span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                            ord.status === 'On the way'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : ord.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : ord.status === 'Deferred'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                        <span>Window: <strong>{ord.delivery_window}</strong></span>
                        <span>Vehicle: <strong>{ord.vehicle}</strong></span>
                        <span>Driver: <strong>{ord.driver}</strong></span>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        Items: {ord.items.map((i) => `${i.product} (${i.expected})`).join(', ')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end md:self-auto">
                      {ord.status === 'On the way' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setViewState('order-tracking');
                              setCurrentTab('deliveries');
                            }}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Track ETA ({ord.eta})</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedOrder(ord);
                              setViewState('receive-delivery');
                              setCurrentTab('deliveries');
                            }}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Receive</span>
                          </button>
                        </>
                      )}

                      {ord.status === 'Delivered' && (
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setViewState('report-issue');
                            setCurrentTab('issues');
                          }}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors"
                        >
                          Report Discrepancy
                        </button>
                      )}

                      {ord.status === 'Deferred' && (
                        <button
                          onClick={() => {
                            setSelectedOrder(ord);
                            setViewState('order-tracking');
                            setCurrentTab('deliveries');
                          }}
                          className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition-colors"
                        >
                          View Re-allocation
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: PLACE ORDER */}
        {viewState === 'place-order' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-xl text-slate-900">Place Daily Store Order</h2>
                <p className="text-xs text-slate-500">
                  Outlet: <strong>{currentStore.name}</strong> • Guaranteed delivery for next morning
                </p>
              </div>

              <button
                onClick={() => {
                  setViewState('dashboard');
                  setCurrentTab('dashboard');
                }}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg border border-slate-300"
              >
                Cancel
              </button>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
              {/* Delivery Schedule Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Requested Delivery Date:
                  </label>
                  <input
                    type="date"
                    value={requestedDeliveryDate}
                    onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Preferred Store Delivery Window:
                  </label>
                  <select
                    value={deliveryWindow}
                    onChange={(e) => setDeliveryWindow(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-blue-500"
                  >
                    <option value="5.30 AM - 8.00 AM">5.30 AM - 8.00 AM (Early Fresh Run)</option>
                    <option value="6.00 AM - 8.30 AM">6.00 AM - 8.30 AM (Standard Morning)</option>
                    <option value="2.00 PM - 4.30 PM">2.00 PM - 4.30 PM (Afternoon Shuttle)</option>
                  </select>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                    Perishable Products & Crate Quantities
                  </h4>
                  <span className="text-xs text-slate-500">
                    Total: <strong className="text-purple-600">{draftItems.reduce((acc, curr) => acc + curr.quantity, 0)} Crates</strong>
                  </span>
                </div>

                <div className="space-y-2">
                  {draftItems.map((item) => (
                    <div key={item.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-sm text-slate-900">{item.product}</div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.category === 'Chilled' ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {item.category === 'Chilled' ? '❄️ Reefer Required' : 'Ambient Cargo'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setDraftItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))
                            )
                          }
                          className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-sm text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >
                          -
                        </button>
                        <span className="font-mono font-extrabold text-base text-slate-900 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setDraftItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))
                            )
                          }
                          className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-sm text-slate-700 flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Submission CTA */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Ready to submit for automated fleet capacity allocation
                </span>

                <button
                  onClick={handlePlaceOrderSubmit}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                >
                  <span>Submit Manifest Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ORDER SUBMITTED SUCCESS */}
        {viewState === 'order-submitted' && (
          <div className="max-w-xl mx-auto py-12 text-center space-y-5">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">Order Successfully Confirmed!</h2>
              <p className="text-xs text-slate-600">
                Order ID: <strong className="text-slate-900 font-mono text-sm">{selectedOrder.id}</strong> • Transmitted to Central Dispatcher
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2 text-left">
              <div className="flex justify-between border-b pb-2 border-slate-100">
                <span>Outlet Scope:</span>
                <strong>{currentStore.name}</strong>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-100">
                <span>Target Delivery Window:</span>
                <strong>{selectedOrder.delivery_window}</strong>
              </div>
              <div className="flex justify-between border-b pb-2 border-slate-100">
                <span>Total Crate Target:</span>
                <strong className="text-purple-600">{selectedOrder.items.reduce((acc, curr) => acc + curr.expected, 0)} Crates</strong>
              </div>
              <div className="flex justify-between">
                <span>Allocation Engine Status:</span>
                <strong className="text-emerald-600">Queued for Kandy Fleet Staging</strong>
              </div>
            </div>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  setViewState('order-tracking');
                  setCurrentTab('deliveries');
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Track Live Order
              </button>
              <button
                onClick={() => {
                  setViewState('dashboard');
                  setCurrentTab('dashboard');
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-all cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: ORDER TRACKING */}
        {viewState === 'order-tracking' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-xl text-slate-900">Live Delivery Tracking</h2>
                <p className="text-xs text-slate-500">
                  Order <strong>{selectedOrder.id}</strong> • En Route to {currentStore.name}
                </p>
              </div>

              <button
                onClick={() => {
                  setViewState('dashboard');
                  setCurrentTab('dashboard');
                }}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg border border-slate-300"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Stepper Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-slate-100">
                <div>
                  <span className="text-xs text-slate-500 block">ESTIMATED TIME OF ARRIVAL</span>
                  <span className="text-2xl font-black text-blue-600">{selectedOrder.eta}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">ASSIGNED REEFER FLEET</span>
                  <span className="text-sm font-bold text-slate-900">{selectedOrder.vehicle}</span>
                </div>
              </div>

              {/* 5-Step Fulfillment Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 font-bold block">1. Confirmed</span>
                  <span className="text-[10px] text-emerald-600">04:00 PM (Yesterday)</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 font-bold block">2. Bay 04 Loaded</span>
                  <span className="text-[10px] text-emerald-600">05:08 AM (LIFO Pass)</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-emerald-700 font-bold block">3. Gate Cleared</span>
                  <span className="text-[10px] text-emerald-600">05:15 AM (QR Seal)</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 animate-pulse">
                  <span className="text-blue-700 font-bold block">4. En Route</span>
                  <span className="text-[10px] text-blue-600">Kasun Bandara</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 opacity-60">
                  <span className="text-slate-700 font-bold block">5. Store Delivery</span>
                  <span className="text-[10px] text-slate-500">Scheduled 7:12 AM</span>
                </div>
              </div>

              {/* Telemetry Status Box */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                    <ThermometerSnowflake className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Chamber Telemetry: +3.4°C Stable</div>
                    <div className="text-xs text-slate-400">Cold chain verified • 0 breaches across Kandy corridor</div>
                  </div>
                </div>

                <button
                  onClick={() => setViewState('receive-delivery')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] self-start sm:self-auto cursor-pointer"
                >
                  Receive & Verify Delivery
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: RECEIVE DELIVERY (POD Verification) */}
        {viewState === 'receive-delivery' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-xl text-slate-900">Receive Delivery & Verify Crates</h2>
                <p className="text-xs text-slate-500">
                  Order <strong>{selectedOrder.id}</strong> • Driver <strong>{selectedOrder.driver}</strong>
                </p>
              </div>

              <button
                onClick={() => setViewState('dashboard')}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg border border-slate-300"
              >
                Cancel
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">
                  Crate Physical Verification Checkoff
                </h4>

                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                      <div>
                        <strong className="text-sm text-slate-900">{item.product}</strong>
                        <div className="text-xs text-slate-500">Status: {item.status}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block">EXPECTED / RECEIVED</span>
                          <span className="font-mono font-bold text-xs text-slate-900">
                            {item.expected} / <strong className="text-emerald-600">{item.received}</strong>
                          </span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plastic Crate Return Section */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                <div>
                  <strong className="text-xs text-blue-900 block">Empty Plastic Crate Returns:</strong>
                  <span className="text-[11px] text-blue-700">Empty crates handed back to Driver Kasun for DC return</span>
                </div>
                <span className="font-mono font-black text-lg text-blue-900">38 Crates</span>
              </div>

              {/* Sign-off CTA */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={() => {
                    setViewState('report-issue');
                    setCurrentTab('issues');
                  }}
                  className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 transition-colors"
                >
                  Flag Shortfall / Discrepancy
                </button>

                <button
                  onClick={() => handleConfirmDeliveryReceipt(selectedOrder.id)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirm Receipt & Sign POD Manifest</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: REPORT ISSUE */}
        {viewState === 'report-issue' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-xl text-slate-900">Report Crate Discrepancy / Shortfall</h2>
                <p className="text-xs text-slate-500">Order: <strong>{issueForm.order_id}</strong> • Automatic ERP adjustment</p>
              </div>

              <button
                onClick={() => setViewState('dashboard')}
                className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold rounded-lg border border-slate-300"
              >
                Cancel
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Impacted SKU / Product:</label>
                <input
                  type="text"
                  value={issueForm.product}
                  onChange={(e) => setIssueForm({ ...issueForm, product: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Expected Crates:</label>
                  <input
                    type="number"
                    value={issueForm.expected_qty}
                    onChange={(e) => setIssueForm({ ...issueForm, expected_qty: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Physically Received:</label>
                  <input
                    type="number"
                    value={issueForm.received_qty}
                    onChange={(e) => setIssueForm({ ...issueForm, received_qty: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Root Cause / Defect Type:</label>
                <select
                  value={issueForm.root_cause}
                  onChange={(e) => setIssueForm({ ...issueForm, root_cause: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                >
                  <option value="Crushed carton / liquid leakage at loading dock">Crushed carton / liquid leakage at loading dock</option>
                  <option value="Cold room inventory stockout at warehouse">Cold room inventory stockout at warehouse</option>
                  <option value="Temperature breach above +4.0C threshold">Temperature breach above +4.0°C threshold</option>
                  <option value="Incorrect outlet mislabeling">Incorrect outlet mislabeling</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Additional Observations / Notes:</label>
                <textarea
                  rows={3}
                  value={issueForm.notes}
                  onChange={(e) => setIssueForm({ ...issueForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleReportIssueSubmit}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  Submit Discrepancy Ticket
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 7: ISSUE SUBMITTED SUCCESS */}
        {viewState === 'issue-submitted' && (
          <div className="max-w-xl mx-auto py-12 text-center space-y-5">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900">Discrepancy Ticket Logged</h2>
              <p className="text-xs text-slate-600">
                Ticket #ISSUE-2026-9921 • Synced with Central Dispatcher & ERP Billing
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
              An automated credit note will be issued against invoice #INV-8820 for the 3 missing Milk crates. The replacement stock has been scheduled for the afternoon shuttle.
            </p>

            <button
              onClick={() => {
                setViewState('dashboard');
                setCurrentTab('dashboard');
              }}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </main>

      {/* Outlet Selector Modal */}
      {showStoreSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">Switch Store Outlet</h3>
              <button
                onClick={() => setShowStoreSelector(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {STORES_LIST.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setCurrentStore(st);
                    setShowStoreSelector(false);
                  }}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                    currentStore.id === st.id
                      ? 'border-purple-500 bg-purple-50/70 text-purple-900 font-bold'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-slate-900">{st.name}</div>
                    <div className="text-[11px] text-slate-500">{st.district} • Window: {st.delivery_window}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                    {st.brand}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
