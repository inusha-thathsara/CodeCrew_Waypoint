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
  Monitor,
  Smartphone,
  Printer,
  Info,
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

const LOADER_STEPS: { id: LoaderScreen; stepNum: number; label: string; actionLabel: string }[] = [
  { id: 'dock-master', stepNum: 1, label: 'Dock Master', actionLabel: 'Enter Bay 04 Kiosk' },
  { id: 'pre-cooling-inspection', stepNum: 2, label: 'Pre-Cooling', actionLabel: 'Approve Inspection' },
  { id: 'lifo-staging', stepNum: 3, label: 'LIFO Staging', actionLabel: 'Launch RF Scanner' },
  { id: 'rf-scanner', stepNum: 4, label: 'Barcode Scan', actionLabel: 'Scan Next Crate' },
  { id: 'shortfall-exception', stepNum: 5, label: 'Shortfall Alert', actionLabel: 'Request Supervisor Override' },
  { id: 'supervisor-override', stepNum: 6, label: 'Override PIN', actionLabel: 'Confirm & Stow Van' },
  { id: 'stowage-sealing', stepNum: 7, label: 'Bolt Sealing', actionLabel: 'Proceed to Gate Pass' },
  { id: 'gate-pass', stepNum: 8, label: 'Gate Clearance', actionLabel: 'Authorize Exit & Depart' },
];

export default function LoaderKioskPage() {
  const router = useRouter();
  const [screen, setScreen] = useState<LoaderScreen>('lifo-staging');

  // Active step helpers
  const currentStepIdx = LOADER_STEPS.findIndex((s) => s.id === screen);
  const currentStep = LOADER_STEPS[currentStepIdx] || LOADER_STEPS[0];
  const prevStep = currentStepIdx > 0 ? LOADER_STEPS[currentStepIdx - 1] : null;
  const nextStep = currentStepIdx < LOADER_STEPS.length - 1 ? LOADER_STEPS[currentStepIdx + 1] : null;

  // Inspection checklist state
  const [inspections, setInspections] = useState({
    preCool: true,
    sanitized: true,
    hardware: true,
    chocks: true,
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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Application Navigation Bar (PC-Compatible Full Viewport Header) */}
      <header className="w-full bg-[#0B0F19] text-white border-b border-[#2E3A52] sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          {/* Top Row: Brand & Context */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="p-2 bg-blue-600 group-hover:bg-blue-500 text-white rounded-xl shadow-xs transition-colors">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-lg tracking-wider text-white">WAYPOINT</span>
                  <span className="text-slate-400 font-semibold text-sm ml-1.5 hidden sm:inline">LOGISTICS</span>
                </div>
              </Link>

              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Bay 04 Kiosk
              </span>
            </div>

            {/* Middle/Right Tools: Viewport Toggle & User Session */}
            <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-slate-400">
              {/* PC / Tablet Viewport Switch */}
              <div className="flex items-center bg-[#161E2E] border border-[#2E3A52] p-1 rounded-xl shadow-xs">
                <button
                  type="button"
                  onClick={() => setViewportMode('responsive')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewportMode === 'responsive'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Expand to Full PC Desktop Layout"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">PC Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewportMode('tablet')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    viewportMode === 'tablet'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Constrain to 768px Tablet Frame"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Tablet Kiosk</span>
                </button>
              </div>

              <div className="hidden lg:flex items-center gap-2">
                <span>Peliyagoda Central DC</span>
                <span>•</span>
                <span>
                  Loader: <strong className="text-white">Sunil Perera (#L-102)</strong>
                </span>
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

          {/* 4 Status Chips matching Kiosk Telemetry */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="bg-[#161E2E] border border-[#2E3A52] p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">
                Bay Status
              </span>
              <span className="text-xs font-bold text-white mt-0.5 block flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                {screen === 'dock-master' ? 'Shift Active' : screen === 'gate-pass' ? 'Departed & Clear' : 'Active Loading'}
              </span>
            </div>

            <div className="bg-[#161E2E] border border-[#2E3A52] p-2.5 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block tracking-wider">
                Vehicle
              </span>
              <span className="text-xs font-bold text-white mt-0.5 block truncate">
                VEH057 <span className="text-[10px] text-slate-400 font-normal">(Reefer Van • 1.5T)</span>
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
                <ThermometerSnowflake className="w-3.5 h-3.5" />
                +3.5°C Active
              </span>
            </div>
          </div>

          {/* Persistent Step Stepper Bar across all 8 screens */}
          <div className="mt-3.5 pt-3 border-t border-[#1E293B]">
            <div className="flex items-center justify-between text-xs mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-extrabold text-[11px] border border-blue-500/30">
                  Step {currentStep.stepNum} of 8
                </span>
                <span className="font-extrabold text-white text-sm">
                  {currentStep.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <span>{Math.round(((currentStepIdx + 1) / 8) * 100)}% Complete</span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-semibold">{8 - (currentStepIdx + 1)} steps left</span>
              </div>
            </div>

            {/* Stepper Dots / Bars */}
            <div className="grid grid-cols-8 gap-1.5">
              {LOADER_STEPS.map((s, idx) => {
                const isPast = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setScreen(s.id)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-500 shadow-md shadow-blue-500/50 ring-2 ring-blue-400/40'
                        : isPast
                        ? 'bg-emerald-500 hover:bg-emerald-400'
                        : 'bg-slate-700/80 hover:bg-slate-600'
                    }`}
                    title={`Step ${s.stepNum}: ${s.label}`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Viewport Container: Full Desktop Layout on PC, Frame on Tablet */}
      <main
        className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col justify-between ${
          viewportMode === 'tablet' ? 'max-w-[768px]' : 'max-w-7xl'
        }`}
      >
        <div className="w-full">
          {/* SCREEN 1: OUTBOUND DOCK MASTER */}
          {screen === 'dock-master' && (
            <div className="space-y-6">
              {/* 4 KPI summary cards across desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-black text-blue-600">3 Vehicles</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">Assigned This Shift</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-black text-slate-900">192 Crates</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">Total Pallet Target</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-black text-emerald-600">0 Breaches</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">Cold Chain Compliance</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <div className="text-2xl font-black text-amber-600">05:30 AM</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">Cutoff Departure Window</div>
                </div>
              </div>

              {/* Multi-column layout for bays on PC */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Bay 04 Active Card (Takes 7 cols on PC) */}
                <div className="lg:col-span-7 bg-white border-2 border-blue-600 rounded-2xl p-6 shadow-md space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="font-extrabold text-lg text-slate-900">BAY 04 (ACTIVE WORKSTATION)</span>
                      <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-700">
                        Reefer Van • 1.5T
                      </span>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      READY TO LOAD
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Assigned Vehicle</span>
                      <strong className="text-slate-900">VEH057 (WP-CAD-8812)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Primary Driver</span>
                      <strong className="text-slate-900">Kasun Bandara</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Delivery Route</span>
                      <strong className="text-slate-900">Kandy Fresh Early Run (3 Drops)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">Target Chamber Temp</span>
                      <strong className="text-cyan-700 font-mono">+3.4°C (Stabilized)</strong>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-xs text-slate-500">Active Loading Bay • Pre-Cooling Complete</span>
                    <button
                      onClick={() => setScreen('pre-cooling-inspection')}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all"
                    >
                      <span>Open Bay Kiosk</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Queued & Scheduled Bays (Takes 5 cols on PC) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Bay 02 Queued */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 opacity-95">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">BAY 02 (QUEUED 05:30 AM)</span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          Heavy 10T Truck
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        PRE-COOLING
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Vehicle: <strong>VEH039</strong> • Driver: <strong>Dhammika Silva</strong>
                    </div>
                    <div className="text-xs text-slate-500">
                      Route: Galle Highway Distribution (8 Drops)
                    </div>
                  </div>

                  {/* Bay 06 Scheduled */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2 opacity-95">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">BAY 06 (SCHEDULED 06:15 AM)</span>
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                          Medium 5T Reefer
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        IN TRANSIT TO DC
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Vehicle: <strong>VEH081</strong> • Driver: <strong>Nimal Gamage</strong>
                    </div>
                    <div className="text-xs text-slate-500">
                      Route: Kurunegala Hub Shuttle (12 Drops)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: PRE-COOLING & SAFETY INSPECTION */}
          {screen === 'pre-cooling-inspection' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Vehicle & Reefer Telemetry (4 cols) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">Vehicle Diagnostics</span>
                    <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-100 text-blue-700">
                      VEH057
                    </span>
                  </div>

                  <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Reefer Chamber</span>
                      <span className="text-cyan-400 font-mono font-bold flex items-center gap-1">
                        <ThermometerSnowflake className="w-3.5 h-3.5" /> +3.4°C
                      </span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: '68%' }} />
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Setpoint: +4.0°C</span>
                      <span className="text-emerald-400 font-semibold">Pre-Cooled 35 min</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-2 text-slate-600 pt-1">
                    <div className="flex justify-between border-b pb-1.5 border-slate-100">
                      <span>Bay Workstation:</span>
                      <strong>Bay 04 Loading Dock</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 border-slate-100">
                      <span>Ramp Leveler:</span>
                      <strong className="text-emerald-600">Locked In Position</strong>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 border-slate-100">
                      <span>Lockbox Driver Key:</span>
                      <strong className="text-emerald-600">Secured In Safe</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Chamber Odor Check:</span>
                      <strong className="text-emerald-600">Passed (Sanitized)</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-blue-800">
                    <Info className="w-4 h-4" />
                    <span>Inspection Protocol Rule</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-blue-800/90">
                    All 4 critical safety checkpoints must show verified pass before the bay roll-up door is physically released for crate loading.
                  </p>
                </div>
              </div>

              {/* Right Column: 4 Inspection Checkpoints (8 cols) */}
              <div className="lg:col-span-8 space-y-3">
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
                        Dock Wheel Chocks & Safety Locks
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

                <div className="pt-2">
                  <button
                    onClick={() => celebrateAndProceed('lifo-staging')}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>Approve Inspection & Unlock Loading Bay 04 Door</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 3: LIFO REVERSE STAGING & MANIFEST (Fully PC-Compatible 2-Column Desktop Grid) */}
          {screen === 'lifo-staging' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Gauges, LIFO Stowage Rules, and Locked Stops (5 cols on PC) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Weight & Volume Distribution Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider flex items-center justify-between">
                    <span>Bay 04 Payload Utilization</span>
                    <span className="text-xs text-slate-500 font-semibold lowercase">VEH057 Reefer</span>
                  </h3>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>WEIGHT DISTRIBUTION</span>
                      <span className="text-blue-600">880 kg / 1,040 kg (85%)</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: '85%' }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>Payload Margin: 160 kg</span>
                      <span>Safe Axle Balance: 48/52%</span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>VOLUME UTILIZATION</span>
                      <span className="text-emerald-600">5.9 m³ / 7.0 m³ (84%)</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: '84%' }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                      <span>Cube Capacity Margin: 1.1 m³</span>
                      <span>Pallet Stack: 3 Tiered</span>
                    </div>
                  </div>
                </div>

                {/* Visual LIFO Enforced Stowage Rule Card */}
                <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 space-y-2.5">
                  <div className="flex items-center gap-2 font-bold text-blue-800">
                    <span className="px-2 py-0.5 rounded bg-blue-200/80 text-blue-900 font-extrabold text-[11px]">
                      ℹ️ ENFORCED LIFO
                    </span>
                    <span>Last-In First-Out Bulkhead Stowage Rule</span>
                  </div>

                  <p className="text-[11px] leading-relaxed text-blue-900/90">
                    Vehicles are loaded in strict reverse sequence. <strong>Stop 2 (Kandy Fresh)</strong> goes deep into the cab front bulkhead first. <strong>Stop 1 (Kandy Fresh)</strong> is loaded near the rear doors last.
                  </p>

                  {/* Visual Stowage Diagram */}
                  <div className="bg-white/80 p-2.5 rounded-xl border border-blue-200 flex items-center justify-between text-[11px] font-mono">
                    <div className="text-center px-2 py-1 bg-blue-100 rounded text-blue-900 font-bold">
                      CAB FRONT BULKHEAD<br />
                      <span className="text-[10px] text-blue-700">Load 1st (Stop 2)</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                    <div className="text-center px-2 py-1 bg-slate-200 rounded text-slate-700 font-semibold">
                      MID ZONE<br />
                      <span className="text-[10px] text-slate-500">Thermal Curtain</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                    <div className="text-center px-2 py-1 bg-amber-100 rounded text-amber-900 font-bold">
                      REAR ROLL-UP DOORS<br />
                      <span className="text-[10px] text-amber-700">Load Last (Stop 1)</span>
                    </div>
                  </div>
                </div>

                {/* Locked Stop Card: Stop 1 OUT080 */}
                <div className="bg-[#1F293D] border border-slate-700 rounded-2xl p-4 text-slate-400 flex items-center justify-between opacity-85 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-800 rounded-xl text-slate-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-200">
                        Stop 1: OUT080 • Kandy Fresh
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Destined to be loaded near the doors last (Unload #1)
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Staged at Pallet Lane 1B • Locked until Stop 2 finishes
                      </div>
                    </div>
                  </div>
                  <Lock className="w-4 h-4 text-slate-500" />
                </div>
              </div>

              {/* Right Column: Active Stop 2 Loading Manifest (7 cols on PC) */}
              <div className="lg:col-span-7 space-y-4">
                {/* Active Stop Card: Stop 2 OUT076 */}
                <div className="bg-white border-2 border-blue-600 rounded-2xl overflow-hidden shadow-md">
                  <div className="p-4 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-slate-900">Stop 2: OUT076</span>
                        <span className="text-xs px-2.5 py-0.5 rounded bg-blue-600 text-white font-bold">
                          LOAD 1ST (CAB FRONT BULKHEAD)
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">
                        Kandy Fresh • Loading deep into the bulkhead first
                      </p>
                    </div>

                    <button
                      onClick={() => setScreen('rf-scanner')}
                      className="px-4 py-2 bg-[#1F293D] hover:bg-[#161E2E] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                      <span>LOADING...</span>
                    </button>
                  </div>

                  {/* Items in Stop 2 */}
                  <div className="p-4 space-y-2.5 bg-[#161E2E] text-white">
                    {/* Milk with shortfall flag */}
                    <div className="p-3.5 rounded-xl bg-[#1F293D] border border-amber-500/50 flex items-center justify-between transition-all hover:border-amber-400">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🥛</span>
                        <div>
                          <div className="font-bold text-sm text-white">Milk</div>
                          <div className="text-xs text-slate-400">18 units planned</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setShortfallModalOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-500/30 transition-all cursor-pointer shadow-xs"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>3 units unavailable at loading</span>
                        </button>

                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      </div>
                    </div>

                    {/* Yogurt */}
                    <div className="p-3.5 rounded-xl bg-[#1F293D] border border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍧</span>
                        <div>
                          <div className="font-bold text-sm text-white">Yogurt</div>
                          <div className="text-xs text-emerald-400">10 units verified green</div>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>

                    {/* Vegetables */}
                    <div className="p-3.5 rounded-xl bg-[#1F293D] border border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🥕</span>
                        <div>
                          <div className="font-bold text-sm text-white">Vegetables</div>
                          <div className="text-xs text-emerald-400">8 units verified green</div>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>

                    {/* Chilled Chicken */}
                    <div className="p-3.5 rounded-xl bg-[#1F293D] border border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍗</span>
                        <div>
                          <div className="font-bold text-sm text-white">Chilled Chicken</div>
                          <div className="text-xs text-emerald-400">4 units verified green</div>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary Action Button to Launch Scanner */}
                <div>
                  <button
                    onClick={() => setScreen('rf-scanner')}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Launch Camera RF Scanner (Bay #04)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 4: RF SCANNER */}
          {screen === 'rf-scanner' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Live Aim Reticle (7 cols on PC) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-[#0B101E] border-2 border-dashed border-cyan-500/50 rounded-3xl p-6 text-center space-y-4 relative overflow-hidden shadow-xl">
                  <div className="flex items-center justify-between text-xs text-cyan-400 font-mono">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Radio className="w-4 h-4 animate-pulse text-red-500" />
                      CAMERA RF SCANNER #04 • LIVE
                    </span>
                    <span>AIM RETICLE ACTIVE</span>
                  </div>

                  <div className="py-10 my-2 border border-cyan-500/30 bg-cyan-950/20 rounded-2xl flex flex-col items-center justify-center space-y-2">
                    <span className="font-mono text-2xl tracking-widest text-cyan-300 font-bold">
                      [ |||||||||||||||||||||||||||| ]
                    </span>
                    <div className="text-base font-extrabold text-white">
                      BARCODE DETECTED: #8849-076-018
                    </div>
                    <div className="text-xs text-cyan-300">
                      SKU: FRESH-CARROT-N-ELIYA (Grade A) • 18.2 kg
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
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
              </div>

              {/* Right Column: Scanned Crates Table & Triggers (5 cols on PC) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-500">STAGING COMPLETION</div>
                    <div className="text-xl font-black text-slate-900">18 / 20 Crates Scanned</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-500">PAYLOAD STAGED</div>
                    <div className="text-xl font-black text-blue-600">360 kg (Pallet 1)</div>
                  </div>
                </div>

                {/* Scanned Crates List */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2 shadow-sm">
                  <div className="text-xs font-bold text-slate-500 uppercase">Recently Scanned Crates (Pallet PL-0881)</div>
                  {[
                    { id: 'CR-076-018', name: 'Fresh Carrots 18kg', temp: '+3.8°C' },
                    { id: 'CR-076-017', name: 'Iceberg Lettuce 12kg', temp: '+4.0°C' },
                    { id: 'CR-076-016', name: 'Highland Fresh Milk 20L', temp: '+3.5°C' },
                    { id: 'CR-076-015', name: 'Strawberries Nuwara Eliya', temp: '+3.2°C' },
                  ].map((c) => (
                    <div key={c.id} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
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
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Scan Next Crate (Trigger Operational Exception)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 5: OPERATIONAL EXCEPTION & SHORTFALL */}
          {screen === 'shortfall-exception' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Red Alert Box & Metrics (5 cols on PC) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-5 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-bold text-red-700">
                    <span className="flex items-center gap-1.5 text-sm uppercase">
                      <AlertTriangle className="w-4 h-4" />
                      OPERATIONAL EXCEPTION
                    </span>
                    <span className="font-mono bg-red-100 px-2 py-0.5 rounded">CODE: SHORT-076-B4</span>
                  </div>
                  <p className="text-xs text-red-900 leading-relaxed">
                    Crate #19 (CR-076-019, Highland Set Yogurt 12x500g) has crushed carton walls with liquid leakage. Crate #20 has a physical inventory shortfall in Cold Room Rack A-12.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-red-200">
                      <span className="text-slate-500 block text-[10px]">Ordered</span>
                      <strong className="text-slate-900">20 Crates</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-red-200">
                      <span className="text-emerald-600 block text-[10px]">Sound Available</span>
                      <strong className="text-emerald-700">19 Crates</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-red-200">
                      <span className="text-red-600 block text-[10px]">Damaged/Short</span>
                      <strong className="text-red-700">1 Crate</strong>
                    </div>
                    <div className="bg-white p-2.5 rounded-lg border border-red-200">
                      <span className="text-amber-600 block text-[10px]">Fulfillment</span>
                      <strong className="text-amber-700">95.0%</strong>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs text-slate-600 space-y-2">
                  <div className="font-bold text-slate-800">Quarantine Bin Notice</div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Damaged crate moved to designated cold chain quarantine bin <strong>#QUAR-BAY04</strong>. Chain of custody log recorded under ticket #TK-9921.
                  </p>
                </div>
              </div>

              {/* Right Column: Required Protocol Steps & Sign-off (7 cols on PC) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Required Exception Resolution Protocol
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">1</span>
                        <div>
                          <strong>Quarantine Damaged Crate</strong>
                          <div className="text-[11px] text-slate-500">Move leaking carton to designated quarantine bin #QUAR-BAY04</div>
                        </div>
                      </div>
                      <span className="text-emerald-600 font-bold text-[11px]">✓ QUARANTINED</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center">2</span>
                        <div>
                          <strong>Inventory Variance Logging</strong>
                          <div className="text-[11px] text-slate-500">Deduct 1 crate from order manifest #WF-1042 in real-time ERP sync</div>
                        </div>
                      </div>
                      <span className="text-emerald-600 font-bold text-[11px]">✓ RECORDED</span>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center justify-center">3</span>
                        <div>
                          <strong className="text-amber-900">Supervisor PIN Authorization</strong>
                          <div className="text-[11px] text-amber-800">Requires Shift Manager override to depart with 95% fulfillment</div>
                        </div>
                      </div>
                      <span className="text-amber-700 font-bold text-[11px]">ACTION REQUIRED</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
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
                    className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Request Supervisor Sign-Off & Shortfall Override</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 6: SUPERVISOR DISPATCH OVERRIDE */}
          {screen === 'supervisor-override' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Supervisor Authorization & PIN (5 cols on PC) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white border-2 border-purple-500 rounded-2xl p-5 space-y-3 shadow-md">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-sm text-purple-900 uppercase tracking-wider">
                      SUPERVISOR DISPATCH OVERRIDE
                    </h3>
                    <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-full text-xs font-bold">
                      PIN AUTHENTICATED
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-2">
                    <div>Supervisor: <strong>Jagath Wickramasinghe (Shift Manager #SUP-401)</strong></div>
                    <p className="text-slate-500 leading-relaxed text-[11px]">
                      Reason: Shortfall within allowable 10% threshold. Replacement stock scheduled for afternoon trip #2 to avoid missing Kandy 08:00 AM perishable window.
                    </p>
                    <div className="flex items-center justify-between pt-2 text-[11px] font-mono text-slate-500 border-t border-slate-100">
                      <span>Security Token: PIN Verified (••••)</span>
                      <span>Authorized 05:08 AM</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 space-y-1">
                  <span className="font-bold">Audit Ledger Entry:</span>
                  <div className="text-[11px] font-mono text-purple-800">
                    HASH: 0x88f2a...8c1e (Immutable Audit Log)
                  </div>
                </div>
              </div>

              {/* Right Column: 4 Real-time Downstream System Syncs (7 cols on PC) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
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
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>Confirm Override & Proceed to Van Stowage</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 7: STOWAGE & BOLT SEALING */}
          {screen === 'stowage-sealing' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Load Status & Tamper-Evident Bolt Seal (5 cols on PC) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">
                      All 3 Pallets Loaded & Secured
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      71 / 72 Units • 865 kg Payload • Axle Balance 48/52%
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-full text-xs font-bold">
                    ALL STOPS IN
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

                  <div className="flex items-center justify-between p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">SEAL BARCODE NUMBER</span>
                      <div className="font-mono text-xl font-black text-blue-900">#SEAL-LK-884921</div>
                    </div>
                    <span className="text-xs font-bold text-blue-800 bg-blue-100 px-3 py-1 rounded-lg">
                      ISO 17712 CERTIFIED
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Physical Departure Checklist (7 cols on PC) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-2.5 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    FINAL PHYSICAL DEPARTURE CHECKLIST
                  </h4>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div>
                        <strong>Cargo Load Bars & Ratchet Straps</strong>
                        <div className="text-[11px] text-slate-500">2x cross-bars torqued to prevent transit shifting</div>
                      </div>
                      <span className="text-emerald-600 font-bold">✓ LOCKED (350 daN)</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div>
                        <strong>Thermal Curtain Partition</strong>
                        <div className="text-[11px] text-slate-500">Heavy insulating velcro curtain drawn between zones</div>
                      </div>
                      <span className="text-emerald-600 font-bold">✓ DRAWN & SEALED</span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-slate-100">
                      <div>
                        <strong>Reefer Compartment Temperature</strong>
                        <div className="text-[11px] text-slate-500">Chamber stabilized at +3.2°C (Setpoint: +4.0°C)</div>
                      </div>
                      <span className="text-emerald-600 font-bold">✓ STABILIZED (+3.2°C)</span>
                    </div>

                    <div className="flex items-center justify-between py-2">
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
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FileText className="w-5 h-5" />
                    <span>Proceed to Joint Dual Sign-Off & Security Gate Pass</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 8: OUTBOUND SECURITY GATE PASS */}
          {screen === 'gate-pass' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Chain-of-Custody Signatures & Bay Turnaround (5 cols on PC) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Joint Chain-of-Custody Signatures
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">LOADER BAY LEAD</span>
                      <strong>Sunil Perera (#L-102)</strong>
                      <div className="text-[11px] text-emerald-600 font-bold mt-1">✓ SIGNED 05:14 AM</div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[10px]">ASSIGNED DRIVER</span>
                      <strong>Kasun Bandara (VEH057)</strong>
                      <div className="text-[11px] text-emerald-600 font-bold mt-1">✓ DRIVER PIN VERIFIED 05:15 AM</div>
                    </div>
                  </div>
                </div>

                {/* Bay Turnaround */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 text-xs shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900">BAY 04 TURNAROUND</strong>
                    <span className="text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      READY FOR NEXT
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] leading-relaxed">
                    Next Inbound: <strong>VEH019 (10T Bulk Truck - Galle)</strong> • Scheduled docking at 05:45 AM.
                  </p>
                </div>
              </div>

              {/* Right Column: Outbound Security Gate Pass Card (7 cols on PC) */}
              <div className="lg:col-span-7 space-y-4">
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

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-center text-xs border-t border-slate-100">
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

                <div className="pt-2">
                  <button
                    onClick={() => celebrateAndProceed('dock-master')}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>Authorize Gate Clearance & Mark Vehicle En Route</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Consistent Workflow Navigation Footer on Every Screen */}
        <footer className="mt-8 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Back to Previous Step */}
          <div>
            {prevStep ? (
              <button
                type="button"
                onClick={() => setScreen(prevStep.id)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 font-bold text-xs flex items-center gap-2 transition-all shadow-xs active:scale-[0.98] cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-500" />
                <span>Back to Step {prevStep.stepNum}: {prevStep.label}</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 font-semibold italic">
                Step 1: Start of Shift
              </span>
            )}
          </div>

          {/* Current Step Pill */}
          <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Step {currentStep.stepNum} of 8: <strong className="text-slate-900">{currentStep.label}</strong></span>
          </div>

          {/* Next Step Primary Button */}
          <div>
            {nextStep ? (
              <button
                type="button"
                onClick={() => celebrateAndProceed(nextStep.id)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
              >
                <span>Proceed to Step {nextStep.stepNum}: {nextStep.label}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => celebrateAndProceed('dock-master')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Complete Dispatch & Return to Dock</span>
              </button>
            )}
          </div>
        </footer>
      </main>

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
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
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
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-sm text-slate-700 flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                <span className="font-mono font-extrabold text-lg text-slate-900">{shortfallQty}</span>
                <button
                  type="button"
                  onClick={() => setShortfallQty((q) => q + 1)}
                  className="w-8 h-8 rounded-lg bg-white border border-slate-300 font-bold text-sm text-slate-700 flex items-center justify-center cursor-pointer"
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
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all cursor-pointer ${
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
                className="w-1/3 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShortfallModalOpen(false);
                  celebrateAndProceed('shortfall-exception');
                }}
                className="w-2/3 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg cursor-pointer"
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
