'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Truck,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wifi,
  WifiOff,
  Navigation,
  Check,
  RefreshCw,
  LogOut,
  MapPin,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  PenTool,
  Store,
  FileText,
  Settings as SettingsIcon,
  HelpCircle,
  Bell,
  Database,
  ThermometerSnowflake,
  ArrowRight,
} from 'lucide-react';
import SignaturePad from '@/components/SignaturePad';
import { offlineDb } from '@/lib/offline-store';

type DriverScreen =
  | 'home'
  | 'stops-list'
  | 'stop-detail'
  | 'en-route'
  | 'complete-delivery'
  | 'delivery-success'
  | 'offline-mode'
  | 'sync-status'
  | 'settings';

interface StopItem {
  product: string;
  planned: number;
  available: number;
  status: string;
}

interface DriverStopData {
  num: number;
  outletId: string;
  name: string;
  location: string;
  window: string;
  orderId: string;
  vehicle: string;
  totalCrates: number;
  dockType: string;
  manager: string;
  shortfallAlert?: { item: string; planned: number; available: number; note: string };
  items: StopItem[];
}

const DRIVER_STOPS_MAP: Record<number, DriverStopData> = {
  1: {
    num: 1,
    outletId: 'OUT077',
    name: 'Kandy Fresh Central',
    location: 'Peradeniya Road, Kandy',
    window: '5.00AM:7.30AM',
    orderId: 'WF-1043',
    vehicle: 'VEH057 (Van Reefer 1.5T)',
    totalCrates: 15,
    dockType: 'Rear Bay Hydraulic Dock',
    manager: 'Aravinda Silva',
    shortfallAlert: {
      item: 'Milk',
      planned: 18,
      available: 15,
      note: '3 units unavailable at depot. Warehouse logged shortage during staging. Credit note pre-applied.',
    },
    items: [
      { product: 'Milk (20L Crate)', planned: 18, available: 15, status: '15 ⚠️' },
      { product: 'Yogurt (12x500g)', planned: 10, available: 10, status: '10 ✓' },
      { product: 'Fresh Vegetables', planned: 8, available: 8, status: '8 ✓' },
      { product: 'Frozen Chicken', planned: 4, available: 4, status: '4 ✓' },
    ],
  },
  2: {
    num: 2,
    outletId: 'OUT079',
    name: 'Kandy Fresh - Katugastota',
    location: 'Katugastota Highway Junction',
    window: '4.00AM:7.45AM',
    orderId: 'WF-1044',
    vehicle: 'VEH057 (Van Reefer 1.5T)',
    totalCrates: 15,
    dockType: 'Side Ramp Delivery',
    manager: 'Kamal Bandara',
    items: [
      { product: 'Full Cream Milk (1L)', planned: 24, available: 24, status: '24 ✓' },
      { product: 'Butter Salted (200g)', planned: 12, available: 12, status: '12 ✓' },
      { product: 'Fresh Nuwara Eliya Carrots', planned: 10, available: 10, status: '10 ✓' },
      { product: 'Highland Curd (Clay Pot)', planned: 6, available: 6, status: '6 ✓' },
    ],
  },
  3: {
    num: 3,
    outletId: 'OUT080',
    name: 'Kadugannawa Express Outlet',
    location: 'Main Street Front Door',
    window: '5.30AM:8.00AM',
    orderId: 'WF-1045',
    vehicle: 'VEH057 (Van Reefer 1.5T)',
    totalCrates: 14,
    dockType: 'Street Curb Delivery (Van Only)',
    manager: 'Nalinda Perera',
    items: [
      { product: 'Curd Pots (Clay)', planned: 15, available: 15, status: '15 ✓' },
      { product: 'Eggs Farm Fresh (30s)', planned: 8, available: 8, status: '8 ✓' },
      { product: 'Leafy Salad Greens', planned: 10, available: 10, status: '10 ✓' },
    ],
  },
};

export default function DriverResponsiveApp() {
  const router = useRouter();
  const [screen, setScreen] = useState<DriverScreen>('home');
  const [activeTab, setActiveTab] = useState<'route' | 'stops' | 'settings'>('route');
  const [isOffline, setIsOffline] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [activeStopIdx, setActiveStopIdx] = useState(1);

  const activeStop = DRIVER_STOPS_MAP[activeStopIdx] || DRIVER_STOPS_MAP[1];

  // Auto-detect network connectivity (PWA production standard)
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const handleConfirmDelivery = async () => {
    if (!signatureData) {
      alert('Please have the store manager sign on the digital pad before confirming.');
      return;
    }

    const currentOutlet = activeStopIdx === 1 ? 'OUT077' : activeStopIdx === 2 ? 'OUT079' : 'OUT080';

    if (isOffline) {
      await offlineDb.offlineActions.add({
        actionId: `OFFLINE-${Date.now()}`,
        tripId: 'TRIP-WF-1043',
        stopId: activeStopIdx,
        outletId: currentOutlet,
        status: 'DELIVERED',
        discrepancyNote: 'Milk short by 3 units (loading issue recorded)',
        signatureData,
        offlineTimestamp: new Date().toISOString(),
        synced: false,
      });
    } else {
      try {
        await fetch('/api/trips/TRIP-WF-1043/deliver', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stopId: currentOutlet,
            status: 'DELIVERED',
            discrepancyNote: 'Milk short by 3 units (loading issue recorded)',
            signatureData,
            isOfflineRecord: false,
          }),
        });
      } catch (err) {
        console.warn('Online delivery call failed, buffering to local offline store:', err);
        await offlineDb.offlineActions.add({
          actionId: `OFFLINE-${Date.now()}`,
          tripId: 'TRIP-WF-1043',
          stopId: activeStopIdx,
          outletId: currentOutlet,
          status: 'DELIVERED',
          discrepancyNote: 'Milk short by 3 units (loading issue recorded)',
          signatureData,
          offlineTimestamp: new Date().toISOString(),
          synced: false,
        });
      }
    }

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#10B981', '#38BDF8'],
    });

    setScreen('delivery-success');
  };

  const handleSyncOfflineQueue = async () => {
    try {
      const unsynced = await offlineDb.offlineActions.filter((a) => !a.synced).toArray();
      if (unsynced.length > 0) {
        await fetch('/api/trips/TRIP-WF-1043/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            actions: unsynced.map((a) => ({
              actionId: a.actionId,
              type: 'DELIVER_STOP',
              stopId: a.stopId,
              outletId: a.outletId,
              status: a.status,
              discrepancyNote: a.discrepancyNote,
              signatureData: a.signatureData,
              offlineTimestamp: a.offlineTimestamp,
            })),
          }),
        });

        for (const item of unsynced) {
          if (item.id) {
            await offlineDb.offlineActions.update(item.id, { synced: true });
          }
        }
      }
    } catch (err) {
      console.warn('Sync failed:', err);
    }
    setIsOffline(false);
    setScreen('sync-status');
  };

  const handleLogout = () => {
    localStorage.removeItem('waypoint_token');
    localStorage.removeItem('waypoint_user');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* Top Application Navigation Bar (Responsive on desktop, sleek on mobile) */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900">WAYPOINT</span>
                <span className="text-[11px] text-blue-600 font-bold ml-1.5 px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 hidden sm:inline-block">
                  Driver Companion
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation Tabs (Visible on tablet & desktop) */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                setActiveTab('route');
                setScreen('home');
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'route'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Route Overview
            </button>
            <button
              onClick={() => {
                setActiveTab('stops');
                setScreen('stops-list');
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'stops'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today&apos;s Stops
            </button>
            <button
              onClick={() => {
                setActiveTab('settings');
                setScreen('settings');
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Driver Settings
            </button>
          </div>

          {/* Right Tools: Connection Status & Logout */}
          <div className="flex items-center gap-2.5">
            {/* Live Network Status Indicator */}
            {isOffline ? (
              <div className="px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Buffer</span>
              </div>
            ) : (
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Wifi className="w-3.5 h-3.5" />
                <span>4G LTE Active</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all border border-slate-200"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Responsive Body Container */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full">
          {/* ========================================================= */}
          {/* SCREEN 1: GOOD MORNING, KASUN (Home Screen) */}
          {/* ========================================================= */}
          {screen === 'home' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Good Morning, Kasun
                  </h1>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5">
                    Multi-Stop Transport Driver • Route <strong>Kandy Fresh Early Run</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold">
                    <ThermometerSnowflake className="w-4 h-4 text-cyan-600" />
                    <span>Reefer Temp: -18.2°C OK</span>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                    Vehicle: VEH057
                  </span>
                </div>
              </div>

              {/* Responsive Grid Layout on Desktop: Route Card + Next Stop */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Route Card (5 cols on desktop) */}
                <div className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-extrabold text-slate-900">
                      Kandy Fresh Route Specs
                    </h2>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      TRIP-WF-1043
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Vehicle</span>
                      <strong className="text-slate-900">VEH057 (WP-CAD-8812)</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Vehicle Type</span>
                      <strong className="text-slate-900">Refrigerated Van (1.5T)</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Starting Depot</span>
                      <strong className="text-slate-900">Kandy Central Depot</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Departure Time</span>
                      <strong className="text-slate-900 font-mono">04:45 AM</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Total Stops</span>
                      <strong className="text-slate-900">3 Retail Outlets</strong>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500 font-medium">Delivery Deadline</span>
                      <strong className="text-blue-600 font-bold">Strictly Before 8:00 AM</strong>
                    </div>
                  </div>

                  {/* Amber Loading Shortfall Notification */}
                  <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-4 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#B45309]">
                      <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                      <span>Warehouse Loading Shortfall Alert</span>
                    </div>
                    <div className="font-bold text-slate-900">
                      Milk: 18 planned → 15 available
                    </div>
                    <div className="text-[#B45309]">
                      3 units unavailable at depot. Advance note logged for store manager.
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('stops');
                      setScreen('stops-list');
                    }}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span>View Today&apos;s Route & Stops</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Today's Stops Preview (7 cols on desktop) */}
                <div className="md:col-span-7 space-y-4">
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span>Delivery Sequence (LIFO Enforced)</span>
                      </h2>
                      <span className="text-xs font-semibold text-slate-500">
                        Stop 1 is closest to door
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Stop 1 */}
                      <div className="p-4 rounded-2xl border-2 border-blue-600 bg-blue-50/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                            1
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-sm text-slate-900">OUT077 : Kandy Fresh</strong>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                🟢 Next Up
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">
                              Window: <strong>5.00AM:7.30AM</strong> • 15 Units Crates
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActiveStopIdx(1);
                            setScreen('stop-detail');
                          }}
                          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-all shadow-xs"
                        >
                          Open Stop 1
                        </button>
                      </div>

                      {/* Stop 2 */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between opacity-90">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                            2
                          </span>
                          <div>
                            <strong className="text-sm text-slate-800">OUT079 : Kandy Fresh</strong>
                            <div className="text-xs text-slate-500">
                              Window: 4.00AM:7.45AM • 15 Crates
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActiveStopIdx(2);
                            setScreen('stop-detail');
                          }}
                          className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition-all"
                        >
                          Open Stop 2
                        </button>
                      </div>

                      {/* Stop 3 */}
                      <div className="p-4 rounded-2xl border border-slate-200 bg-white flex items-center justify-between opacity-90">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                            3
                          </span>
                          <div>
                            <strong className="text-sm text-slate-800">OUT080 : Kadugannawa</strong>
                            <div className="text-xs text-slate-500">
                              Window: 5.30AM:8.00AM • 14 Crates
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setActiveStopIdx(3);
                            setScreen('stop-detail');
                          }}
                          className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 transition-all"
                        >
                          Open Stop 3
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 2: TODAY'S STOPS (Expanded Timeline View) */}
          {/* ========================================================= */}
          {screen === 'stops-list' && (
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('route');
                      setScreen('home');
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-700" />
                  </button>
                  <h1 className="text-lg font-black text-slate-900">Today&apos;s Delivery Manifest</h1>
                </div>

                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Route WF-1043 (VEH057)
                </span>
              </div>

              {/* Depot Origin */}
              <div className="text-center text-xs font-bold text-slate-700 bg-white border border-slate-200 py-3 rounded-2xl shadow-xs flex items-center justify-center gap-2">
                <span>🏭</span>
                <span>Depot Departure: Kandy Central DC (04:45 AM)</span>
              </div>

              <div className="text-center text-slate-400 -my-2 font-bold text-base">↓</div>

              {/* Stop 1 Card */}
              <div className="bg-white border-2 border-blue-600 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <strong className="text-base text-slate-900">OUT077 : Kandy Fresh</strong>
                      <span className="text-xs text-slate-500 block">Van Only Parking Dock • Street Access</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    🟢 Next
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-600 border-t pt-2">
                  <span>Delivery Window</span>
                  <strong className="text-slate-900">5.00AM:7.30AM</strong>
                </div>

                <button
                  onClick={() => {
                    setActiveStopIdx(1);
                    setScreen('stop-detail');
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-xs"
                >
                  Open Stop #1 Details & Checklist
                </button>
              </div>

              <div className="text-center text-slate-400 -my-2 font-bold text-base">↓</div>

              {/* Stop 2 Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <strong className="text-base text-slate-800">OUT079 : Kandy Fresh</strong>
                      <span className="text-xs text-slate-500 block">Rear Dock • Peradeniya Road</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    ○ Upcoming
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-600 border-t pt-2">
                  <span>Delivery Window</span>
                  <strong className="text-slate-700">4.00AM:7.45AM</strong>
                </div>

                <button
                  onClick={() => {
                    setActiveStopIdx(2);
                    setScreen('stop-detail');
                  }}
                  className="w-full py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition-all"
                >
                  Open Stop #2
                </button>
              </div>

              <div className="text-center text-slate-400 -my-2 font-bold text-base">↓</div>

              {/* Stop 3 Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <div>
                      <strong className="text-base text-slate-800">OUT080 : Kadugannawa Express</strong>
                      <span className="text-xs text-slate-500 block">Main Street Front Door</span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    ○ Upcoming
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-600 border-t pt-2">
                  <span>Delivery Window</span>
                  <strong className="text-slate-700">5.30AM:8.00AM</strong>
                </div>

                <button
                  onClick={() => {
                    setActiveStopIdx(3);
                    setScreen('stop-detail');
                  }}
                  className="w-full py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition-all"
                >
                  Open Stop #3
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 3: STOP DETAIL (Items Table & Delivery Info) */}
          {/* ========================================================= */}
          {screen === 'stop-detail' && (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Stop Workflow Stepper Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px] border border-blue-200">
                      Stop {activeStop.num} of 3
                    </span>
                    <strong className="text-slate-900 text-sm">{activeStop.name} ({activeStop.outletId})</strong>
                  </div>
                  <span className="text-slate-500 font-semibold">
                    Phase 1 of 3: Manifest Inspection
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setScreen('stop-detail')}
                    className="py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-blue-600 text-white shadow-xs cursor-pointer"
                  >
                    <span>1. Manifest Review</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen('en-route')}
                    className="py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    <span>2. En Route</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen('complete-delivery')}
                    className="py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    <span>3. Digital POD</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setActiveTab('stops');
                      setScreen('stops-list');
                    }}
                    className="p-2 rounded-xl hover:bg-slate-100 border border-slate-200 transition-all"
                    title="Back to Stops List"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                  </button>
                  <div>
                    <h1 className="text-lg font-black text-slate-900">
                      {activeStop.outletId} : {activeStop.name}
                    </h1>
                    <span className="text-xs text-slate-500 font-semibold">
                      Stop {activeStop.num} of 3 • {activeStop.location}
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span>Stop Active</span>
                </span>
              </div>

              {/* 2-Column Responsive Layout on Desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Left: Delivery Info & Shortfall Notice */}
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs shadow-xs">
                    <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                      DELIVERY INFORMATION
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Order ID</span>
                      <strong className="text-slate-900 font-mono">{activeStop.orderId}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Delivery Window</span>
                      <strong className="text-slate-900">{activeStop.window}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Assigned Vehicle</span>
                      <strong className="text-slate-900">{activeStop.vehicle}</strong>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Dock Type</span>
                      <strong className="text-slate-900">{activeStop.dockType}</strong>
                    </div>
                  </div>

                  {/* Shortfall Alert (if present) */}
                  {activeStop.shortfallAlert && (
                    <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-4 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-[#B45309]">
                        <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                        <span>Loading Shortfall Alert</span>
                      </div>
                      <div className="font-bold text-slate-900">
                        {activeStop.shortfallAlert.item}: {activeStop.shortfallAlert.planned - activeStop.shortfallAlert.available} units unavailable
                      </div>
                      <div className="text-[#B45309] leading-relaxed">
                        {activeStop.shortfallAlert.note}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Items Manifest Table */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                      ITEM MANIFEST VERIFICATION
                    </span>
                    <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {activeStop.totalCrates} Crates Total
                    </span>
                  </div>
                  <div className="grid grid-cols-3 font-bold text-slate-400 text-[11px] border-b pb-2">
                    <span>PRODUCT</span>
                    <span className="text-center">PLANNED</span>
                    <span className="text-right">AVAILABLE</span>
                  </div>
                  {activeStop.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-3 py-2 border-b border-slate-100 last:border-0 font-semibold items-center">
                      <span className="text-slate-900">{item.product}</span>
                      <span className="text-center text-slate-600">{item.planned}</span>
                      <span className={`text-right font-bold ${item.status.includes('⚠️') ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('stops');
                    setScreen('stops-list');
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                  <span>Back to Today&apos;s Stops</span>
                </button>

                <div className="text-xs text-slate-500 font-semibold hidden sm:block">
                  Stop {activeStop.num} of 3 • Step 1: Manifest
                </div>

                <button
                  type="button"
                  onClick={() => setScreen('en-route')}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Proceed to En Route Transit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 4: EN ROUTE (Transit & Map Visual) */}
          {/* ========================================================= */}
          {screen === 'en-route' && (
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Stop Workflow Stepper Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px] border border-blue-200">
                      Stop {activeStop.num} of 3
                    </span>
                    <strong className="text-slate-900 text-sm">{activeStop.name} ({activeStop.outletId})</strong>
                  </div>
                  <span className="text-slate-500 font-semibold">
                    Phase 2 of 3: Active Transit
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setScreen('stop-detail')}
                    className="py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>1. Manifest Review</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen('en-route')}
                    className="py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-blue-600 text-white shadow-xs cursor-pointer"
                  >
                    <span>2. En Route</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen('complete-delivery')}
                    className="py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                  >
                    <span>3. Digital POD</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setScreen('stop-detail')}
                    className="p-2 rounded-xl hover:bg-slate-100 border border-slate-200 transition-all"
                    title="Back to Manifest"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                  </button>
                  <div>
                    <h1 className="text-lg font-black text-slate-900">
                      {activeStop.outletId} : {activeStop.name}
                    </h1>
                    <span className="text-xs text-slate-500 font-semibold">En Route in Mountain Corridor</span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-amber-50 border border-amber-300 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>En Route</span>
                </span>
              </div>

              {/* Trip Information Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-xs shadow-xs">
                <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  TRIP INFORMATION
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Live Estimated Arrival (ETA)</span>
                  <strong className="text-blue-600 text-base font-bold">7.12AM</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Delivery Window</span>
                  <strong className="text-slate-900">{activeStop.window}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Destination Dock</span>
                  <strong className="text-slate-900">{activeStop.dockType}</strong>
                </div>
              </div>

              {/* Dark Route Card from Figma */}
              <div className="bg-[#0E1626] text-white rounded-3xl p-6 space-y-4 font-semibold text-sm shadow-md">
                <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  LIVE ROUTE TRANSIT
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏭</span>
                  <span>Kandy Central Depot (Departed 04:50 AM)</span>
                </div>
                <div className="text-slate-500 pl-3">↓</div>
                <div className="flex items-center gap-3 text-blue-400 font-bold">
                  <span className="text-xl">🚚</span>
                  <span>Current Roadside Location (Kandy Hill Road)</span>
                </div>
                <div className="text-slate-500 pl-3">↓</div>
                <div className="flex items-center gap-3 text-emerald-400 font-bold">
                  <span className="text-xl">📍</span>
                  <span>Destination: {activeStop.outletId} {activeStop.name}</span>
                </div>
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setScreen('stop-detail')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                  <span>Back to Manifest Inspection</span>
                </button>

                <div className="text-xs text-slate-500 font-semibold hidden sm:block">
                  Stop {activeStop.num} of 3 • Step 2: Transit
                </div>

                <button
                  type="button"
                  onClick={() => setScreen('complete-delivery')}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>I&apos;ve Arrived at Store Dock (Sign POD)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 5: COMPLETE DELIVERY & DIGITAL POD */}
          {/* ========================================================= */}
          {screen === 'complete-delivery' && (
            <div className="max-w-3xl mx-auto space-y-4">
              {/* Stop Workflow Stepper Bar */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold text-[11px] border border-blue-200">
                      Stop {activeStop.num} of 3
                    </span>
                    <strong className="text-slate-900 text-sm">
                      {activeStop.name} ({activeStop.outletId})
                    </strong>
                  </div>
                  <span className="text-slate-500 font-semibold">
                    Phase 3 of 3: Proof of Delivery (POD)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setScreen('stop-detail')}
                    className="py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>1. Manifest Review</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen('en-route')}
                    className="py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>2. En Route</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScreen('complete-delivery')}
                    className="py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 bg-blue-600 text-white shadow-xs cursor-pointer"
                  >
                    <span>3. Digital POD</span>
                  </button>
                </div>
              </div>

              {/* Stop Title Card */}
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setScreen('en-route')}
                    className="p-2 rounded-xl hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer"
                    title="Back to En Route"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                  </button>
                  <div>
                    <h1 className="text-lg font-black text-slate-900">
                      {activeStop.outletId} : {activeStop.name}
                    </h1>
                    <span className="text-xs text-slate-500 font-semibold">
                      Proof of Delivery (POD) • {activeStop.location}
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                  <span>At Store Dock</span>
                </span>
              </div>

              {/* Offline Warning Banner if disconnected */}
              {isOffline && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-xs text-amber-800">
                  <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <strong className="block font-bold">Offline Resilience Active</strong>
                    <span className="text-amber-700">
                      Mountain dead zone detected. Digital signature &amp; delivery confirmation will be safely saved in local IndexedDB and synced upon reconnection.
                    </span>
                  </div>
                </div>
              )}

              {/* Responsive 2-Column Grid on Desktop, 1-Column on Mobile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Left Column: Delivery & Manifest Summary */}
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs shadow-xs">
                    <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                      RECEIVING STORE DETAILS
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Store Manager</span>
                      <strong className="text-slate-900">{activeStop.manager}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Order ID</span>
                      <strong className="text-slate-900 font-mono">{activeStop.orderId}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Assigned Vehicle</span>
                      <strong className="text-slate-900">{activeStop.vehicle}</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Delivery Window</span>
                      <strong className="text-emerald-700 font-bold">{activeStop.window} (On Time)</strong>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Crates Handed Over</span>
                      <strong className="text-blue-600 font-extrabold text-sm">
                        {activeStop.totalCrates} Crates Total
                      </strong>
                    </div>
                  </div>

                  {/* Discrepancy Note or Shortfall Alert */}
                  {activeStop.shortfallAlert && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Pre-Applied Loading Discrepancy</span>
                      </div>
                      <p className="text-amber-800 leading-relaxed pl-5">
                        {activeStop.shortfallAlert.note}
                      </p>
                    </div>
                  )}

                  {/* Optional Driver Discrepancy Input */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-xs shadow-xs">
                    <label className="block text-xs font-bold text-slate-700">
                      Dock Discrepancy or Receiving Note (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="e.g. Received all crates in sound condition, 0 damages..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>

                {/* Right Column: Digital Signature & Confirmation */}
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                        DIGITAL PROOF OF DELIVERY
                      </span>
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        Stylus or Touch
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      Store Manager <strong className="text-slate-900">{activeStop.manager}</strong> must sign below to confirm handover of goods:
                    </p>

                    <SignaturePad
                      onSave={(dataUrl) => setSignatureData(dataUrl)}
                      onClear={() => setSignatureData(null)}
                    />

                    {signatureData ? (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Digital Signature Captured &amp; Encoded</span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs font-medium flex items-center gap-2">
                        <PenTool className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Please draw signature above to unlock confirmation</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleConfirmDelivery}
                      disabled={!signatureData}
                      className={`w-full py-3.5 px-4 font-extrabold rounded-xl text-xs sm:text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isOffline
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      } disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                      {isOffline ? (
                        <>
                          <WifiOff className="w-4 h-4" />
                          <span>Save Delivery to Offline Queue (IndexedDB)</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Confirm Delivery &amp; Complete Stop</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setScreen('en-route')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                  <span>Back to En Route Transit</span>
                </button>

                <div className="text-xs text-slate-500 font-semibold hidden sm:block">
                  Stop {activeStop.num} of 3 • Step 3: Digital POD
                </div>

                <div className="text-xs text-slate-400 font-medium italic">
                  Digital POD required before stop clearance
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 6: DELIVERY SUCCESS */}
          {/* ========================================================= */}
          {screen === 'delivery-success' && (
            <div className="max-w-2xl mx-auto py-8 space-y-6">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-lg">
                <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm animate-bounce">
                  <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full inline-block">
                    Stop {activeStop.num} Completed Successfully
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Delivery Confirmed!
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    Proof of delivery and digital handover for <strong className="text-slate-800">{activeStop.outletId} ({activeStop.name})</strong> has been recorded.
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 text-left max-w-md mx-auto">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Order ID:</span>
                    <strong className="text-slate-900 font-mono">{activeStop.orderId}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Received By:</span>
                    <strong className="text-slate-900">{activeStop.manager}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Crates Handed Over:</span>
                    <strong className="text-emerald-700 font-bold">{activeStop.totalCrates} Crates (Verified)</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">Sync Status:</span>
                    <strong className={isOffline ? 'text-amber-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {isOffline ? 'Saved to Offline Queue (Dexie.js)' : 'Synced to Cloud (Live)'}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Timestamp:</span>
                    <strong className="text-slate-900 font-mono">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Punctual)
                    </strong>
                  </div>

                  {signatureData && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                        Captured Signature:
                      </span>
                      <div className="h-16 bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={signatureData} alt="Store Manager Signature" className="max-h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                  {activeStopIdx < 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const nextIdx = activeStopIdx + 1;
                        setActiveStopIdx(nextIdx);
                        setSignatureData(null);
                        setDeliveryNotes('');
                        setScreen('stop-detail');
                      }}
                      className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Next Stop (Stop {activeStopIdx + 1})</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('route');
                        setScreen('home');
                      }}
                      className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>All 3 Stops Completed! Return to Depot</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('stops');
                      setScreen('stops-list');
                    }}
                    className="w-full sm:w-auto px-5 py-3.5 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                  >
                    <span>View All Stops</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 7: OFFLINE MODE (No Internet Connection) */}
          {/* ========================================================= */}
          {screen === 'offline-mode' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <button onClick={() => setScreen('home')} className="p-1 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                  </button>
                  <h1 className="text-lg font-black text-slate-900">Field Connectivity: Dead Zone</h1>
                </div>

                <button
                  type="button"
                  onClick={handleSyncOfflineQueue}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check &amp; Sync Connection</span>
                </button>
              </div>

              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 flex items-center gap-2 text-xs font-bold text-[#991B1B]">
                <span className="text-red-500 text-base">🔴</span>
                <span>No Internet Connection Detected</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-xs shadow-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Last Synced to Waypoint Cloud</span>
                  <strong className="text-slate-900 font-mono">06:42 AM</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Pending Local Changes</span>
                  <strong className="text-red-600 font-bold">1 Delivery Buffered in IndexedDB</strong>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs text-xs">
                <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  DRIVER CAN STILL SAFELY EXECUTE
                </div>
                {[
                  "View today's entire route manifest",
                  'Inspect all stop delivery windows and dock constraints',
                  'View order item counts and product manifests',
                  'Record stop delivery status and timestamps',
                  'Capture customer signatures on digital touch pad',
                  'Continue multi-stop trip without blocking',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-emerald-700 font-bold">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 text-center leading-relaxed">
                You&apos;re currently operating offline. All signatures and delivery receipts are buffered locally in browser IndexedDB and will auto-reconcile once signal is restored.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setScreen('home')}
                  className="w-full sm:w-1/2 py-3.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                  <span>Back to Route Overview</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScreen('complete-delivery')}
                  className="w-full sm:w-1/2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue Delivery (Offline)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 8: SYNC STATUS (Reconciliation Complete) */}
          {/* ========================================================= */}
          {screen === 'sync-status' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <h1 className="text-xl font-black text-slate-900">Sync & Reconciliation Status</h1>

              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#166534]">
                  <span>🟢</span>
                  <span>4G Cellular Connection Restored</span>
                </div>
                <div className="text-slate-600 ml-5">
                  Synchronizing buffered delivery records with central Waypoint dispatch server...
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs text-xs">
                <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  SYNC PROGRESS RECONCILIATION
                </div>
                {[
                  'Delivery record verified against dispatcher schedule',
                  'POD digital signature synchronized to cloud storage',
                  'Delivery status updated to COMPLETED',
                  'Route telemetry restored and GPS lock refreshed',
                ].map((s) => (
                  <div key={s} className="flex items-center gap-2.5 text-emerald-700 font-bold">
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between text-xs font-bold">
                <span className="text-blue-800 flex items-center gap-2">
                  <span>✅</span>
                  <span>All changes synced successfully</span>
                </span>
                <span className="text-slate-500 font-mono text-[11px]">Last synced 06:48 AM</span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('stops');
                    setScreen('stops-list');
                  }}
                  className="w-full sm:w-1/2 py-3.5 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-500" />
                  <span>View Today&apos;s Stops</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('route');
                    setScreen('home');
                  }}
                  className="w-full sm:w-1/2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span>Continue Active Route</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 9: SETTINGS */}
          {/* ========================================================= */}
          {screen === 'settings' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h1 className="text-xl font-black text-slate-900">Driver Profile & Settings</h1>
                <p className="text-xs text-slate-500">Kasun Bandara • Senior Transport Driver</p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-xs">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 font-black text-xl flex items-center justify-center">
                  KB
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Kasun Bandara</h3>
                  <p className="text-xs text-slate-500">
                    Assigned Vehicle: <strong>VEH057</strong> • Isuzu N-Series Refrigerated Van
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-xs text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400 p-3.5 pb-1 tracking-wider">
                  DRIVER CONTROLS
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                  <span className="font-semibold text-slate-800 flex items-center gap-2.5">
                    <span>📄</span>
                    <span>Trip History & Completed POD Logs</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                  <span className="font-semibold text-slate-800 flex items-center gap-2.5">
                    <span>⚙️</span>
                    <span>App Preferences & Offline Storage Settings</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                  <span className="font-semibold text-slate-800 flex items-center gap-2.5">
                    <span>🛟</span>
                    <span>Help & Operational Support Helpline</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <div
                  onClick={handleLogout}
                  className="p-4 flex items-center justify-between hover:bg-red-50 text-red-600 cursor-pointer"
                >
                  <span className="font-bold flex items-center gap-2.5">
                    <span>🚪</span>
                    <span>Sign Out of Driver Session</span>
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar (Visible on mobile viewports only) */}
      <footer className="md:hidden bg-white border-t border-slate-200 py-3 px-6 flex items-center justify-around sticky bottom-0 z-30">
        <button
          type="button"
          onClick={() => {
            setActiveTab('route');
            setScreen('home');
          }}
          className={`flex flex-col items-center gap-1 text-xs font-bold transition-all ${
            activeTab === 'route' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="text-base">{activeTab === 'route' ? '●' : '○'}</span>
          <span>Route</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('stops');
            setScreen('stops-list');
          }}
          className={`flex flex-col items-center gap-1 text-xs font-bold transition-all ${
            activeTab === 'stops' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="text-base">{activeTab === 'stops' ? '●' : '○'}</span>
          <span>Stops</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('settings');
            setScreen('settings');
          }}
          className={`flex flex-col items-center gap-1 text-xs font-bold transition-all ${
            activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="text-base">{activeTab === 'settings' ? '●' : '○'}</span>
          <span>Settings</span>
        </button>
      </footer>
    </div>
  );
}
