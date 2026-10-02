'use client';

import React, { useState } from 'react';
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
  Smartphone,
  Monitor,
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

export default function DriverResponsiveApp() {
  const router = useRouter();
  const [screen, setScreen] = useState<DriverScreen>('home');
  const [activeTab, setActiveTab] = useState<'route' | 'stops' | 'settings'>('route');
  const [isOffline, setIsOffline] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [activeStopIdx, setActiveStopIdx] = useState(1);
  const [viewportMode, setViewportMode] = useState<'responsive' | 'phone'>('responsive');

  const handleSimulateConnectionLoss = () => {
    setIsOffline(true);
    setScreen('offline-mode');
  };

  const handleSimulateReconnect = () => {
    setIsOffline(false);
    setScreen('sync-status');
  };

  const handleConfirmDelivery = async () => {
    if (!signatureData) {
      alert('Please have the store manager sign on the digital pad before confirming.');
      return;
    }

    if (isOffline) {
      await offlineDb.offlineActions.add({
        actionId: `OFFLINE-${Date.now()}`,
        tripId: 'TRIP-WF-1043',
        stopId: activeStopIdx,
        outletId: activeStopIdx === 1 ? 'OUT077' : activeStopIdx === 2 ? 'OUT079' : 'OUT080',
        status: 'DELIVERED',
        discrepancyNote: 'Milk short by 3 units (loading issue recorded)',
        signatureData,
        offlineTimestamp: new Date().toISOString(),
        synced: false,
      });
    }

    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#10B981', '#38BDF8'],
    });

    setScreen('delivery-success');
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

          {/* Right Tools: Viewport Toggle, Online/Offline Simulator & Logout */}
          <div className="flex items-center gap-2.5">
            {/* Desktop / Phone Preview Toggle */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewportMode('responsive')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewportMode === 'responsive'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Full Responsive Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px]">Web Responsive</span>
              </button>
              <button
                type="button"
                onClick={() => setViewportMode('phone')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewportMode === 'phone'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Simulate Mobile Viewport"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px]">Phone Frame</span>
              </button>
            </div>

            {/* Network Simulator Pill */}
            {isOffline ? (
              <button
                type="button"
                onClick={handleSimulateReconnect}
                className="px-3 py-1.5 bg-rose-50 border border-rose-300 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-rose-100 transition-all"
              >
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Offline Mode</span>
                <span className="underline ml-1">Reconnect</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSimulateConnectionLoss}
                className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs hover:bg-emerald-100 transition-all"
              >
                <Wifi className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">4G Cellular</span>
                <span className="text-slate-400 font-normal hidden sm:inline">•</span>
                <span className="text-xs text-rose-600 font-semibold underline">Simulate Drop</span>
              </button>
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

      {/* Main Container - Wraps in phone frame ONLY when Phone mode is toggled, otherwise 100% full responsive web! */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-center">
        <div
          className={`w-full transition-all duration-300 ${
            viewportMode === 'phone'
              ? 'max-w-[420px] bg-white rounded-[38px] shadow-2xl border-8 border-slate-900 p-4 sm:p-5 overflow-hidden'
              : 'max-w-6xl'
          }`}
        >
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
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-3">
                  <button onClick={() => setScreen('stops-list')} className="p-1.5 rounded-lg hover:bg-slate-100">
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                  </button>
                  <div>
                    <h1 className="text-lg font-black text-slate-900">
                      OUT077 : Kandy Fresh
                    </h1>
                    <span className="text-xs text-slate-500 font-semibold">Stop 1 of 3</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateConnectionLoss}
                  className="px-3 py-1.5 bg-rose-50 border border-rose-300 text-rose-700 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 transition-all"
                >
                  <span>📶</span>
                  <span>Simulate Connection Loss</span>
                </button>
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
                      <strong className="text-slate-900 font-mono">WF-1043</strong>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Delivery Window</span>
                      <strong className="text-slate-900">3.00AM:8.00AM</strong>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-slate-500">Assigned Vehicle</span>
                      <strong className="text-slate-900">VEH057 (Van Reefer)</strong>
                    </div>
                  </div>

                  {/* Amber Alert */}
                  <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-4 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[#B45309]">
                      <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                      <span>Loading Shortfall Alert</span>
                    </div>
                    <div className="font-bold text-slate-900">Milk: 3 units unavailable</div>
                    <div className="text-[#B45309]">
                      Warehouse logged shortage during LIFO bay staging. Credit note pre-applied.
                    </div>
                  </div>
                </div>

                {/* Right: Items Manifest Table */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs text-xs">
                  <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                    ITEM MANIFEST VERIFICATION
                  </div>
                  <div className="grid grid-cols-3 font-bold text-slate-400 text-[11px] border-b pb-2">
                    <span>PRODUCT</span>
                    <span className="text-center">PLANNED</span>
                    <span className="text-right">AVAILABLE</span>
                  </div>
                  <div className="grid grid-cols-3 py-2 border-b border-slate-100 font-semibold items-center">
                    <span className="text-slate-900">Milk (20L Crate)</span>
                    <span className="text-center text-slate-600">18</span>
                    <span className="text-right text-amber-600 font-bold">15 ⚠️</span>
                  </div>
                  <div className="grid grid-cols-3 py-2 border-b border-slate-100 font-semibold items-center">
                    <span className="text-slate-900">Yogurt (12x500g)</span>
                    <span className="text-center text-slate-600">10</span>
                    <span className="text-right text-emerald-600 font-bold">10 ✓</span>
                  </div>
                  <div className="grid grid-cols-3 py-2 border-b border-slate-100 font-semibold items-center">
                    <span className="text-slate-900">Fresh Vegetables</span>
                    <span className="text-center text-slate-600">8</span>
                    <span className="text-right text-emerald-600 font-bold">8 ✓</span>
                  </div>
                  <div className="grid grid-cols-3 py-2 font-semibold items-center">
                    <span className="text-slate-900">Frozen Chicken</span>
                    <span className="text-center text-slate-600">4 kg</span>
                    <span className="text-right text-emerald-600 font-bold">4 ✓</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => setScreen('en-route')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Navigate to Stop & Begin Transit</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 4: EN ROUTE (Transit & Map Visual) */}
          {/* ========================================================= */}
          {screen === 'en-route' && (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <button onClick={() => setScreen('stop-detail')} className="p-1 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                  </button>
                  <div>
                    <h1 className="text-lg font-black text-slate-900">
                      OUT077 : Kandy Fresh
                    </h1>
                    <span className="text-xs text-slate-500 font-semibold">En Route in Mountain Corridor</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateConnectionLoss}
                  className="px-3 py-1.5 bg-rose-50 border border-rose-300 text-rose-700 rounded-full text-xs font-bold flex items-center gap-1"
                >
                  <span>📶</span>
                  <span>Simulate Connection Loss</span>
                </button>
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
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Delivery Window</span>
                  <strong className="text-slate-900">5.00AM-7.30AM</strong>
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
                  <span>Destination: OUT077 Kandy Fresh</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setScreen('complete-delivery')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
                >
                  I&apos;ve Arrived at Store Dock
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 5: COMPLETE DELIVERY (Proof of Delivery & Signature) */}
          {/* ========================================================= */}
          {screen === 'complete-delivery' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2">
                  <button onClick={() => setScreen('en-route')} className="p-1 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                  </button>
                  <h1 className="text-lg font-black text-slate-900">Complete Delivery & Digital Receipt</h1>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateConnectionLoss}
                  className="px-3 py-1.5 bg-rose-50 border border-rose-300 text-rose-700 rounded-full text-xs font-bold flex items-center gap-1"
                >
                  <span>📶</span>
                  <span>Simulate Connection Loss</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {/* Left: Quantity reconciliation table */}
                <div className="space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1 text-xs shadow-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Receiving Store</span>
                      <strong className="text-slate-900">OUT077 : Kandy Fresh</strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Order ID</span>
                      <strong className="text-slate-900 font-mono">WF-1043</strong>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-xs text-xs">
                    <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                      DELIVERY QUANTITY RECONCILIATION
                    </div>
                    <div className="grid grid-cols-3 font-bold text-slate-400 text-[11px] border-b pb-1.5">
                      <span>PRODUCT</span>
                      <span className="text-center">EXPECTED</span>
                      <span className="text-right">DELIVERED</span>
                    </div>
                    <div className="grid grid-cols-3 py-2 border-b border-slate-100 font-semibold items-center">
                      <span className="text-slate-900">Milk</span>
                      <span className="text-center text-slate-600">18</span>
                      <span className="text-right text-amber-600 font-bold flex items-center justify-end gap-1">
                        15 ⚠️
                      </span>
                    </div>
                    <div className="grid grid-cols-3 py-2 border-b border-slate-100 font-semibold items-center">
                      <span className="text-slate-900">Yogurt</span>
                      <span className="text-center text-slate-600">10</span>
                      <span className="text-right text-emerald-600 font-bold">10 ✓</span>
                    </div>
                    <div className="grid grid-cols-3 py-2 border-b border-slate-100 font-semibold items-center">
                      <span className="text-slate-900">Vegetables</span>
                      <span className="text-center text-slate-600">8</span>
                      <span className="text-right text-emerald-600 font-bold">8 ✓</span>
                    </div>
                    <div className="grid grid-cols-3 py-2 font-semibold items-center">
                      <span className="text-slate-900">Chilled Chicken</span>
                      <span className="text-center text-slate-600">4</span>
                      <span className="text-right text-emerald-600 font-bold">4 ✓</span>
                    </div>
                  </div>

                  <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-3.5 text-xs flex items-center gap-2 font-bold text-[#B45309]">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-[#B45309]" />
                    <span>3 units of Milk short (Verified and agreed with store staff)</span>
                  </div>
                </div>

                {/* Right: Signature Pad & Receiver Confirmation */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs text-xs">
                  <div className="flex items-center justify-between">
                    <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                      RECEIVER SIGN-OFF & POD
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      Store Manager: Aravinda Silva
                    </span>
                  </div>

                  <SignaturePad
                    onSave={(dataUrl) => setSignatureData(dataUrl)}
                    onClear={() => setSignatureData(null)}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Delivery notes & condition (optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Received in good condition at rear dock..."
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    onClick={handleConfirmDelivery}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
                  >
                    Confirm Delivery & Record POD
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SCREEN 6: DELIVERY COMPLETED (Success Screen) */}
          {/* ========================================================= */}
          {screen === 'delivery-success' && (
            <div className="max-w-md mx-auto py-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-md">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div>
                <h1 className="text-2xl font-black text-slate-900">Delivery Completed!</h1>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  OUT077 : Kandy Fresh • Order WF-1043
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs text-left text-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Proof of Delivery (e-POD) Cryptographically Captured</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Delivery Recorded in Local Buffer & Dispatched</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Stop Status: Delivered (Discrepancy Reconciled)</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveTab('stops');
                  setScreen('stops-list');
                }}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-md shadow-blue-500/25 active:scale-[0.98] transition-all"
              >
                Proceed to Next Stop
              </button>
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
                  onClick={handleSimulateReconnect}
                  className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-all"
                >
                  <span>🔄</span>
                  <span>Simulate Reconnect (4G Active)</span>
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

              <button
                onClick={() => setScreen('complete-delivery')}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-md active:scale-[0.98] transition-all"
              >
                Continue Delivery in Offline Mode
              </button>
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

              <button
                onClick={() => {
                  setActiveTab('route');
                  setScreen('home');
                }}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-sm shadow-md active:scale-[0.98] transition-all"
              >
                Continue Route
              </button>
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
