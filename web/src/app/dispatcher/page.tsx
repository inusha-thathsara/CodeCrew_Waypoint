'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Truck,
  ShieldCheck,
  Package,
  Clock,
  ThermometerSnowflake,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  MapPin,
  ChevronRight,
  Layers,
  Calendar,
  Zap,
  Search,
  Check,
  SlidersHorizontal,
  ChevronDown,
  Navigation,
  PhoneCall,
  FileText,
  ArrowRight,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface OrderItem {
  id: string;
  brand: 'Waypoint Fresh' | 'Waypoint Style' | 'Waypoint Tech';
  outletId: string;
  outletName: string;
  district: string;
  deliveryWindow: string;
  weightKg: number;
  volumeM3: number;
  crates: number;
  temp: 'Chilled (Reefer)' | 'Ambient';
  status: 'Ready for Allocation' | 'Planned' | 'Cutoff Passed';
  selected?: boolean;
}

const INITIAL_ORDERS: OrderItem[] = [
  { id: 'ORD-1043-A', brand: 'Waypoint Fresh', outletId: 'OUT077', outletName: 'Kandy Fresh (Katugastota)', district: 'Kandy', deliveryWindow: '5:30 AM - 8:00 AM', weightKg: 380, volumeM3: 2.5, crates: 15, temp: 'Chilled (Reefer)', status: 'Ready for Allocation' },
  { id: 'ORD-1043-B', brand: 'Waypoint Fresh', outletId: 'OUT079', outletName: 'Kandy Fresh (William Gopallawa)', district: 'Kandy', deliveryWindow: '4:00 AM - 7:45 AM', weightKg: 310, volumeM3: 2.1, crates: 15, temp: 'Chilled (Reefer)', status: 'Ready for Allocation' },
  { id: 'ORD-1043-C', brand: 'Waypoint Fresh', outletId: 'OUT080', outletName: 'Kadugannawa Outlet', district: 'Kandy', deliveryWindow: '5:00 AM - 7:30 AM', weightKg: 190, volumeM3: 1.3, crates: 14, temp: 'Chilled (Reefer)', status: 'Ready for Allocation' },
  { id: 'ORD-1044-A', brand: 'Waypoint Fresh', outletId: 'OUT076', outletName: 'Kandy Fresh (Peradeniya)', district: 'Kandy', deliveryWindow: '6:00 AM - 8:30 AM', weightKg: 490, volumeM3: 3.6, crates: 20, temp: 'Ambient', status: 'Ready for Allocation' },
  { id: 'ORD-1044-B', brand: 'Waypoint Style', outletId: 'OUT082', outletName: 'Gampola Town Hub', district: 'Kandy', deliveryWindow: '7:00 AM - 9:30 AM', weightKg: 460, volumeM3: 3.6, crates: 18, temp: 'Ambient', status: 'Ready for Allocation' },
  { id: 'ORD-1045-A', brand: 'Waypoint Fresh', outletId: 'OUT002', outletName: 'Pannipitiya Central', district: 'Colombo', deliveryWindow: '5:00 AM - 8:00 AM', weightKg: 2600, volumeM3: 12.0, crates: 90, temp: 'Chilled (Reefer)', status: 'Ready for Allocation' },
  { id: 'ORD-1045-B', brand: 'Waypoint Tech', outletId: 'OUT005', outletName: 'Maharagama Express', district: 'Colombo', deliveryWindow: '6:30 AM - 9:00 AM', weightKg: 2600, volumeM3: 12.1, crates: 90, temp: 'Ambient', status: 'Ready for Allocation' },
  { id: 'ORD-1046-A', brand: 'Waypoint Style', outletId: 'OUT015', outletName: 'Galle Fort Lifestyle', district: 'Galle', deliveryWindow: '9:00 AM - 12:00 PM', weightKg: 350, volumeM3: 2.8, crates: 12, temp: 'Ambient', status: 'Ready for Allocation' },
];

export default function DispatcherPage() {
  const router = useRouter();

  // Navigation: 3 primary Figma screens
  const [activeScreen, setActiveScreen] = useState<'order-queue' | 'allocation-engine' | 'on-road-tracking'>('order-queue');
  const [selectedHub, setSelectedHub] = useState('Peliyagoda & Kandy Hubs');

  // Screen 1: Order Queue state
  const [orders, setOrders] = useState<OrderItem[]>(INITIAL_ORDERS);
  const [orderBrandFilter, setOrderBrandFilter] = useState<'All' | 'Waypoint Fresh' | 'Waypoint Style' | 'Waypoint Tech'>('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>(INITIAL_ORDERS.map(o => o.id));

  // Screen 2: Allocation Engine state
  const [selectedDepot, setSelectedDepot] = useState<'All' | 'Kandy' | 'Peliyagoda'>('All');
  const [activeTripId, setActiveTripId] = useState<'TRIP-WF-1043' | 'TRIP-WF-1044' | 'TRIP-WF-1045' | 'UNALLOCATED'>('TRIP-WF-1043');
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationDone, setAllocationDone] = useState(true);

  // Screen 3: On-road tracking state
  const [trackingFilter, setTrackingFilter] = useState<'All' | 'In Transit' | 'At Dock' | 'Completed'>('All');

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('waypoint_token');
      localStorage.removeItem('waypoint_user');
      window.location.href = '/';
    } else {
      router.push('/');
    }
  };

  const handleExecuteAllocation = async () => {
    setIsAllocating(true);
    try {
      const res = await fetch('/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_date: '2026-09-28' }),
      });
      await res.json();
      setAllocationDone(true);
      setActiveScreen('allocation-engine');
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#10B981', '#38BDF8'],
      });
    } catch (e) {
      console.error(e);
      setActiveScreen('allocation-engine');
    } finally {
      setIsAllocating(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesBrand = orderBrandFilter === 'All' || o.brand === orderBrandFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.outletName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.outletId.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesBrand && matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((item) => item !== id));
    } else {
      setSelectedOrders([...selectedOrders, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-slate-800">
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Dark Navy, matching Figma) */}
      {/* ========================================================= */}
      <aside className="w-64 bg-[#0A1224] text-slate-300 flex flex-col justify-between shrink-0 border-r border-[#15223D] z-30">
        <div>
          {/* Top Brand Logo */}
          <div className="p-5 border-b border-[#15223D]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                  WAYPOINT
                </span>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider block mt-1">
                  Dispatcher Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Operational Hub Selector */}
          <div className="p-4 border-b border-[#15223D]">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
              Operating Fleet Hub
            </label>
            <div className="relative">
              <select
                value={selectedHub}
                onChange={(e) => setSelectedHub(e.target.value)}
                className="w-full bg-[#111C35] border border-[#1E2E52] rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 appearance-none pr-8 cursor-pointer"
              >
                <option value="Peliyagoda & Kandy Hubs">Peliyagoda &amp; Kandy Hubs</option>
                <option value="Kandy Central Depot">Kandy Central Depot</option>
                <option value="Peliyagoda Central DC">Peliyagoda Central DC</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Main Navigation Menu (Matching Figma exactly) */}
          <nav className="p-3 space-y-1.5">
            <button
              type="button"
              onClick={() => setActiveScreen('order-queue')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScreen === 'order-queue'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#121E38]'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Order Queue</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveScreen('allocation-engine')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScreen === 'allocation-engine'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#121E38]'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Allocation Engine</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveScreen('on-road-tracking')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeScreen === 'on-road-tracking'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-[#121E38]'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>On-road Tracking</span>
            </button>
          </nav>
        </div>

        {/* Bottom Profile Footer */}
        <div className="p-4 border-t border-[#15223D] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              NP
            </div>
            <div>
              <strong className="text-xs text-white block leading-tight">Nimali Perera</strong>
              <span className="text-[10px] text-slate-400 font-medium">Chief Dispatcher</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN CONTENT AREA (Light Enterprise Canvas) */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Operational Cycle: <strong>September 28, 2026</strong></span>
            <span className="text-slate-300">•</span>
            <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-bold text-[11px] flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              4:00 PM Cutoff Passed (Order Lock Active)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Hub Active
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* ========================================================= */}
          {/* SCREEN 1: ORDER QUEUE (Figma Left Frame) */}
          {/* ========================================================= */}
          {activeScreen === 'order-queue' && (
            <div className="space-y-5">
              {/* Header Title & Action Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Queue</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Orders received for tomorrow morning dispatch cycle • Reconciled at 4:00 PM cutoff
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExecuteAllocation}
                  disabled={isAllocating}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap className={`w-3.5 h-3.5 ${isAllocating ? 'animate-spin' : ''}`} />
                  <span>{isAllocating ? 'Solving Constraints...' : 'Run Allocation'}</span>
                </button>
              </div>

              {/* 4 Top KPI Cards (Matching Figma layout) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">Total Orders</span>
                    <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                      <Package className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">16 Orders</div>
                  <span className="text-[11px] text-slate-400 block font-medium">Next-Day Morning Delivery</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">Total Volume</span>
                    <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
                      <Layers className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">15.8 m³</div>
                  <span className="text-[11px] text-slate-400 block font-medium">Payload Cube Requirement</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">Refrigerated (Chilled)</span>
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <ThermometerSnowflake className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-700">7 Orders</div>
                  <span className="text-[11px] text-emerald-600 block font-medium">Reefer Required (&lt; 4°C)</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">Ambient Orders</span>
                    <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                      <Truck className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-800">9 Orders</div>
                  <span className="text-[11px] text-amber-600 block font-medium">Dry Freight &amp; Apparel</span>
                </div>
              </div>

              {/* Filter Tabs & Search Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
                  {(['All', 'Waypoint Fresh', 'Waypoint Style', 'Waypoint Tech'] as const).map((b) => (
                    <button
                      key={b}
                      onClick={() => setOrderBrandFilter(b)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        orderBrandFilter === b
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>

                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search order or outlet..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Order Queue Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="p-3.5 pl-4">
                          <input
                            type="checkbox"
                            checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                            onChange={toggleSelectAll}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </th>
                        <th className="p-3.5">Order ID</th>
                        <th className="p-3.5">Brand</th>
                        <th className="p-3.5">Destination Outlet</th>
                        <th className="p-3.5">Delivery Window</th>
                        <th className="p-3.5">Weight (kg)</th>
                        <th className="p-3.5">Volume (m³)</th>
                        <th className="p-3.5">Crates</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5 pr-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredOrders.map((ord) => {
                        const isChecked = selectedOrders.includes(ord.id);
                        return (
                          <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="p-3.5 pl-4">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleSelectOrder(ord.id)}
                                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </td>
                            <td className="p-3.5 font-bold font-mono text-blue-700">{ord.id}</td>
                            <td className="p-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  ord.brand === 'Waypoint Fresh'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : ord.brand === 'Waypoint Style'
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                              >
                                {ord.brand}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <strong className="text-slate-900 block">{ord.outletName}</strong>
                              <span className="text-[10px] text-slate-400">{ord.district} District • {ord.outletId}</span>
                            </td>
                            <td className="p-3.5 font-semibold text-slate-700">{ord.deliveryWindow}</td>
                            <td className="p-3.5 font-mono text-slate-800">{ord.weightKg} kg</td>
                            <td className="p-3.5 font-mono text-slate-800">{ord.volumeM3} m³</td>
                            <td className="p-3.5 font-bold text-slate-900">{ord.crates}</td>
                            <td className="p-3.5">
                              {ord.temp.includes('Chilled') ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700">
                                  <ThermometerSnowflake className="w-3 h-3 text-cyan-500" />
                                  Chilled
                                </span>
                              ) : (
                                <span className="text-[11px] text-slate-500 font-semibold">Ambient</span>
                              )}
                            </td>
                            <td className="p-3.5 pr-4 text-right">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                {ord.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 2: ALLOCATION RESULT (Figma Middle Frame) */}
          {/* ========================================================= */}
          {activeScreen === 'allocation-engine' && (
            <div className="space-y-5">
              {/* Header Title & Metrics Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Allocation Result</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Heuristic multi-vehicle route optimization &amp; physical constraint satisfaction
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExecuteAllocation}
                    disabled={isAllocating}
                    className="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAllocating ? 'animate-spin' : ''}`} />
                    <span>Re-Run Solver</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      confetti({ particleCount: 100, spread: 80 });
                      alert('Route manifests dispatched to Kandy Central Bay 04 & Peliyagoda Dock Master!');
                    }}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve &amp; Dispatch Routes</span>
                  </button>
                </div>
              </div>

              {/* Top Row: Metric Badges & Fleet Fill Gauge */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Orders Allocated: 15 / 16 (94%)</span>
                  </div>

                  <div className="px-3 py-1.5 bg-blue-50 text-blue-800 border border-blue-200 rounded-xl font-bold flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Vehicles Used: 3</span>
                  </div>

                  <div className="px-3 py-1.5 bg-cyan-50 text-cyan-800 border border-cyan-200 rounded-xl font-bold flex items-center gap-1.5">
                    <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Reefer Compliance: 100%</span>
                  </div>
                </div>

                {/* Progress bar on the right */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <span className="text-slate-500 font-semibold text-xs">Fleet Payload Fill:</span>
                  <div className="w-40 bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                    <div className="bg-blue-600 h-3 rounded-full" style={{ width: '85%' }} />
                  </div>
                  <strong className="text-slate-900 font-bold">85.4%</strong>
                </div>
              </div>

              {/* Depot Tabs */}
              <div className="flex items-center gap-2">
                {(['All', 'Kandy', 'Peliyagoda'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDepot(d)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedDepot === d
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {d === 'All' ? 'All Depots' : `${d} Central Depot`}
                  </button>
                ))}
              </div>

              {/* Two Column Layout (Matching Figma middle screen) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left Column: Trip Selector Cards (5 cols) */}
                <div className="lg:col-span-4 space-y-3">
                  {/* Trip Card 1: VEH057 */}
                  <div
                    onClick={() => setActiveTripId('TRIP-WF-1043')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      activeTripId === 'TRIP-WF-1043'
                        ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">VEH057</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        100% Feasible
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 font-semibold">Reefer Van 1.5T • Driver: Kasun Bandara</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Kandy Central Depot • Departure 04:45 AM</div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">3 Stops (LIFO)</span>
                      <strong className="text-blue-700">880 kg / 1040 kg (85%)</strong>
                    </div>
                  </div>

                  {/* Trip Card 2: VEH059 */}
                  <div
                    onClick={() => setActiveTripId('TRIP-WF-1044')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      activeTripId === 'TRIP-WF-1044'
                        ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">VEH059</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        100% Feasible
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 font-semibold">Ambient Van 1.2T • Driver: Dinesh Gamage</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Kandy Central Depot • Departure 05:15 AM</div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">2 Stops (LIFO)</span>
                      <strong className="text-blue-700">950 kg / 1200 kg (79%)</strong>
                    </div>
                  </div>

                  {/* Trip Card 3: VEH039 */}
                  <div
                    onClick={() => setActiveTripId('TRIP-WF-1045')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      activeTripId === 'TRIP-WF-1045'
                        ? 'bg-blue-50/50 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">VEH039</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        100% Feasible
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 font-semibold">Heavy Reefer Truck • Driver: Rohana J.</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Peliyagoda Central DC • Departure 03:30 AM</div>

                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">2 Stops (LIFO)</span>
                      <strong className="text-blue-700">5200 kg / 6180 kg (84%)</strong>
                    </div>
                  </div>

                  {/* Red Card: Unallocated / Infeasible Order (From Figma Red Border box) */}
                  <div
                    onClick={() => setActiveTripId('UNALLOCATED')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      activeTripId === 'UNALLOCATED'
                        ? 'bg-rose-50/80 border-rose-500 ring-2 ring-rose-500/20 shadow-sm'
                        : 'bg-rose-50/40 border-rose-300 hover:border-rose-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-rose-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Unallocated Order (ORD-1046)
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        Attention Req
                      </span>
                    </div>
                    <div className="text-xs text-rose-800 mt-1 font-semibold">OUT015 : Galle Fort Lifestyle (350 kg)</div>
                    <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                      Narrow street / pedestrian zone prevents 1.5T van access before 10:00 AM. Deferred to secondary shuttle.
                    </p>
                  </div>
                </div>

                {/* Right Column: Detailed Trip Itinerary & LIFO Sequence (8 cols) */}
                <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
                  {activeTripId === 'TRIP-WF-1043' && (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-slate-900">TRIP-WF-1043 Itinerary</h2>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                              Reefer Van • VEH057
                            </span>
                          </div>
                          <span className="text-xs text-slate-500 mt-0.5 block">
                            Assigned Driver: <strong>Kasun Bandara (077-492104)</strong> • Planned Departure: 04:45 AM
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Stops</span>
                          <strong className="text-sm font-bold text-blue-600">3 Outlets (LIFO Reverse)</strong>
                        </div>
                      </div>

                      {/* Capacity Utilization Progress Bars */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600">Weight Capacity</span>
                            <strong className="text-slate-900">880 kg / 1040 kg (85%)</strong>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }} />
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-slate-600">Volume Capacity</span>
                            <strong className="text-slate-900">5.9 m³ / 7.0 m³ (84%)</strong>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '84%' }} />
                          </div>
                        </div>
                      </div>

                      {/* Strict LIFO Reverse Stowage Sequence */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-blue-600" />
                            LIFO Warehouse Stowage &amp; Unloading Order
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            Stop 1 placed near rear door (unloaded first)
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                                1
                              </span>
                              <div>
                                <strong className="text-slate-900 block">OUT077 : Kandy Fresh (Katugastota)</strong>
                                <span className="text-[11px] text-slate-500">Window: 5:30 AM - 8:00 AM • ETA: 7:12 AM</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <strong className="text-blue-700 block">15 Crates (380 kg)</strong>
                              <span className="text-[10px] text-emerald-600 font-semibold">Chilled Compartment</span>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                                2
                              </span>
                              <div>
                                <strong className="text-slate-900 block">OUT079 : Kandy Fresh (William Gopallawa)</strong>
                                <span className="text-[11px] text-slate-500">Window: 4:00 AM - 7:45 AM • ETA: 6:20 AM</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <strong className="text-slate-800 block">15 Crates (310 kg)</strong>
                              <span className="text-[10px] text-emerald-600 font-semibold">Chilled Compartment</span>
                            </div>
                          </div>

                          <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                                3
                              </span>
                              <div>
                                <strong className="text-slate-900 block">OUT080 : Kadugannawa Outlet</strong>
                                <span className="text-[11px] text-slate-500">Window: 5:00 AM - 7:30 AM • ETA: 5:45 AM</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <strong className="text-slate-800 block">14 Crates (190 kg)</strong>
                              <span className="text-[10px] text-emerald-600 font-semibold">Chilled Compartment</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTripId === 'TRIP-WF-1044' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <h2 className="text-lg font-black text-slate-900">TRIP-WF-1044 Itinerary</h2>
                          <span className="text-xs text-slate-500">Ambient Van • VEH059 • Driver: Dinesh Gamage</span>
                        </div>
                        <span className="text-xs font-bold text-slate-700">950 kg / 1200 kg (79%)</span>
                      </div>
                      <p className="text-xs text-slate-600">Servicing OUT076 (Peradeniya) and OUT082 (Gampola) with dry goods and apparel.</p>
                    </div>
                  )}

                  {activeTripId === 'TRIP-WF-1045' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <h2 className="text-lg font-black text-slate-900">TRIP-WF-1045 Itinerary</h2>
                          <span className="text-xs text-slate-500">Heavy Truck • VEH039 • Driver: Rohana J.</span>
                        </div>
                        <span className="text-xs font-bold text-slate-700">5200 kg / 6180 kg (84%)</span>
                      </div>
                      <p className="text-xs text-slate-600">Peliyagoda High-Capacity Run servicing Colombo Metro Hubs (Pannipitiya &amp; Maharagama).</p>
                    </div>
                  )}

                  {activeTripId === 'UNALLOCATED' && (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2">
                        <strong className="text-sm font-bold flex items-center gap-1.5 text-rose-800">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          Delivery Window &amp; Physical Constraint Notice
                        </strong>
                        <p className="leading-relaxed">
                          Order <strong>ORD-1046-A</strong> for Galle Fort Lifestyle requires small vehicle clearance due to colonial road heritage bylaws. The heavy freight fleet scheduled for Southern expressway cannot enter the zone before pedestrian hours open at 10:00 AM.
                        </p>
                        <div className="pt-2 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => alert('Assigned to Southern Small EV Shuttle')}
                            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg font-bold text-xs"
                          >
                            Re-Route to Southern Small EV Shuttle
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 3: ON-ROAD TRACKING (Figma Right Frame) */}
          {/* ========================================================= */}
          {activeScreen === 'on-road-tracking' && (
            <div className="space-y-5">
              {/* Header Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">On-road Tracking</h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live fleet telemetry, GPS road tracking, and real-time cold-chain compliance
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sensors Synced (10s Ping)
                  </span>
                </div>
              </div>

              {/* 4 Top KPI Cards (Matching Figma layout) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">Total Vehicles</span>
                    <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                      <Truck className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900">3 Active</div>
                  <span className="text-[11px] text-slate-400 block font-medium">All Depots Deployed</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">On-Time Deliveries</span>
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                      <Clock className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-emerald-700">98.2%</div>
                  <span className="text-[11px] text-emerald-600 block font-medium">Window Compliance</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">Average ETA</span>
                    <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                      <MapPin className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-amber-800">7:12 AM</div>
                  <span className="text-[11px] text-amber-600 block font-medium">Morning Delivery Peak</span>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">Cold Chain Temp</span>
                    <span className="p-1.5 rounded-lg bg-cyan-50 text-cyan-600">
                      <ThermometerSnowflake className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl font-black text-cyan-700">-18.2°C</div>
                  <span className="text-[11px] text-cyan-600 block font-medium">Highland Reefer Secure</span>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2">
                {(['All', 'In Transit', 'At Dock', 'Completed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setTrackingFilter(s)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      trackingFilter === s
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>

              {/* Live Tracking Table */}
              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <th className="p-3.5 pl-4">Trip ID</th>
                        <th className="p-3.5">Vehicle &amp; Driver</th>
                        <th className="p-3.5">Depot Route</th>
                        <th className="p-3.5">Current Location &amp; Speed</th>
                        <th className="p-3.5">Reefer Telemetry</th>
                        <th className="p-3.5">Next Stop &amp; ETA</th>
                        <th className="p-3.5">Progress</th>
                        <th className="p-3.5 pr-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 pl-4 font-bold font-mono text-blue-700">TRIP-WF-1043</td>
                        <td className="p-3.5">
                          <strong className="text-slate-900 block">VEH057 (WP-CAD-8812)</strong>
                          <span className="text-[11px] text-slate-500">Kasun Bandara (077-492104)</span>
                        </td>
                        <td className="p-3.5 text-slate-700">Kandy Central Depot → Katugastota</td>
                        <td className="p-3.5">
                          <strong className="text-slate-900 block">Kandy Hill Rd km 4.2</strong>
                          <span className="text-[11px] text-slate-500">Speed: 38 km/h</span>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                            <ThermometerSnowflake className="w-3 h-3 text-cyan-600" />
                            -18.2°C (OK)
                          </span>
                        </td>
                        <td className="p-3.5">
                          <strong className="text-blue-700 block">OUT077 : Kandy Fresh</strong>
                          <span className="text-[11px] text-slate-500">Live ETA: 7:12 AM</span>
                        </td>
                        <td className="p-3.5">
                          <div className="w-24 bg-slate-200 rounded-full h-1.5">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '33%' }} />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">Stop 1 of 3</span>
                        </td>
                        <td className="p-3.5 pr-4 text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            On Route
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 pl-4 font-bold font-mono text-blue-700">TRIP-WF-1044</td>
                        <td className="p-3.5">
                          <strong className="text-slate-900 block">VEH059 (WP-CAD-8815)</strong>
                          <span className="text-[11px] text-slate-500">Dinesh Gamage (071-884210)</span>
                        </td>
                        <td className="p-3.5 text-slate-700">Kandy Central Depot → Gampola</td>
                        <td className="p-3.5">
                          <strong className="text-slate-900 block">Bay 02 Loading Dock</strong>
                          <span className="text-[11px] text-slate-500">Speed: 0 km/h (Staged)</span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-[11px] text-slate-500 font-semibold">Ambient Cargo</span>
                        </td>
                        <td className="p-3.5">
                          <strong className="text-slate-900 block">OUT076 : Peradeniya</strong>
                          <span className="text-[11px] text-slate-500">Scheduled: 06:00 AM</span>
                        </td>
                        <td className="p-3.5">
                          <div className="w-24 bg-slate-200 rounded-full h-1.5">
                            <div className="bg-slate-300 h-1.5 rounded-full" style={{ width: '0%' }} />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">Loading Complete</span>
                        </td>
                        <td className="p-3.5 pr-4 text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Ready
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 pl-4 font-bold font-mono text-blue-700">TRIP-WF-1045</td>
                        <td className="p-3.5">
                          <strong className="text-slate-900 block">VEH039 (WP-LH-3301)</strong>
                          <span className="text-[11px] text-slate-500">Rohana Jayasinghe (078-331902)</span>
                        </td>
                        <td className="p-3.5 text-slate-700">Peliyagoda Central DC → Metro Hubs</td>
                        <td className="p-3.5">
                          <strong className="text-slate-900 block">Bay 04 Loading Dock</strong>
                          <span className="text-[11px] text-slate-500">Speed: 0 km/h (Pre-cooled)</span>
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                            <ThermometerSnowflake className="w-3 h-3 text-cyan-600" />
                            -19.5°C (Chilled)
                          </span>
                        </td>
                        <td className="p-3.5">
                          <strong className="text-slate-900 block">OUT002 : Pannipitiya</strong>
                          <span className="text-[11px] text-slate-500">Scheduled: 05:00 AM</span>
                        </td>
                        <td className="p-3.5">
                          <div className="w-24 bg-slate-200 rounded-full h-1.5">
                            <div className="bg-slate-300 h-1.5 rounded-full" style={{ width: '0%' }} />
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 block">Gate Pass Issued</span>
                        </td>
                        <td className="p-3.5 pr-4 text-right">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Ready
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
