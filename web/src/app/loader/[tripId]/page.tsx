'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Package,
  Truck,
  Layers,
  ThermometerSnowflake,
  ShieldCheck,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface LifoStep {
  loading_step: number;
  position: string;
  stop_sequence: number;
  outlet_id: string;
  outlet_name: string;
  dock_type: string;
  eta_window: string;
  status: string;
}

export default function LifoManifestKiosk({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = use(params);
  const router = useRouter();

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});
  const [discrepancyOpen, setDiscrepancyOpen] = useState(false);
  const [discrepancyStep, setDiscrepancyStep] = useState<LifoStep | null>(null);
  const [discrepancyNote, setDiscrepancyNote] = useState('');
  const [reportedDiscrepancies, setReportedDiscrepancies] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        const data = await res.json();
        if (data.trip) {
          setTrip(data.trip);
          // If first stop has pre-existing discrepancy in seed data
          const existingNotes: Record<number, string> = {};
          data.trip.stops?.forEach((s: any) => {
            if (s.discrepancy_note) {
              existingNotes[s.stop_sequence] = s.discrepancy_note;
            }
          });
          setReportedDiscrepancies(existingNotes);
        }
      } catch (err) {
        console.error('Failed to load trip detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId]);

  const toggleCheck = (stepNum: number) => {
    setCheckedSteps((prev) => ({
      ...prev,
      [stepNum]: !prev[stepNum],
    }));
  };

  const handleOpenDiscrepancy = (step: LifoStep) => {
    setDiscrepancyStep(step);
    setDiscrepancyNote(reportedDiscrepancies[step.stop_sequence] || '');
    setDiscrepancyOpen(true);
  };

  const handleSaveDiscrepancy = () => {
    if (discrepancyStep) {
      setReportedDiscrepancies((prev) => ({
        ...prev,
        [discrepancyStep.stop_sequence]: discrepancyNote,
      }));
    }
    setDiscrepancyOpen(false);
  };

  const handleConfirmAllLoaded = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/trips/${tripId}/load-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bayNumber: 'Bay 2',
          isComplete: true,
          discrepancyNote: Object.values(reportedDiscrepancies).filter(Boolean).join('; ') || undefined,
        }),
      });

      if (res.ok) {
        setCompletedSuccess(true);
        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#38BDF8', '#6366F1'],
        });
      }
    } catch (err) {
      console.error('Failed to confirm vehicle load:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
          <span className="text-base font-semibold">Generating LIFO Staging Layout...</span>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#070D18] flex flex-col items-center justify-center p-6 text-center text-slate-300">
        <h2 className="text-xl font-bold mb-2">Trip Not Found</h2>
        <Link href="/loader" className="text-blue-400 underline">
          Return to Bay Dashboard
        </Link>
      </div>
    );
  }

  const manifest: LifoStep[] = trip.lifo_manifest || [];
  const totalSteps = manifest.length;
  const completedCount = Object.values(checkedSteps).filter(Boolean).length;
  const allVerified = totalSteps > 0 && completedCount === totalSteps;

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-[#0E172A] px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <Link
            href="/loader"
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all border border-slate-700 active:scale-95"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {trip.trip_id}
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                LIFO REVERSE STAGING
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Vehicle: <strong className="text-slate-200">{trip.vehicle_id}</strong> • Driver: <strong className="text-slate-200">{trip.driver_name}</strong> • Total: <strong className="text-amber-400">{trip.total_crates} Crates</strong>
            </p>
          </div>
        </div>

        {/* Progress Pill */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 font-semibold block">Load Progress</span>
            <span className="text-sm font-bold text-slate-200">
              {completedCount} of {totalSteps} Staged
            </span>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-slate-700 flex items-center justify-center font-black text-sm text-amber-400">
            {totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0}%
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
        {completedSuccess ? (
          <div className="p-8 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white">
              Vehicle Staging Verified & Dispatched!
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto">
              Manifest for <strong>{trip.trip_id}</strong> is locked in reverse LIFO sequence. Driver <strong>{trip.driver_name}</strong> has received the route dispatch.
            </p>
            <div className="pt-2">
              <Link
                href="/loader"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 text-sm"
              >
                <span>Return to Bay Kiosk</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Visual Truck Bed Cross-Section Diagram */}
            <div className="p-5 rounded-3xl border border-slate-800 bg-[#0E172A] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span>Physical Truck Bed Loading Layout (Cross-Section)</span>
                </div>
                <span className="text-xs text-amber-400 font-mono font-semibold">
                  Rule: Last Stop goes in Deepest (Front)
                </span>
              </div>

              {/* Truck Bed representation */}
              <div className="grid grid-cols-12 gap-2 p-3 bg-slate-950 rounded-2xl border-2 border-dashed border-slate-700">
                {/* Cab / Front indicator */}
                <div className="col-span-12 sm:col-span-2 p-3 rounded-xl bg-slate-800 flex items-center justify-center text-center font-bold text-xs text-slate-400 uppercase tracking-widest border border-slate-700">
                  🚚 CAB (FRONT)
                </div>

                {/* Staging slots reversed */}
                {manifest.map((m) => {
                  const isChecked = checkedSteps[m.loading_step];
                  return (
                    <div
                      key={m.loading_step}
                      className={`col-span-12 sm:col-span-3 p-3 rounded-xl border transition-all flex flex-col justify-between ${
                        isChecked
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                          : 'border-amber-500/30 bg-[#162238] text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono">
                          STEP #{m.loading_step}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {m.position}
                        </span>
                      </div>

                      <div className="my-2">
                        <div className="font-extrabold text-sm text-white">{m.outlet_id}</div>
                        <div className="text-[11px] text-slate-400 truncate">
                          Delivered at Stop #{m.stop_sequence}
                        </div>
                      </div>

                      <div className="text-[11px] font-semibold flex items-center gap-1">
                        {isChecked ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Staged
                          </span>
                        ) : (
                          <span className="text-amber-400">Pending Load</span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Rear Doors indicator */}
                <div className="col-span-12 sm:col-span-1 p-2 rounded-xl bg-slate-900 flex items-center justify-center text-center font-bold text-[10px] text-cyan-400 uppercase tracking-wider border border-cyan-500/30">
                  REAR DOOR
                </div>
              </div>
            </div>

            {/* Step-by-Step Interactive Checkoff List */}
            <div className="space-y-3">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Sequential Loading Checklist (Tap row to mark loaded)</span>
              </h2>

              <div className="space-y-3">
                {manifest.map((step) => {
                  const isChecked = checkedSteps[step.loading_step];
                  const hasDiscrepancy = Boolean(reportedDiscrepancies[step.stop_sequence]);

                  return (
                    <div
                      key={step.loading_step}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isChecked
                          ? 'border-emerald-500/30 bg-[#0C1F28]/70 shadow-lg'
                          : 'border-slate-800 bg-[#0F182B] hover:border-slate-700'
                      }`}
                    >
                      {/* Checkbox & Details */}
                      <button
                        type="button"
                        onClick={() => toggleCheck(step.loading_step)}
                        className="flex items-start gap-4 text-left flex-1"
                      >
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                            isChecked
                              ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/30'
                              : 'bg-slate-800 border border-slate-700 text-slate-500'
                          }`}
                        >
                          {isChecked ? <Check className="w-5 h-5 stroke-[3]" /> : step.loading_step}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-white">
                              {step.outlet_id}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                              Unload Stop #{step.stop_sequence}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono">
                              {step.position}
                            </span>
                          </div>

                          <div className="text-xs text-slate-400 mt-1">
                            {step.outlet_name} • Dock: <strong className="text-slate-200">{step.dock_type}</strong> • Window: <strong className="text-slate-200">{step.eta_window}</strong>
                          </div>

                          {hasDiscrepancy && (
                            <div className="mt-2 text-xs p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-2">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-red-400" />
                              <span>Discrepancy: {reportedDiscrepancies[step.stop_sequence]}</span>
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Discrepancy Button */}
                      <div className="flex items-center gap-2 sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleOpenDiscrepancy(step)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                            hasDiscrepancy
                              ? 'border-red-500/40 bg-red-500/20 text-red-300'
                              : 'border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{hasDiscrepancy ? 'Edit Flag' : 'Flag Discrepancy'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Final Dispatch Button */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 text-center sm:text-left">
                {allVerified ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> All crates staged and reverse-LIFO loaded
                  </span>
                ) : (
                  <span>
                    Tap each staged stop row to confirm loading before final vehicle departure.
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleConfirmAllLoaded}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-2xl text-base shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    <span>Confirm Vehicle Staged & Loaded</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </main>

      {/* Discrepancy Reporting Modal */}
      {discrepancyOpen && discrepancyStep && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E182A] border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-bold text-white">Record Loading Discrepancy</h3>
              </div>
              <button
                onClick={() => setDiscrepancyOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Reporting for <strong className="text-white">{discrepancyStep.outlet_id}</strong> ({discrepancyStep.outlet_name})
            </p>

            {/* Quick Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Quick Preset:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  'Milk short by 3 units (loading issue recorded)',
                  '1 Damaged crate replaced',
                  'Chilled seal verified with depot lead',
                  'Crate count verified - 100% accurate',
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDiscrepancyNote(preset)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-all text-left"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Discrepancy Details & Notes:
              </label>
              <textarea
                rows={3}
                value={discrepancyNote}
                onChange={(e) => setDiscrepancyNote(e.target.value)}
                placeholder="e.g. Milk short by 3 units (loading issue recorded)..."
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDiscrepancyOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveDiscrepancy}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-600/30 transition-all"
              >
                Save Discrepancy Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
