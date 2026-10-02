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

export default function DriverMobileFigmaApp() {
  const router = useRouter();
  const [screen, setScreen] = useState<DriverScreen>('home');
  const [activeTab, setActiveTab] = useState<'route' | 'stops' | 'settings'>('route');
  const [isOffline, setIsOffline] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [activeStopIdx, setActiveStopIdx] = useState(1); // 1 = OUT077, 2 = OUT079, 3 = OUT080

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
      alert('Please have the store manager sign before confirming.');
      return;
    }

    if (isOffline) {
      // Store in local IndexedDB
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
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex justify-center py-6 px-2">
      {/* Smartphone Frame Container (Figma 390x844 specification) */}
      <div className="w-full max-w-[420px] bg-[#F8FAFC] min-h-[844px] flex flex-col rounded-[38px] shadow-2xl border-8 border-slate-900 overflow-hidden relative">
        
        {/* iOS / Smartphone Status Bar Notch */}
        <div className="bg-slate-900 text-white text-[11px] font-bold px-6 py-1 flex items-center justify-between">
          <span>9:41</span>
          <div className="w-24 h-4 bg-black rounded-b-xl mx-auto -mt-1" />
          <div className="flex items-center gap-1.5">
            {isOffline ? (
              <span className="text-red-400 font-bold flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> No Net
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <Wifi className="w-3 h-3" /> 4G
              </span>
            )}
            <span>100%</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SCREEN 1: GOOD MORNING, KASUN (Page 16 in Figma) */}
        {/* ========================================================= */}
        {screen === 'home' && (
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Good Morning, Kasun
                </h1>
                <p className="text-xs font-semibold text-slate-500">Driver</p>
              </div>

              {/* Main White Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                <h2 className="text-base font-extrabold text-slate-900">
                  Kandy Fresh Route
                </h2>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Vehicle</span>
                    <strong className="text-slate-900">VEH057</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Vehicle Type</span>
                    <strong className="text-slate-900">Refrigerated Van</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Starting Depot</span>
                    <strong className="text-slate-900">Kandy Depot</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Departure</span>
                    <strong className="text-slate-900">4.45AM</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Stops</span>
                    <strong className="text-slate-900">3</strong>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-medium">Delivery Window</span>
                    <strong className="text-blue-600">Before 8:00 AM</strong>
                  </div>
                </div>
              </div>

              {/* Amber Notification Banner */}
              <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-4 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#B45309]">
                  <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                  <span>Loading Shortfall</span>
                </div>
                <div className="font-bold text-slate-900">
                  Milk 18 planned → 15 available
                </div>
                <div className="text-[#B45309]">3 units unavailable</div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-4">
              <button
                onClick={() => {
                  setActiveTab('stops');
                  setScreen('stops-list');
                }}
                className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
              >
                Start Route
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 2: TODAY'S STOPS (Page 17 in Figma) */}
        {/* ========================================================= */}
        {screen === 'stops-list' && (
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveTab('route');
                    setScreen('home');
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-200"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-700" />
                </button>
                <h1 className="text-xl font-black text-slate-900">Today&apos;s Stops</h1>
              </div>

              {/* Depot Origin */}
              <div className="text-center text-xs font-bold text-slate-600 bg-white border border-slate-200 py-2.5 rounded-xl shadow-xs flex items-center justify-center gap-2">
                <span>🏭</span>
                <span>Kandy Depot</span>
              </div>

              <div className="text-center text-slate-400 -my-2 font-bold text-sm">↓</div>

              {/* Stop 1 Card (Active Blue Card) */}
              <div className="bg-white border-2 border-blue-600 rounded-3xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <span className="font-extrabold text-sm text-slate-900">
                      OUT077 : Kandy
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    🟢 Next
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Delivery Window</span>
                  <strong className="text-slate-900">5.00AM:7.30AM</strong>
                </div>

                <button
                  onClick={() => {
                    setActiveStopIdx(1);
                    setScreen('stop-detail');
                  }}
                  className="w-full py-2.5 border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-xl text-xs transition-all"
                >
                  Open Stop
                </button>
              </div>

              <div className="text-center text-slate-400 -my-2 font-bold text-sm">↓</div>

              {/* Stop 2 Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3 opacity-90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <span className="font-bold text-sm text-slate-800">
                      OUT079 : Kandy
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    ○ Upcoming
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Delivery Window</span>
                  <strong className="text-slate-700">4.00AM:7.45AM</strong>
                </div>

                <button
                  onClick={() => {
                    setActiveStopIdx(2);
                    setScreen('stop-detail');
                  }}
                  className="w-full py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition-all"
                >
                  Open Stop
                </button>
              </div>

              <div className="text-center text-slate-400 -my-2 font-bold text-sm">↓</div>

              {/* Stop 3 Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm space-y-3 opacity-90">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <span className="font-bold text-sm text-slate-800">
                      OUT080 : Kandy
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    ○ Upcoming
                  </span>
                </div>

                <div className="flex justify-between text-xs text-slate-500">
                  <span>Delivery Window</span>
                  <strong className="text-slate-700">5.30AM:8.00AM</strong>
                </div>

                <button
                  onClick={() => {
                    setActiveStopIdx(3);
                    setScreen('stop-detail');
                  }}
                  className="w-full py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition-all"
                >
                  Open Stop
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 3: STOP DETAIL (Page 18 in Figma) */}
        {/* ========================================================= */}
        {screen === 'stop-detail' && (
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setScreen('stops-list')} className="p-1 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                  </button>
                  <div>
                    <h1 className="text-lg font-black text-slate-900">
                      OUT077 : Kandy Fresh
                    </h1>
                    <span className="text-xs text-slate-500 font-semibold">Stop 1 of 3</span>
                  </div>
                </div>

                {/* Simulate Connection Loss Button */}
                <button
                  type="button"
                  onClick={handleSimulateConnectionLoss}
                  className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-[11px] font-bold flex items-center gap-1 hover:bg-rose-100 transition-all"
                >
                  <span>📶</span>
                  <span>Simulate Connection Loss</span>
                </button>
              </div>

              {/* Delivery Information Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-xs shadow-xs">
                <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  DELIVERY INFORMATION
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Order</span>
                  <strong className="text-slate-900">WF-1043</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Delivery Window</span>
                  <strong className="text-slate-900">3.00AM:8.00AM</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Vehicle</span>
                  <strong className="text-slate-900">VEH057</strong>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs text-xs">
                <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">ITEMS</div>
                <div className="grid grid-cols-3 font-bold text-slate-400 text-[11px] border-b pb-1.5">
                  <span>PRODUCT</span>
                  <span className="text-center">PLANNED</span>
                  <span className="text-right">AVAILABLE</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-100 font-semibold">
                  <span className="text-slate-900">Milk</span>
                  <span className="text-center text-slate-600">18</span>
                  <span className="text-right text-amber-600 font-bold">15</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-100 font-semibold">
                  <span className="text-slate-900">Yogurt</span>
                  <span className="text-center text-slate-600">10</span>
                  <span className="text-right text-emerald-600 font-bold">10</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-100 font-semibold">
                  <span className="text-slate-900">Vegetables</span>
                  <span className="text-center text-slate-600">8</span>
                  <span className="text-right text-emerald-600 font-bold">8</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 font-semibold">
                  <span className="text-slate-900">Frozen Chicken</span>
                  <span className="text-center text-slate-600">4 kg</span>
                  <span className="text-right text-emerald-600 font-bold">4</span>
                </div>
              </div>

              {/* Amber Loading Shortfall Alert */}
              <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-3.5 text-xs space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-[#B45309]">
                  <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                  <span>Loading Shortfall</span>
                </div>
                <div className="text-[#B45309] font-medium ml-5">
                  Milk: 3 units unavailable
                </div>
              </div>
            </div>

            {/* Bottom Button */}
            <div className="pt-4">
              <button
                onClick={() => setScreen('en-route')}
                className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
              >
                Navigate to Stop
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 4: EN ROUTE (Page 19 in Figma) */}
        {/* ========================================================= */}
        {screen === 'en-route' && (
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setScreen('stop-detail')} className="p-1 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                  </button>
                  <div>
                    <h1 className="text-lg font-black text-slate-900">
                      OUT077 : Kandy Fresh
                    </h1>
                    <span className="text-xs text-slate-500 font-semibold">En Route</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateConnectionLoss}
                  className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-[11px] font-bold flex items-center gap-1"
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
                  <span className="text-slate-500">ETA</span>
                  <strong className="text-blue-600 font-bold">7.12AM</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Delivery Window</span>
                  <strong className="text-slate-900">5.00AM-7.30AM</strong>
                </div>
              </div>

              {/* Dark Route Box matching Figma */}
              <div className="bg-[#0E1626] text-white rounded-3xl p-5 space-y-3 font-semibold text-xs shadow-md">
                <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                  ROUTE
                </div>
                <div className="flex items-center gap-2">
                  <span>🏭</span>
                  <span>Kandy Depot</span>
                </div>
                <div className="text-slate-400 pl-2">↓</div>
                <div className="flex items-center gap-2 text-blue-400">
                  <span>🚚</span>
                  <span>Current Location</span>
                </div>
                <div className="text-slate-400 pl-2">↓</div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <span>📍</span>
                  <span>OUT79 : Kandy Fresh</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setScreen('complete-delivery')}
                className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
              >
                I&apos;ve Arrived
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 5: COMPLETE DELIVERY (Page 20 in Figma) */}
        {/* ========================================================= */}
        {screen === 'complete-delivery' && (
          <div className="flex-1 p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setScreen('en-route')} className="p-1 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                  </button>
                  <h1 className="text-lg font-black text-slate-900">Complete Delivery</h1>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateConnectionLoss}
                  className="px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 rounded-full text-[11px] font-bold flex items-center gap-1"
                >
                  <span>📶</span>
                  <span>Simulate Connection Loss</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Store</span>
                  <strong className="text-slate-900">OUT077 : Kandy Fresh</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Order</span>
                  <strong className="text-slate-900">WF-1043</strong>
                </div>
              </div>

              {/* Delivery Quantity Table */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-xs text-xs">
                <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  DELIVERY QUANTITY
                </div>
                <div className="grid grid-cols-3 font-bold text-slate-400 text-[11px] border-b pb-1.5">
                  <span>PRODUCT</span>
                  <span className="text-center">EXPECTED</span>
                  <span className="text-right">DELIVERED</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-100 font-semibold">
                  <span className="text-slate-900">Milk</span>
                  <span className="text-center text-slate-600">18</span>
                  <span className="text-right text-amber-600 font-bold flex items-center justify-end gap-1">
                    15 <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  </span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-100 font-semibold">
                  <span className="text-slate-900">Yogurt</span>
                  <span className="text-center text-slate-600">10</span>
                  <span className="text-right text-emerald-600 font-bold">10</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 border-b border-slate-100 font-semibold">
                  <span className="text-slate-900">Vegetables</span>
                  <span className="text-center text-slate-600">8</span>
                  <span className="text-right text-emerald-600 font-bold">8</span>
                </div>
                <div className="grid grid-cols-3 py-1.5 font-semibold">
                  <span className="text-slate-900">Chilled Chicken</span>
                  <span className="text-center text-slate-600">4</span>
                  <span className="text-right text-emerald-600 font-bold">4</span>
                </div>
              </div>

              {/* Warning Shortfall */}
              <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-3 text-xs flex items-center gap-2 font-bold text-[#B45309]">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#B45309]" />
                <span>3 units of Milk short</span>
              </div>

              {/* Receiver Info & Signature Area */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs text-xs">
                <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  RECEIVER INFORMATION
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500">Receiver</span>
                  <strong className="text-slate-900">Store Manager</strong>
                </div>

                <SignaturePad
                  onSave={(dataUrl) => setSignatureData(dataUrl)}
                  onClear={() => setSignatureData(null)}
                />

                <input
                  type="text"
                  placeholder="Delivery notes (optional)"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleConfirmDelivery}
                className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
              >
                Confirm Delivery
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 6: DELIVERY COMPLETED (Page 21 in Figma) */}
        {/* ========================================================= */}
        {screen === 'delivery-success' && (
          <div className="flex-1 p-5 flex flex-col justify-between items-center text-center">
            <div className="w-full space-y-6 pt-8">
              {/* Green check icon matching Figma */}
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600 shadow-md">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div>
                <h1 className="text-2xl font-black text-slate-900">Delivery Completed</h1>
                <p className="text-xs font-semibold text-slate-500 mt-1">
                  OUT077 : Kandy Fresh • Order WF-1043
                </p>
              </div>

              {/* White verification card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-left text-xs space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>POD Saved</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Delivery Recorded</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-700 font-bold">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Status: Delivered</span>
                </div>
              </div>
            </div>

            <div className="w-full pt-4">
              <button
                onClick={() => {
                  setActiveTab('stops');
                  setScreen('stops-list');
                }}
                className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
              >
                Next Stop
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 7: OFFLINE MODE (Page 22 in Figma) */}
        {/* ========================================================= */}
        {screen === 'offline-mode' && (
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => setScreen('home')} className="p-1 rounded-lg">
                    <ArrowLeft className="w-5 h-5 text-slate-800" />
                  </button>
                  <h1 className="text-lg font-black text-slate-900">OUT077 : Kandy</h1>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateReconnect}
                  className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[11px] font-bold flex items-center gap-1"
                >
                  <span>🔄</span>
                  <span>Simulate Reconnect</span>
                </button>
              </div>

              {/* Red offline banner */}
              <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl p-4 flex items-center gap-2 text-xs font-bold text-[#991B1B]">
                <span className="text-red-500 text-sm">🔴</span>
                <span>No Internet Connection</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 text-xs shadow-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Last Synced</span>
                  <strong className="text-slate-900">6:42 AM</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Pending Changes</span>
                  <strong className="text-red-600 font-bold">1</strong>
                </div>
              </div>

              {/* DRIVER CAN STILL Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-xs text-xs">
                <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  DRIVER CAN STILL
                </div>
                {[
                  "View today's route",
                  'View stops',
                  'View order details',
                  'Record delivery',
                  'Capture POD',
                  'Continue delivery',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-emerald-700 font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-slate-500 text-center leading-relaxed">
                You&apos;re offline. Your delivery records will sync automatically when the connection returns.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setScreen('complete-delivery')}
                className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
              >
                Continue Delivery
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 8: SYNC STATUS (Page 23 in Figma) */}
        {/* ========================================================= */}
        {screen === 'sync-status' && (
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h1 className="text-xl font-black text-slate-900">Sync Status</h1>

              {/* Green Connection Restored Card */}
              <div className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl p-4 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#166534]">
                  <span>🟢</span>
                  <span>Connection Restored</span>
                </div>
                <div className="text-slate-600 ml-5">Syncing delivery records...</div>
              </div>

              {/* Sync Progress Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-xs text-xs">
                <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                  SYNC PROGRESS
                </div>
                {[
                  'Delivery recorded',
                  'POD saved',
                  'Delivery status updated',
                  'Route progress updated',
                ].map((s) => (
                  <div key={s} className="flex items-center gap-2 text-emerald-700 font-bold">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>

              {/* All changes synced banner */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between text-xs font-bold">
                <span className="text-blue-800 flex items-center gap-1.5">
                  <span>✅</span>
                  <span>All changes synced</span>
                </span>
                <span className="text-slate-500 text-[11px] font-mono">Last synced 6:48 AM</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  setActiveTab('route');
                  setScreen('home');
                }}
                className="w-full py-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
              >
                Continue Route
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SCREEN 9: SETTINGS (Page 24 in Figma) */}
        {/* ========================================================= */}
        {screen === 'settings' && (
          <div className="flex-1 p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-black text-slate-900">Settings</h1>
                <p className="text-xs text-slate-500">Kasun • Driver</p>
              </div>

              {/* User profile card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 font-black text-base flex items-center justify-center">
                  K
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">Kasun</h3>
                  <p className="text-xs text-slate-500">
                    Vehicle VEH057 • Refrigerated Van
                  </p>
                </div>
              </div>

              {/* Options list */}
              <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-xs text-xs">
                <div className="text-[10px] uppercase font-bold text-slate-400 p-3 pb-1 tracking-wider">
                  OPTIONS
                </div>
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                  <span className="font-semibold text-slate-800 flex items-center gap-2">
                    <span>📄</span>
                    <span>Trip History</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                  <span className="font-semibold text-slate-800 flex items-center gap-2">
                    <span>⚙️</span>
                    <span>App Settings</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                  <span className="font-semibold text-slate-800 flex items-center gap-2">
                    <span>🛟</span>
                    <span>Help & Support</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <div className="p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer">
                  <span className="font-semibold text-slate-800 flex items-center gap-2">
                    <span>🔔</span>
                    <span>Notifications</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
                <div
                  onClick={handleLogout}
                  className="p-3.5 flex items-center justify-between hover:bg-red-50 text-red-600 cursor-pointer"
                >
                  <span className="font-bold flex items-center gap-2">
                    <span>🚪</span>
                    <span>Log Out</span>
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom 3-Tab Bar matching Figma */}
        <footer className="bg-white border-t border-slate-200 py-3 px-6 flex items-center justify-around">
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
    </div>
  );
}
