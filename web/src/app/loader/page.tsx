'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Truck,
  Package,
  ThermometerSnowflake,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Check,
  X,
  Camera,
  RefreshCw,
  LogOut,
  Radio,
  FileText,
  UserCheck,
} from 'lucide-react';

type LoaderScreen =
  | 'dock-master'
  | 'pre-cooling-inspection'
  | 'lifo-staging'
  | 'rf-scanner'
  | 'shortfall-exception'
  | 'supervisor-override'
  | 'stowage-sealing'
  | 'gate-pass';

export default function LoaderKioskPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<LoaderScreen>('lifo-staging');

  // Inspection checklist state
  const [inspections, setInspections] = useState({
    preCool: true,
    sanitized: true,
    hardware: true,
    chocks: true,
  });

  // Items loading checkoff state (for Stop 2: OUT076)
  const [itemsChecked, setItemsChecked] = useState({
    milk: false,
    yogurt: true,
    vegetables: true,
    chicken: true,
  });

  // Shortfall / Discrepancy state
  const [shortfallModalOpen, setShortfallModalOpen] = useState(false);
  const [shortfallQty, setShortfallQty] = useState(3);
  const [shortfallReason, setShortfallReason] = useState('Stock Shortfall at Cold Room');
  const [viewportMode, setViewportMode] = useState<'responsive' | 'tablet'>('responsive');

  const handleLogout = () => {
    localStorage.removeItem('waypoint_token');
    localStorage.removeItem('waypoint_user');
    router.push('/');
  };

  const celebrateAndProceed = (nextScreen: LoaderScreen) => {
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#10B981', '#38BDF8', '#F59E0B'],
    });
    setScreen(nextScreen);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col items-center py-6 px-4">
      {/* Top Controls: Screen Switcher + Desktop/Tablet Viewport Toggle */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-3 mb-6">
        <div className="flex flex-wrap items-center justify-center gap-1.5 bg-[#161E2E] border border-[#2E3A52] p-1.5 rounded-full shadow-lg">
          {[
            { id: 'dock-master', label: '1. Dock Master' },
            { id: 'pre-cooling-inspection', label: '2. Inspection' },
            { id: 'lifo-staging', label: '3. LIFO Staging' },
            { id: 'rf-scanner', label: '4. Barcode Scan' },
            { id: 'shortfall-exception', label: '5. Shortfall Alert' },
            { id: 'supervisor-override', label: '6. Supervisor Override' },
            { id: 'stowage-sealing', label: '7. Bolt Seal' },
            { id: 'gate-pass', label: '8. Gate Pass' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setScreen(tab.id as LoaderScreen)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                screen === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Viewport switch: Responsive vs Tablet */}
        <div className="flex items-center bg-[#161E2E] border border-[#2E3A52] p-1 rounded-xl shadow-xs">
          <button
            type="button"
            onClick={() => setViewportMode('responsive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewportMode === 'responsive'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            💻 Web Responsive
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('tablet')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewportMode === 'tablet'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            📟 Tablet Frame (768px)
          </button>
        </div>
      </div>

      {/* Rugged Tablet Kiosk Frame - Expands to max-w-6xl on desktop in Responsive mode */}
      <div
        className={`w-full transition-all duration-300 bg-slate-50 text-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700/50 flex flex-col min-h-[920px] ${
          viewportMode === 'tablet' ? 'max-w-[768px]' : 'max-w-6xl'
        }`}
      >
        {/* Persistent Dark Kiosk Header */}
        <header className="bg-[#0B0F19] text-white p-5 border-b border-[#2E3A52]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="font-extrabold text-lg tracking-wider text-white">WAYPOINT</span>
              <span className="text-slate-400 font-semibold text-sm">LOGISTICS</span>
              <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Bay 04 Kiosk
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Peliyagoda Central DC</span>
              <span>•</span>
              <span>Loader: <strong className="text-white">Sunil Perera (#L-102)</strong></span>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 ml-2"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Status Chips matching Figma */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#161E2E] border border-[#2E3A52] p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">
                Bay Status
              </span>
              <span className="text-xs font-bold text-white mt-0.5 block">
                {screen === 'dock-master' ? 'Shift Active' : screen === 'gate-pass' ? 'Departed & Clear' : 'Active Loading'}
              </span>
            </div>

            <div className="bg-[#161E2E] border border-[#2E3A52] p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">
                Vehicle
              </span>
              <span className="text-xs font-bold text-white mt-0.5 block">
                VEH057 <span className="text-[10px] text-slate-400 font-normal">(Reefer Van)</span>
              </span>
            </div>

            <div className="bg-[#161E2E] border border-[#2E3A52] p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">
                Driver
              </span>
              <span className="text-xs font-bold text-white mt-0.5 block truncate">
                Kasun (WP-CAD-8812)
              </span>
            </div>

            <div className="bg-[#161E2E] border border-[#2E3A52] p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">
                Reefer Unit
              </span>
              <span className="text-xs font-bold text-cyan-400 mt-0.5 flex items-center gap-1">
                ❄️ +3.5°C Active
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Screen Viewport */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          {/* SCREEN 1: OUTBOUND DOCK MASTER */}
          {screen === 'dock-master' && (
            <div className="space-y-5">
              {/* 4 KPI summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-black text-blue-600">3 Vehicles</div>
                  <div className="text-[11px] text-slate-500 font-semibold">Assigned This Shift</div>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-black text-slate-900">192 Crates</div>
                  <div className="text-[11px] text-slate-500 font-semibold">Total Pallet Target</div>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-black text-emerald-600">0 Breaches</div>
                  <div className="text-[11px] text-slate-500 font-semibold">Cold Chain Compliance</div>
                </div>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-black text-amber-600">05:30 AM</div>
                  <div className="text-[11px] text-slate-500 font-semibold">Cutoff Departure Window</div>
                </div>
              </div>

              {/* Bay 04 Active Card */}
              <div className="bg-white border-2 border-blue-600 rounded-2xl p-5 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900">BAY 04 (ACTIVE WORKSTATION)</span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-blue-700">
                      Reefer Van • 1.5T
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    READY TO LOAD
                  </span>
                </div>

                <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1">
                  <span>Vehicle: <strong>VEH057 (WP-CAD-8812)</strong></span>
                  <span>Driver: <strong>Kasun Bandara</strong></span>
                  <span>Route: <strong>Kandy Fresh Early Run (3 Drops)</strong></span>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Active Loading Bay • Pre-Cooling Complete</span>
                  <button
                    onClick={() => setScreen('pre-cooling-inspection')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Open Bay Kiosk</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Bay 02 Queued */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 opacity-90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">BAY 02 (QUEUED 05:30 AM)</span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-200 text-slate-700">
                      Heavy 10T Truck
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    PRE-COOLING
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Vehicle: VEH039 • Driver: Dhammika Silva • Route: Galle Highway Distribution (8 Drops)
                </div>
              </div>

              {/* Bay 06 Scheduled */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 opacity-90 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">BAY 06 (SCHEDULED 06:15 AM)</span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-200 text-slate-700">
                      Medium 5T Truck
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-2.5 py-0.5 rounded-full">
                    IN STAGING
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Vehicle: VEH012 • Driver: Rohan Jayasuriya • Route: Negombo Daily Ambient Retail
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setScreen('pre-cooling-inspection')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <span>⚡ Enter Bay 04 Active Kiosk (VEH057)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 2: PRE-COOLING & VEHICLE INSPECTION */}
          {screen === 'pre-cooling-inspection' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-slate-900">
                    VEH057 • Isuzu N-Series Reefer Van (1.5 Ton)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chassis: NHR-8812 • ThermoKing V-300 Max Cold Unit • Driver: Kasun
                  </p>
                </div>
                <span className="px-3 py-1 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-full text-xs font-bold">
                  CHAMBER +3.4°C
                </span>
              </div>

              {/* Inspection Item 1 */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      1
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      Cold-Chain Pre-Cooling Verification
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ COMPLIANT (+3.4°C)
                  </span>
                </div>
                <p className="text-xs text-slate-600 ml-8">
                  Reefer compartment pre-cooled to target temp (+2.0°C to +4.0°C) for at least 30 minutes.
                </p>
                <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 ml-8 font-mono">
                  <span>Setpoint: +4.0°C</span>
                  <span>Probe 1: +3.4°C</span>
                  <span>Probe 2: +3.5°C</span>
                  <span className="text-blue-600">Door Defrost: Active</span>
                </div>
              </div>

              {/* Inspection Item 2 */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      2
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      Cargo Floor Sanitization & Odor Inspection
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ SANITIZED
                  </span>
                </div>
                <p className="text-xs text-slate-600 ml-8">
                  Bed washed, dried, free of residual milk/fish fluids or chemical contaminants.
                </p>
                <div className="flex gap-4 text-[11px] text-slate-500 ml-8">
                  <span>Visual Clean: <strong>PASS</strong></span>
                  <span>Moisture Level: <strong>Dry</strong></span>
                  <span>Sanitizer Lot: <strong>#SAN-9902</strong></span>
                </div>
              </div>

              {/* Inspection Item 3 */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      Cargo Securing & Restraint Hardware
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ 4 BARS PRESENT
                  </span>
                </div>
                <p className="text-xs text-slate-600 ml-8">
                  Ensure adjustable vertical shoring bars, ratchet straps, and thermal bulkheads are present.
                </p>
                <div className="flex gap-4 text-[11px] text-slate-500 ml-8">
                  <span>4x Load Bars</span>
                  <span>2x Heavy Straps</span>
                  <span>1x Thermal Curtain</span>
                </div>
              </div>

              {/* Inspection Item 4 */}
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      4
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      Dock Interlock & Wheel Chock Safety
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ CHOCKS ENGAGED
                  </span>
                </div>
                <p className="text-xs text-slate-600 ml-8">
                  Physical wheel chocks positioned at rear tires; dock leveler ramp lip locked in place.
                </p>
                <div className="flex gap-4 text-[11px] text-slate-500 ml-8">
                  <span>Bay 04 Lock: <strong>Engaged</strong></span>
                  <span>Driver Key: <strong>In Lockbox</strong></span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => celebrateAndProceed('lifo-staging')}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Approve Inspection & Unlock Loading Bay 04 Door</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 3: LIFO REVERSE STAGING & MANIFEST (Matches loader_screen_mockup.jpg exactly!) */}
          {screen === 'lifo-staging' && (
            <div className="space-y-4">
              {/* Gauges Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>WEIGHT DISTRIBUTION</span>
                    <span className="text-blue-600">880 kg / 1,040 kg (85%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>VOLUME UTILIZATION</span>
                    <span className="text-emerald-600">5.9 m³ / 7.0 m³ (84%)</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '84%' }} />
                  </div>
                </div>
              </div>

              {/* LIFO Sequence Rule Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-center gap-3 text-xs text-blue-900">
                <span className="font-bold text-blue-700 bg-blue-200/60 px-2 py-0.5 rounded">
                  ℹ️ ENFORCED LIFO
                </span>
                <span>
                  <strong>Last-In First-Out Rule:</strong> Stop 2 (Kandy Fresh) is loaded deep into the bulkhead first. Stop 1 is loaded near the doors last.
                </span>
              </div>

              {/* Active Stop Card: Stop 2 OUT076 */}
              <div className="bg-white border-2 border-blue-600 rounded-2xl overflow-hidden shadow-md">
                <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-slate-900">Stop 2: OUT076</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-600 text-white font-bold">
                        LOAD 1ST (CAB FRONT BULKHEAD)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      Kandy Fresh • Loading deep into the bulkhead first
                    </p>
                  </div>

                  <button
                    onClick={() => setScreen('rf-scanner')}
                    className="px-4 py-2 bg-[#1F293D] hover:bg-[#161E2E] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <span>📥 LOADING...</span>
                  </button>
                </div>

                {/* Items in Stop 2 */}
                <div className="p-3 space-y-2 bg-[#161E2E] text-white">
                  {/* Milk with shortfall flag */}
                  <div className="p-3 rounded-xl bg-[#1F293D] border border-amber-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🥛</span>
                      <div>
                        <div className="font-bold text-sm text-white">Milk</div>
                        <div className="text-xs text-slate-400">18 units planned</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setShortfallModalOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-500/30 transition-all"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        <span>3 units unavailable at loading</span>
                      </button>

                      <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>
                  </div>

                  {/* Yogurt */}
                  <div className="p-3 rounded-xl bg-[#1F293D] border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🍧</span>
                      <div>
                        <div className="font-bold text-sm text-white">Yogurt</div>
                        <div className="text-xs text-emerald-400">10 units verified green</div>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>

                  {/* Vegetables */}
                  <div className="p-3 rounded-xl bg-[#1F293D] border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🥕</span>
                      <div>
                        <div className="font-bold text-sm text-white">Vegetables</div>
                        <div className="text-xs text-emerald-400">8 units verified green</div>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>

                  {/* Chilled Chicken */}
                  <div className="p-3 rounded-xl bg-[#1F293D] border border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🍗</span>
                      <div>
                        <div className="font-bold text-sm text-white">Chilled Chicken</div>
                        <div className="text-xs text-emerald-400">4 units verified green</div>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Locked Stop Card: Stop 1 OUT080 */}
              <div className="bg-[#1F293D] border border-slate-700 rounded-2xl p-4 text-slate-400 flex items-center justify-between opacity-80">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-xl text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-200">
                      Stop 1: OUT080 • Kandy Fresh
                    </div>
                    <div className="text-xs text-slate-400">
                      Destined to be loaded near the doors last (Unload #1)
                    </div>
                  </div>
                </div>
                <Lock className="w-4 h-4 text-slate-500" />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setScreen('rf-scanner')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                >
                  <Camera className="w-4 h-4" />
                  <span>Launch Camera RF Scanner (Bay #04)</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 4: RF SCANNER (Page 4 in Figma) */}
          {screen === 'rf-scanner' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500">STAGING COMPLETION</div>
                  <div className="text-lg font-black text-slate-900">18 / 20 Crates Scanned</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-500">PAYLOAD STAGED</div>
                  <div className="text-lg font-black text-blue-600">360 kg (Pallet 1)</div>
                </div>
              </div>

              {/* RF Scanner Aim Reticle Viewport */}
              <div className="bg-[#0B101E] border-2 border-dashed border-cyan-500/50 rounded-3xl p-6 text-center space-y-4 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs text-cyan-400 font-mono">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Radio className="w-4 h-4 animate-pulse text-red-500" />
                    CAMERA RF SCANNER #04 • LIVE
                  </span>
                  <span>AIM RETICLE ACTIVE</span>
                </div>

                <div className="py-8 my-2 border border-cyan-500/30 bg-cyan-950/20 rounded-2xl flex flex-col items-center justify-center space-y-2">
                  <span className="font-mono text-xl tracking-widest text-cyan-300 font-bold">
                    [ |||||||||||||||||||||||||||| ]
                  </span>
                  <div className="text-sm font-extrabold text-white">
                    BARCODE DETECTED: #8849-076-018
                  </div>
                  <div className="text-xs text-cyan-300">
                    SKU: FRESH-CARROT-N-ELIYA (Grade A) • 18.2 kg
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-left text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Core Probe</span>
                    <div className="text-cyan-400 font-bold">❄️ +3.8°C (Pass)</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Shock Sensor</span>
                    <div className="text-emerald-400 font-bold">0.1G (Intact)</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Destination</span>
                    <div className="text-white font-bold">OUT076 Fresh</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Order Ref</span>
                    <div className="text-amber-400 font-bold">WF-1042 • Drop 3</div>
                  </div>
                </div>
              </div>

              {/* Scanned Crates List */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase">Recently Scanned Crates (Pallet PL-0881)</div>
                {[
                  { id: 'CR-076-018', name: 'Fresh Carrots 18kg', temp: '+3.8°C' },
                  { id: 'CR-076-017', name: 'Iceberg Lettuce 12kg', temp: '+4.0°C' },
                  { id: 'CR-076-016', name: 'Highland Fresh Milk 20L', temp: '+3.5°C' },
                  { id: 'CR-076-015', name: 'Strawberries Nuwara Eliya', temp: '+3.2°C' },
                ].map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                    <span className="font-semibold text-slate-800">{c.id} • {c.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-cyan-700 font-mono font-bold">{c.temp}</span>
                      <span className="text-emerald-600 font-bold">✓ VERIFIED</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setScreen('shortfall-exception')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <span>Scan Next Crate (Trigger Operational Exception)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 5: OPERATIONAL EXCEPTION & SHORTFALL (Page 5 in Figma) */}
          {screen === 'shortfall-exception' && (
            <div className="space-y-4">
              <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-red-700">
                  <span className="flex items-center gap-1.5 text-sm uppercase">
                    <AlertTriangle className="w-4 h-4" />
                    OPERATIONAL EXCEPTION: CRATE SHORTFALL & DAMAGE
                  </span>
                  <span className="font-mono">CODE: SHORT-076-B4</span>
                </div>
                <p className="text-xs text-red-900 leading-relaxed">
                  Crate #19 (CR-076-019, Highland Set Yogurt 12x500g) has crushed carton walls with liquid leakage. Crate #20 has a physical inventory shortfall in Cold Room Rack A-12.
                </p>
                <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-lg border border-red-200">
                    <span className="text-slate-500 block text-[10px]">Ordered</span>
                    <strong className="text-slate-900">20 Crates</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-red-200">
                    <span className="text-emerald-600 block text-[10px]">Sound Available</span>
                    <strong className="text-emerald-700">19 Crates</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-red-200">
                    <span className="text-red-600 block text-[10px]">Damaged/Short</span>
                    <strong className="text-red-700">1 Crate</strong>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-red-200">
                    <span className="text-amber-600 block text-[10px]">Fulfillment</span>
                    <strong className="text-amber-700">95.0%</strong>
                  </div>
                </div>
              </div>

              {/* Protocol steps */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Required Exception Resolution Protocol
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">1</span>
                      <div>
                        <strong>Quarantine Damaged Crate</strong>
                        <div className="text-[11px] text-slate-500">Move leaking carton to designated quarantine bin #QUAR-BAY04</div>
                      </div>
                    </div>
                    <span className="text-emerald-600 font-bold text-[11px]">✓ QUARANTINED</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">2</span>
                      <div>
                        <strong>Inventory Variance Logging</strong>
                        <div className="text-[11px] text-slate-500">Deduct 1 crate from order manifest #WF-1042 in real-time ERP sync</div>
                      </div>
                    </div>
                    <span className="text-emerald-600 font-bold text-[11px]">✓ RECORDED</span>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">3</span>
                      <div>
                        <strong className="text-amber-900">Supervisor PIN Authorization</strong>
                        <div className="text-[11px] text-amber-800">Requires Shift Manager override to depart with 95% fulfillment</div>
                      </div>
                    </div>
                    <span className="text-amber-700 font-bold text-[11px]">ACTION REQUIRED</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-300 text-slate-700 font-bold text-[10px] flex items-center justify-center">4</span>
                      <div>
                        <strong>Downstream Automatic Notification</strong>
                        <div className="text-[11px] text-slate-500">Pre-alerts Store Manager Anura (OUT076) and Dispatcher Nimal</div>
                      </div>
                    </div>
                    <span className="text-slate-400 font-bold text-[11px]">QUEUED ON SIGN-OFF</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setScreen('supervisor-override')}
                  className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Request Supervisor Sign-Off & Shortfall Override</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 6: SUPERVISOR DISPATCH OVERRIDE (Page 6 in Figma) */}
          {screen === 'supervisor-override' && (
            <div className="space-y-4">
              <div className="bg-white border-2 border-purple-500 rounded-2xl p-5 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-purple-900 uppercase tracking-wider">
                    SUPERVISOR DISPATCH OVERRIDE
                  </h3>
                  <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-full text-xs font-bold">
                    PIN AUTHENTICATED
                  </span>
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  <div>Supervisor: <strong>Jagath Wickramasinghe (Shift Manager #SUP-401)</strong></div>
                  <p className="text-slate-500 leading-relaxed">
                    Reason: Shortfall within allowable 10% threshold. Replacement stock scheduled for afternoon trip #2 to avoid missing Kandy 08:00 AM perishable window.
                  </p>
                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-slate-500">
                    <span>Security Token: PIN Verified (••••)</span>
                    <span>Authorized 05:08 AM</span>
                  </div>
                </div>
              </div>

              {/* Real-time downstream system notifications */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  REAL-TIME DOWNSTREAM SYSTEM NOTIFICATIONS
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-blue-600 block">DISPATCHER</span>
                      <strong>Central Planning Console (Nimal)</strong>
                      <div className="text-[11px] text-slate-500">Vehicle VEH057 capacity manifest updated to 71/72 crates. Trip plan preserved.</div>
                    </div>
                    <span className="text-emerald-600 font-bold">✓ SYNCED</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-600 block">STORE MANAGER</span>
                      <strong>Kandy Fresh Portal (Anura - OUT076)</strong>
                      <div className="text-[11px] text-slate-500">Advance delivery notice updated: 19 crates expected. 1 shortfall logged for credit note.</div>
                    </div>
                    <span className="text-emerald-600 font-bold">✓ NOTIFIED</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-600 block">DRIVER</span>
                      <strong>Driver Mobile e-Manifest (Kasun)</strong>
                      <div className="text-[11px] text-slate-500">Roadside manifest updated to reflect 19 crates on Drop 3. POD discrepancy prevented.</div>
                    </div>
                    <span className="text-emerald-600 font-bold">✓ REFRESHED</span>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-600 block">ERP BILLING</span>
                      <strong>Automated Invoicing & Credit Ledger</strong>
                      <div className="text-[11px] text-slate-500">Invoice #INV-8820 adjusted from LKR 148,000 to LKR 140,600 prior to departure.</div>
                    </div>
                    <span className="text-emerald-600 font-bold">✓ ADJUSTED</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setScreen('stowage-sealing')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Confirm Override & Proceed to Van Stowage</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 7: STOWAGE & BOLT SEALING (Page 7 in Figma) */}
          {screen === 'stowage-sealing' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    All 3 Pallets Loaded & Secured in VEH057
                  </h3>
                  <p className="text-xs text-slate-500">
                    Final Load: 71 / 72 Units • 865 kg Payload • Axle Balance 48/52%
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-full text-xs font-bold">
                  ALL 3 STOPS IN CARGO
                </span>
              </div>

              {/* Tamper-evident rear door bolt seal card */}
              <div className="bg-white border-2 border-blue-600 rounded-2xl p-5 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-blue-700 uppercase tracking-wider">
                    TAMPER-EVIDENT REAR DOOR BOLT SEAL
                  </h4>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    SCANNED & VERIFIED
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  Physical bolt seal attached across rear roll-up latch. Serial number registered into cold-chain chain-of-custody ledger.
                </p>

                <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold">SEAL BARCODE NUMBER</span>
                    <div className="font-mono text-xl font-black text-blue-900">#SEAL-LK-884921</div>
                  </div>
                  <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-lg">
                    ISO 17712 CERTIFIED
                  </span>
                </div>
              </div>

              {/* Physical Departure Checklist */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  FINAL PHYSICAL DEPARTURE CHECKLIST
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <div>
                      <strong>Cargo Load Bars & Ratchet Straps</strong>
                      <div className="text-[11px] text-slate-500">2x cross-bars torqued to prevent transit shifting</div>
                    </div>
                    <span className="text-emerald-600 font-bold">✓ LOCKED (350 daN)</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <div>
                      <strong>Thermal Curtain Partition</strong>
                      <div className="text-[11px] text-slate-500">Heavy insulating velcro curtain drawn between zones</div>
                    </div>
                    <span className="text-emerald-600 font-bold">✓ DRAWN & SEALED</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <div>
                      <strong>Reefer Compartment Temperature</strong>
                      <div className="text-[11px] text-slate-500">Chamber stabilized at +3.2°C (Setpoint: +4.0°C)</div>
                    </div>
                    <span className="text-emerald-600 font-bold">✓ STABILIZED (+3.2°C)</span>
                  </div>

                  <div className="flex items-center justify-between py-1.5">
                    <div>
                      <strong>Datalogger Telemetry Tag</strong>
                      <div className="text-[11px] text-slate-500">Bluetooth datalogger #DL-9920 active in pallet #1</div>
                    </div>
                    <span className="text-emerald-600 font-bold">✓ TRANSMITTING</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setScreen('gate-pass')}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  <span>Proceed to Joint Dual Sign-Off & Security Gate Pass</span>
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 8: OUTBOUND SECURITY GATE PASS (Page 8 in Figma) */}
          {screen === 'gate-pass' && (
            <div className="space-y-4">
              {/* Joint Signatures */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Joint Chain-of-Custody Signatures
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">LOADER BAY LEAD</span>
                    <strong>Sunil Perera (Badge #L-102)</strong>
                    <div className="text-[11px] text-emerald-600 font-bold mt-1">✓ SIGNED 05:14 AM</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block text-[10px]">ASSIGNED DRIVER</span>
                    <strong>Kasun Bandara (VEH057)</strong>
                    <div className="text-[11px] text-emerald-600 font-bold mt-1">✓ DRIVER PIN VERIFIED 05:15 AM</div>
                  </div>
                </div>
              </div>

              {/* Green Gate Pass Card */}
              <div className="bg-white border-2 border-emerald-500 rounded-2xl p-5 space-y-3 shadow-md">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-emerald-700 uppercase tracking-wider">
                    OUTBOUND SECURITY GATE CLEARANCE PASS
                  </h3>
                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-full text-xs font-bold">
                    VALID FOR EXIT
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <div className="font-mono text-lg font-black text-slate-900">
                      GATE PASS #GP-2026-0929-B04
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Vehicle: <strong>VEH057</strong> • Driver: <strong>Kasun Bandara</strong>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Route: Pannipitiya DC ➔ OUT002 ➔ OUT080 ➔ OUT076
                    </div>
                    <div className="text-xs text-blue-600 font-semibold mt-1">
                      Authorized Departure Window: 05:15 AM - 05:45 AM
                    </div>
                  </div>

                  {/* QR Code Graphic */}
                  <div className="w-20 h-20 bg-emerald-950 text-emerald-300 rounded-xl p-2 flex flex-col items-center justify-center border border-emerald-700 text-center">
                    <QrCode className="w-10 h-10" />
                    <span className="text-[9px] font-bold uppercase mt-0.5">QR PASS</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">NET CARGO</span>
                    <strong className="text-slate-900">71 / 72 Units</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">PAYLOAD</span>
                    <strong className="text-slate-900">865 kg</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">BOLT SEAL</span>
                    <strong className="text-slate-900">#SL-884921</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DESTINATION</span>
                    <strong className="text-slate-900">Kandy Fresh</strong>
                  </div>
                </div>
              </div>

              {/* Bay Turnaround */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900">BAY 04 TURNAROUND & NEXT VEHICLE</strong>
                  <p className="text-slate-500 mt-0.5">
                    Next Scheduled: VEH019 (10T Bulk Truck - Galle) • Inbound Docking at 05:45 AM
                  </p>
                </div>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  BAY CLEAR & READY
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => celebrateAndProceed('dock-master')}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Authorize Gate Clearance & Mark Vehicle En Route</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Discrepancy / Shortfall Popup Modal */}
      {shortfallModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Flag Crate Shortfall</h3>
              </div>
              <button
                onClick={() => setShortfallModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Item: <strong>Highland Fresh Milk (20L Crate)</strong> • Order: <strong>WF-1043</strong>
            </p>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs font-bold text-red-900">Unavailable Crates:</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShortfallQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-sm text-slate-700 flex items-center justify-center"
                >
                  -
                </button>
                <span className="font-mono font-extrabold text-lg text-slate-900">{shortfallQty}</span>
                <button
                  type="button"
                  onClick={() => setShortfallQty((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-sm text-slate-700 flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Root Cause:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  'Stock Shortfall at Cold Room',
                  'Damaged Carton / Leaking',
                  'Temp Breach During Staging',
                  'Incorrect Barcode Label',
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setShortfallReason(reason)}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                      shortfallReason === reason
                        ? 'border-amber-500 bg-amber-50 text-amber-900'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 leading-relaxed">
              🔔 <strong>Automatic Real-Time Notification:</strong> Store Manager Anura (OUT076) and Driver Kasun will receive advance broadcast notice of this 3-crate adjustment before delivery.
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShortfallModalOpen(false)}
                className="w-1/3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShortfallModalOpen(false);
                  celebrateAndProceed('shortfall-exception');
                }}
                className="w-2/3 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg"
              >
                Confirm Shortfall & Request Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
