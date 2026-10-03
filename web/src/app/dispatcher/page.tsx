'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  LogOut,
  MapPin,
  ChevronRight,
  Layers,
  Calendar,
  Zap,
} from 'lucide-react';

interface PlannedTripUI {
  id: string;
  vehicle: string;
  driver: string;
  vehicleType: string;
  temp: 'reefer' | 'ambient';
  depot: string;
  status: 'Ready for Dispatch' | 'On Route' | 'Completed' | 'Pending Allocation';
  weightKg: number;
  weightCapKg: number;
  volumeM3: number;
  volumeCapM3: number;
  totalCrates: number;
  departureTime: string;
  stops: {
    num: number;
    outletId: string;
    outletName: string;
    window: string;
    crates: number;
    status: 'Pending' | 'Delivered' | 'En Route';
  }[];
}

const INITIAL_TRIPS: PlannedTripUI[] = [
  {
    id: 'TRIP-WF-1043',
    vehicle: 'VEH057 (Reefer Van 1.5T)',
    driver: 'Kasun Bandara (077-492104)',
    vehicleType: 'Refrigerated Van',
    temp: 'reefer',
    depot: 'Kandy Central Depot',
    status: 'On Route',
    weightKg: 880,
    weightCapKg: 1040,
    volumeM3: 5.9,
    volumeCapM3: 7.0,
    totalCrates: 44,
    departureTime: '04:45 AM',
    stops: [
      { num: 1, outletId: 'OUT077', outletName: 'Kandy Fresh (Katugastota)', window: '5:30 AM - 8:00 AM', crates: 15, status: 'En Route' },
      { num: 2, outletId: 'OUT079', outletName: 'Kandy Fresh (William Gopallawa)', window: '4:00 AM - 7:45 AM', crates: 15, status: 'Pending' },
      { num: 3, outletId: 'OUT080', outletName: 'Kadugannawa Outlet', window: '5:00 AM - 7:30 AM', crates: 14, status: 'Pending' },
    ],
  },
  {
    id: 'TRIP-WF-1044',
    vehicle: 'VEH059 (Ambient Van 1.2T)',
    driver: 'Dinesh Gamage (071-884210)',
    vehicleType: 'Ambient Van',
    temp: 'ambient',
    depot: 'Kandy Central Depot',
    status: 'Ready for Dispatch',
    weightKg: 950,
    weightCapKg: 1200,
    volumeM3: 7.2,
    volumeCapM3: 9.0,
    totalCrates: 38,
    departureTime: '05:15 AM',
    stops: [
      { num: 1, outletId: 'OUT076', outletName: 'Kandy Fresh (Peradeniya)', window: '6:00 AM - 8:30 AM', crates: 20, status: 'Pending' },
      { num: 2, outletId: 'OUT082', outletName: 'Gampola Town Hub', window: '7:00 AM - 9:30 AM', crates: 18, status: 'Pending' },
    ],
  },
  {
    id: 'TRIP-WF-1045',
    vehicle: 'VEH039 (Heavy Reefer Truck 6.2T)',
    driver: 'Rohana Jayasinghe (078-331902)',
    vehicleType: 'Heavy Reefer Truck',
    temp: 'reefer',
    depot: 'Peliyagoda Central DC',
    status: 'Ready for Dispatch',
    weightKg: 5200,
    weightCapKg: 6180,
    volumeM3: 24.1,
    volumeCapM3: 29.9,
    totalCrates: 180,
    departureTime: '03:30 AM',
    stops: [
      { num: 1, outletId: 'OUT002', outletName: 'Pannipitiya Central', window: '5:00 AM - 8:00 AM', crates: 90, status: 'Pending' },
      { num: 2, outletId: 'OUT005', outletName: 'Maharagama Express', window: '6:30 AM - 9:00 AM', crates: 90, status: 'Pending' },
    ],
  },
];

export default function DispatcherPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'allocation' | 'tracking' | 'orders' | 'exceptions'>('allocation');
  const [trips, setTrips] = useState<PlannedTripUI[]>(INITIAL_TRIPS);
  const [selectedTrip, setSelectedTrip] = useState<PlannedTripUI>(INITIAL_TRIPS[0]);
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocationSuccess, setAllocationSuccess] = useState(false);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('waypoint_token');
      localStorage.removeItem('waypoint_user');
      window.location.href = '/';
    } else {
      router.push('/');
    }
  };

  const handleTriggerAllocation = async () => {
    setIsAllocating(true);
    try {
      const res = await fetch('/api/allocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_date: '2026-09-28' }),
      });
      await res.json();
      setAllocationSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#10B981', '#6366F1'],
      });
      setTimeout(() => setAllocationSuccess(false), 4000);
    } catch (e) {
      console.error('Allocation trigger failed:', e);
    } finally {
      setIsAllocating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col font-sans">
      {/* Top Enterprise Dispatcher Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0B1528]/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Hub Info */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-white block leading-none">
                  WAYPOINT <span className="text-cyan-400 font-semibold text-xs tracking-normal">DISPATCH</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Central Fleet Control Hub</span>
              </div>
            </Link>

            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ml-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Kandy &amp; Peliyagoda Hubs Active
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="hidden lg:flex items-center bg-[#111C32] border border-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('allocation')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'allocation' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Fleet Allocation</span>
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'tracking' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Live Telemetry</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'orders' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Order Cutoff (4 PM)</span>
            </button>
            <button
              onClick={() => setActiveTab('exceptions')}
              className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'exceptions' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Discrepancy Audit</span>
            </button>
          </div>

          {/* User Session & Logout */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="hidden sm:flex flex-col text-right">
              <span className="font-bold text-white leading-none">Nimali Perera</span>
              <span className="text-[10px] text-slate-400">Chief Fleet Dispatcher</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* TAB 1: FLEET ALLOCATION ENGINE */}
        {activeTab === 'allocation' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#111E38] via-[#0E1A30] to-[#121B2E] border border-blue-500/20 rounded-3xl p-6 sm:p-7 relative overflow-hidden shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Cycle Date: September 28, 2026 • 4:00 PM Cutoff Reconciled</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Multi-Vehicle Fleet Routing &amp; Payload Planning
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
                  Constraint-satisfaction routing engine balancing weight, volume, cold-chain compartment preservation, and strict LIFO warehouse loading.
                </p>
              </div>

              <div className="flex items-center gap-3 z-10 shrink-0">
                <button
                  onClick={handleTriggerAllocation}
                  disabled={isAllocating}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isAllocating ? 'animate-spin' : ''}`} />
                  <span>{isAllocating ? 'Optimizing Fleet...' : 'Re-Run AI Allocation Engine'}</span>
                </button>
              </div>
            </div>

            {allocationSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Optimal Multi-Depot Fleet Schedule generated successfully. 3 Routes Allocated with zero constraint violations.
                </span>
                <span className="text-[10px] text-emerald-400 uppercase font-mono">Status: 100% Feasible</span>
              </div>
            )}

            {/* Allocation Metrics Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#0E182A] border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Fleet Payload Utilization</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">85.4%</span>
                  <span className="text-xs text-emerald-400 font-semibold">Optimal</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div className="bg-[#0E182A] border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Reefer Cold-Chain Compliance</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-cyan-300">100%</span>
                  <span className="text-xs text-cyan-400 font-semibold">-18.2°C Baseline</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2">
                  <div className="bg-cyan-400 h-1.5 rounded-full" style={{ width: '100%' }} />
                </div>
              </div>

              <div className="bg-[#0E182A] border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Active Dispatch Routes</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">3 Trips</span>
                  <span className="text-xs text-slate-400">7 Outlets Covered</span>
                </div>
                <span className="text-[11px] text-slate-500 block">Kandy Central &amp; Peliyagoda DC</span>
              </div>

              <div className="bg-[#0E182A] border border-slate-800 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Delivery Window Feasibility</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-400">100%</span>
                  <span className="text-xs text-emerald-400 font-semibold">All Pre-8:00 AM</span>
                </div>
                <span className="text-[11px] text-slate-500 block">0 Schedule Clashes</span>
              </div>
            </div>

            {/* Split View: Trip Selector on Left, Selected Trip Details on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Trip Cards (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <h2 className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Scheduled Vehicle Trips ({trips.length})
                </h2>

                {trips.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTrip(t)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedTrip.id === t.id
                        ? 'bg-[#15233E] border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-[#0E182A] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-2">
                        <span className="font-mono text-cyan-400">{t.id}</span>
                        <span>•</span>
                        <span>{t.vehicle.split(' ')[0]}</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          t.status === 'On Route'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-semibold truncate">{t.driver}</div>
                    <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>{t.depot}</span>
                      <span>Departure: {t.departureTime}</span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Payload: {t.weightKg} / {t.weightCapKg} kg</span>
                      <strong className="text-white">{Math.round((t.weightKg / t.weightCapKg) * 100)}% Cap</strong>
                    </div>
                  </button>
                ))}
              </div>

              {/* Trip Manifest & Stops (7 cols) */}
              <div className="lg:col-span-7 bg-[#0E182A] border border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-extrabold text-white">{selectedTrip.id} Manifest</h3>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {selectedTrip.temp.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{selectedTrip.vehicle} • {selectedTrip.driver}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Planned Departure</span>
                    <span className="text-sm font-extrabold text-cyan-400">{selectedTrip.departureTime}</span>
                  </div>
                </div>

                {/* Capacity Gauges */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Weight Load</span>
                      <strong className="text-white">{selectedTrip.weightKg} / {selectedTrip.weightCapKg} kg</strong>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(selectedTrip.weightKg / selectedTrip.weightCapKg) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Volume Load</span>
                      <strong className="text-white">{selectedTrip.volumeM3} / {selectedTrip.volumeCapM3} m³</strong>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-cyan-400 h-2 rounded-full"
                        style={{ width: `${(selectedTrip.volumeM3 / selectedTrip.volumeCapM3) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Enforced LIFO Itinerary */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      LIFO Reverse Stowage &amp; Delivery Stops
                    </span>
                    <span className="text-slate-500 text-[10px]">Stop 1 closest to roll-up door</span>
                  </div>

                  <div className="space-y-2.5">
                    {selectedTrip.stops.map((s) => (
                      <div
                        key={s.num}
                        className="p-3.5 rounded-2xl bg-[#131F35] border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 font-bold flex items-center justify-center text-xs">
                            {s.num}
                          </span>
                          <div>
                            <strong className="text-white block">{s.outletId} : {s.outletName}</strong>
                            <span className="text-[11px] text-slate-400">Window: {s.window}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-right">
                          <div>
                            <strong className="text-cyan-400 block">{s.crates} Crates</strong>
                            <span className="text-[10px] text-slate-500">{s.status}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LIVE FLEET TELEMETRY & TRACKING */}
        {activeTab === 'tracking' && (
          <div className="space-y-6">
            <div className="bg-[#0E182A] border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-white">Live Cold-Chain &amp; Route Telemetry</h2>
                  <p className="text-xs text-slate-400">Real-time sensor pings from active reefer vans across Sri Lanka highland corridors</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Sensors Online (Interval: 10s)
                </span>
              </div>

              {/* Active Vehicle Spotlight */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-[#142138] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">VEH057 Reefer Van</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      ON ROUTE
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Driver:</span>
                      <strong className="text-white">Kasun Bandara</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Location:</span>
                      <strong className="text-slate-200">Kandy Hill Road km 4.2</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Current Speed:</span>
                      <strong className="text-white">38 km/h</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Reefer Temp:</span>
                      <strong className="text-cyan-400 font-mono">-18.2°C (OK)</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#142138] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">VEH059 Ambient Van</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      STAGED AT BAY 2
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Driver:</span>
                      <strong className="text-white">Dinesh Gamage</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Location:</span>
                      <strong className="text-slate-200">Kandy Central Depot</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Departure:</span>
                      <strong className="text-white">05:15 AM</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Pre-Cooling:</span>
                      <strong className="text-slate-300">N/A (Ambient)</strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#142138] border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">VEH039 Heavy Truck</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      STAGED AT BAY 4
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Driver:</span>
                      <strong className="text-white">Rohana Jayasinghe</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Location:</span>
                      <strong className="text-slate-200">Peliyagoda Central DC</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Departure:</span>
                      <strong className="text-white">03:30 AM</strong>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Reefer Temp:</span>
                      <strong className="text-cyan-400 font-mono">-19.5°C (Chilled)</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ORDER INGESTION & 4 PM CUTOFF */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="bg-[#0E182A] border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-white">Daily Order Cutoff Reconciliation</h2>
                  <p className="text-xs text-slate-400">Orders confirmed before 4:00 PM are locked for next-morning 5:00 AM dispatch</p>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>4:00 PM Cutoff Passed • Order Intake Locked</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-4 rounded-xl bg-[#142138] border border-slate-800">
                  <span className="text-xs text-slate-400">Waypoint Fresh (Dairy/Produce)</span>
                  <strong className="text-xl text-white block mt-1">44 Crates • 880 kg</strong>
                  <span className="text-[11px] text-emerald-400">100% Assigned to Reefer</span>
                </div>
                <div className="p-4 rounded-xl bg-[#142138] border border-slate-800">
                  <span className="text-xs text-slate-400">Waypoint Style (Apparel)</span>
                  <strong className="text-xl text-white block mt-1">38 Crates • 950 kg</strong>
                  <span className="text-[11px] text-emerald-400">Assigned to Ambient Van</span>
                </div>
                <div className="p-4 rounded-xl bg-[#142138] border border-slate-800">
                  <span className="text-xs text-slate-400">Waypoint Tech (Electronics)</span>
                  <strong className="text-xl text-white block mt-1">180 Crates • 5,200 kg</strong>
                  <span className="text-[11px] text-emerald-400">Assigned to Heavy Truck</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DISCREPANCY & SHORTFALL AUDIT */}
        {activeTab === 'exceptions' && (
          <div className="space-y-6">
            <div className="bg-[#0E182A] border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-extrabold text-white">Active Warehouse Loading Exceptions</h2>
                  <p className="text-xs text-slate-400">Automated shortfalls flagged at outbound dock and reconciled with store managers</p>
                </div>
                <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full text-xs font-bold">
                  1 Operational Shortfall
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-red-300">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    SHORTFALL: CR-076-019 (Fresh Milk)
                  </span>
                  <span className="font-mono bg-red-500/20 px-2 py-0.5 rounded text-red-200">KANDY DEPOT BAY 04</span>
                </div>
                <p className="text-red-200 leading-relaxed">
                  Crate #19 suffered carton crush and leakage during pallet staging. Crate #20 unavailable at Cold Room Rack A-12. 
                  Shortfall of 3 units flagged for OUT077 (Kandy Fresh). Advance warning delivered to Store Manager Aravinda Silva.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-red-300">
                  <span>Store Manager Notification: <strong>Dispatched &amp; Acknowledged</strong></span>
                  <span>Invoice Credit Adjustment: <strong>Auto-Queued</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
