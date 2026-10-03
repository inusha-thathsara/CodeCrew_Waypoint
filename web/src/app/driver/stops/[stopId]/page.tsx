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
  Check,
  LogOut,
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
      try {
        await offlineDb.offlineActions.add({
          actionId: `OFFLINE-ACT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          tripId: trip?.trip_id || 'TRIP-WF-1043',
          stopId: Number(stop?.id || stopId),
          outletId: stop?.outlet_id || 'OUT077',
          status: 'DELIVERED',
          discrepancyNote: discrepancyNote || 'Milk short by 3 units (loading issue recorded)',
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

        setSuccessMessage('Delivery preserved offline in IndexedDB! It will synchronize automatically when connection returns.');
        setTimeout(() => {
          router.push('/driver');
        }, 1800);
      } catch (dbErr) {
        console.error('Failed to save to local IndexedDB:', dbErr);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      try {
        const res = await fetch(`/api/trips/${trip?.trip_id || 'TRIP-WF-1043'}/deliver`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            stopId: Number(stop?.id || stopId),
            status: 'DELIVERED',
            discrepancyNote: discrepancyNote || 'Milk short by 3 units (loading issue recorded)',
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

          setSuccessMessage('Delivery confirmed live and telemetry transmitted to Central Command!');
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

  const handleLogout = () => {
    localStorage.removeItem('waypoint_token');
    localStorage.removeItem('waypoint_user');
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm font-semibold">Loading Stop Receipt...</span>
        </div>
      </div>
    );
  }

  if (!stop) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center text-slate-800">
        <h2 className="text-xl font-bold mb-2">Stop Not Found</h2>
        <Link href="/driver" className="text-blue-600 underline text-sm font-semibold">
          Return to Route Overview
        </Link>
      </div>
    );
  }

  const isDelivered = stop.status === 'DELIVERED';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* Top Application Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/driver"
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Route</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900">
                Stop #{stop.stop_sequence}: {stop.outlet_id}
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isDelivered
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                {stop.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOffline ? (
              <span className="px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <WifiOff className="w-3.5 h-3.5" />
                <span>Offline Buffer Active</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <Wifi className="w-3.5 h-3.5" />
                <span>4G LTE Active</span>
              </span>
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

      {/* Main Responsive Body (Dual-Column Desktop, Fluid Mobile) */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 2-Column Responsive Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Delivery Information & Quantity Reconciliation (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Store & Order Details Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {stop.outlet_id} • {stop.outlet?.brand || 'Fresh'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    District: <strong>{stop.outlet?.district || 'Kandy'}</strong> • Dock: <strong>{stop.outlet?.dock_type || 'street'}</strong>
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-bold">
                  Order WF-1043
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Time Window</span>
                  <strong className="text-slate-900 font-mono text-sm">{stop.eta_start} - {stop.eta_end}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold text-[10px]">Parking Access</span>
                  <strong className="text-slate-900 text-sm">{stop.outlet?.parking_constraint || 'van_only'}</strong>
                </div>
              </div>
            </div>

            {/* Delivery Quantity Reconciliation Table */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-extrabold text-slate-800 tracking-wider">
                  DELIVERY QUANTITY RECONCILIATION
                </span>
                <span className="text-[11px] text-slate-500 font-medium">LIFO Bulkhead Staging</span>
              </div>

              <div className="grid grid-cols-3 font-bold text-slate-400 text-[11px] border-b pb-2">
                <span>PRODUCT</span>
                <span className="text-center">EXPECTED</span>
                <span className="text-right">DELIVERED</span>
              </div>

              <div className="grid grid-cols-3 py-2.5 border-b border-slate-100 font-semibold items-center">
                <span className="text-slate-900">Highland Fresh Milk (20L)</span>
                <span className="text-center text-slate-600">18</span>
                <span className="text-right text-amber-600 font-bold flex items-center justify-end gap-1">
                  15 <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                </span>
              </div>

              <div className="grid grid-cols-3 py-2.5 border-b border-slate-100 font-semibold items-center">
                <span className="text-slate-900">Highland Set Yogurt (12x500g)</span>
                <span className="text-center text-slate-600">10</span>
                <span className="text-right text-emerald-600 font-bold">10 ✓</span>
              </div>

              <div className="grid grid-cols-3 py-2.5 border-b border-slate-100 font-semibold items-center">
                <span className="text-slate-900">Fresh Vegetables Grade A</span>
                <span className="text-center text-slate-600">8</span>
                <span className="text-right text-emerald-600 font-bold">8 ✓</span>
              </div>

              <div className="grid grid-cols-3 py-2.5 font-semibold items-center">
                <span className="text-slate-900">Chilled Chicken Broilers</span>
                <span className="text-center text-slate-600">4 kg</span>
                <span className="text-right text-emerald-600 font-bold">4 ✓</span>
              </div>
            </div>

            {/* Amber Shortfall Callout */}
            <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl p-4 text-xs flex items-start gap-2.5 font-bold text-[#B45309]">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#B45309] mt-0.5" />
              <div>
                <span>3 units of Milk short</span>
                <p className="font-normal text-xs text-[#92400E] mt-0.5">
                  Logged and approved by Warehouse Shift Lead Sunil (#L-102). Store Manager credit notice pre-broadcast.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Digital Signature & Receiver Proof of Delivery (6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Store Manager Sign-Off (e-POD)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Receiver: <strong>Store Manager (Aravinda Silva)</strong>
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  Proof of Delivery
                </span>
              </div>

              {/* Digital Signature Pad */}
              <SignaturePad
                onSave={(dataUrl) => setSignatureData(dataUrl)}
                onClear={() => setSignatureData(null)}
              />

              {signatureData && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Digital Signature Acquired and Verified</span>
                </div>
              )}

              {/* Delivery Notes Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  Receiver Delivery Notes (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Received at rear bay; pallets checked and sealed..."
                  value={discrepancyNote}
                  onChange={(e) => setDiscrepancyNote(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Primary Action Button */}
              <button
                type="button"
                onClick={handleCompleteDelivery}
                disabled={isSubmitting || !signatureData}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isOffline ? (
                  <>
                    <WifiOff className="w-4 h-4" />
                    <span>Save Delivery to Offline IndexedDB Buffer</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm Delivery & Transmit e-POD</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
