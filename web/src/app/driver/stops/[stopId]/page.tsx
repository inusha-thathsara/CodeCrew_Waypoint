'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  WifiOff,
  Wifi,
  Package,
  ShieldCheck,
  Store,
} from 'lucide-react';
import SignaturePad from '@/components/SignaturePad';
import { offlineDb } from '@/lib/offline-store';

export default function StopDetailPage({
  params,
}: {
  params: Promise<{ stopId: string }>;
}) {
  const { stopId } = use(params);
  const router = useRouter();

  const [trip, setTrip] = useState<any>(null);
  const [stop, setStop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [discrepancyNote, setDiscrepancyNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if simulated offline
    const savedOffline = localStorage.getItem('waypoint_driver_offline');
    if (savedOffline === 'true' || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      setIsOffline(true);
    }

    const fetchStop = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/trips/TRIP-WF-1043');
        const data = await res.json();
        if (data.trip) {
          setTrip(data.trip);
          const found = data.trip.stops?.find(
            (s: any) => String(s.id) === String(stopId) || String(s.stop_sequence) === String(stopId)
          );
          if (found) {
            setStop(found);
            if (found.discrepancy_note) setDiscrepancyNote(found.discrepancy_note);
            if (found.signature_data) setSignatureData(found.signature_data);
          }
        }
      } catch (err) {
        console.error('Failed to load stop detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStop();
  }, [stopId]);

  const handleCompleteDelivery = async () => {
    if (!signatureData) {
      alert('Please have the store manager sign on the digital pad before confirming delivery receipt.');
      return;
    }

    setIsSubmitting(true);

    const now = new Date().toISOString();

    if (isOffline) {
      // Offline mode: store in local Dexie IndexedDB
      try {
        await offlineDb.offlineActions.add({
          actionId: `OFFLINE-ACT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          tripId: trip?.trip_id || 'TRIP-WF-1043',
          stopId: Number(stop?.id || stopId),
          outletId: stop?.outlet_id || 'OUT079',
          status: 'DELIVERED',
          discrepancyNote: discrepancyNote || undefined,
          signatureData: signatureData || undefined,
          offlineTimestamp: now,
          synced: false,
        });

        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#F59E0B', '#10B981', '#38BDF8'],
        });

        setSuccessMessage('Delivery preserved offline in IndexedDB! It will synchronize automatically when signal returns.');
        setTimeout(() => {
          router.push('/driver');
        }, 1800);
      } catch (dbErr) {
        console.error('Failed to save to local IndexedDB:', dbErr);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Online mode: send to API
      try {
        const res = await fetch(`/api/trips/${trip?.trip_id || 'TRIP-WF-1043'}/deliver`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stopId: Number(stop?.id || stopId),
            status: 'DELIVERED',
            discrepancyNote: discrepancyNote || undefined,
            signatureData,
            isOfflineRecord: false,
          }),
        });

        if (res.ok) {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.7 },
            colors: ['#10B981', '#38BDF8', '#6366F1'],
          });

          setSuccessMessage('Delivery confirmed live and telemetry transmitted to Dispatch Command Center!');
          setTimeout(() => {
            router.push('/driver');
          }, 1600);
        }
      } catch (err) {
        console.error('Failed to post live delivery:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070D18] flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!stop) {
    return (
      <div className="min-h-screen bg-[#070D18] flex flex-col items-center justify-center p-6 text-center text-slate-300">
        <h2 className="text-xl font-bold mb-2">Stop Not Found</h2>
        <Link href="/driver" className="text-blue-400 underline">
          Back to Route
        </Link>
      </div>
    );
  }

  const isDelivered = stop.status === 'DELIVERED';

  return (
    <div className="min-h-screen bg-[#070D18] text-slate-100 flex justify-center">
      <div className="w-full max-w-md bg-[#0A1222] min-h-screen flex flex-col border-x border-slate-800 shadow-2xl relative">
        {/* Header */}
        <header className="p-4 bg-[#0E172A] border-b border-slate-800 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Link
              href="/driver"
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white">
                  Stop #{stop.stop_sequence}: {stop.outlet_id}
                </h1>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isDelivered
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                  }`}
                >
                  {stop.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {stop.outlet?.brand || 'Fresh'} Store • Dock: {stop.outlet?.dock_type || 'street'}
              </p>
            </div>
          </div>

          <div>
            {isOffline ? (
              <span className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-1 font-semibold">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="text-[10px]">OFFLINE</span>
              </span>
            ) : (
              <span className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                <Wifi className="w-3.5 h-3.5" />
                <span className="text-[10px]">LIVE</span>
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 space-y-4">
          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
              <span className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Success!
              </span>
              <p>{successMessage}</p>
            </div>
          )}

          {/* Outlet Info Card */}
          <div className="p-4 rounded-2xl bg-[#0F1B30] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Delivery Window:
              </span>
              <span className="font-bold text-white font-mono">
                {stop.eta_start} - {stop.eta_end}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Store className="w-3.5 h-3.5 text-cyan-400" />
                Parking Constraint:
              </span>
              <span className="font-bold text-slate-200">
                {stop.outlet?.parking_constraint || 'Normal Access'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-amber-400" />
                Unload Staging Position:
              </span>
              <span className="font-bold text-amber-400">
                {stop.stop_sequence === 1 ? 'Rear Door (Unload 1st)' : stop.stop_sequence === 2 ? 'Middle Bay' : 'Front Bed'}
              </span>
            </div>
          </div>

          {/* Discrepancy Note Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Receipt Discrepancy or Overage (Optional)</span>
              <span className="text-[10px] text-slate-500 font-normal">Optional</span>
            </label>
            <textarea
              rows={2}
              value={discrepancyNote}
              onChange={(e) => setDiscrepancyNote(e.target.value)}
              placeholder="e.g. 1 crate return, Milk short by 3 units..."
              className="w-full p-3 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Digital Signature Pad */}
          <SignaturePad
            onSave={(dataUrl) => setSignatureData(dataUrl)}
            onClear={() => setSignatureData(null)}
          />

          {signatureData && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Digital Signature Captured</span>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleCompleteDelivery}
              disabled={isSubmitting || !signatureData}
              className={`w-full py-3.5 px-4 font-bold rounded-xl text-sm shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                isOffline
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 shadow-emerald-500/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : isOffline ? (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Save Delivery in Offline Store</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirm Delivery Receipt (Live)</span>
                </>
              )}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
