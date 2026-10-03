'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  CloudUpload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  ShieldCheck,
  Wifi,
  Database,
  Truck,
  LogOut,
  Check,
} from 'lucide-react';
import { offlineDb, LocalOfflineAction } from '@/lib/offline-store';

export default function OfflineSyncPage() {
  const router = useRouter();
  const [actions, setActions] = useState<LocalOfflineAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncReport, setSyncReport] = useState<any>(null);

  const loadOfflineActions = async () => {
    setLoading(true);
    try {
      const allActions = await offlineDb.offlineActions.toArray();
      setActions(allActions.reverse());
    } catch (err) {
      console.error('Failed to load local offline actions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOfflineActions();
  }, []);

  const handleSyncNow = async () => {
    const unsynced = actions.filter((a) => !a.synced);
    if (unsynced.length === 0) {
      alert('All offline actions are already synchronized.');
      return;
    }

    setIsSyncing(true);

    try {
      const payload = unsynced.map((a) => ({
        actionId: a.actionId,
        type: 'DELIVER_STOP',
        stopId: a.stopId,
        outletId: a.outletId,
        status: a.status,
        discrepancyNote: a.discrepancyNote,
        signatureData: a.signatureData,
        offlineTimestamp: a.offlineTimestamp,
      }));

      const res = await fetch('/api/trips/TRIP-WF-1043/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actions: payload }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        for (const act of unsynced) {
          if (act.id) {
            await offlineDb.offlineActions.update(act.id, { synced: true });
          }
        }

        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#10B981', '#38BDF8', '#F59E0B'],
        });

        setSyncReport(data);
        await loadOfflineActions();
      } else {
        alert(data.error || 'Failed to sync with cloud.');
      }
    } catch (err: any) {
      console.error('Sync failed:', err);
      alert('Failed to connect to Waypoint Cloud. Please verify connectivity.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('waypoint_token');
    localStorage.removeItem('waypoint_user');
    router.push('/');
  };

  const pendingCount = actions.filter((a) => !a.synced).length;

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
            <div>
              <h1 className="text-base font-black text-slate-900 leading-tight">
                Offline Reconciliation Center
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Browser IndexedDB Queue • Automated Conflict Resolution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadOfflineActions}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-all"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

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

      {/* Main Responsive Grid */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Local Storage Buffer & Sync Trigger (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-slate-600 font-extrabold flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-blue-600" />
                  Local IndexedDB Storage
                </span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    pendingCount > 0
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  }`}
                >
                  {pendingCount > 0 ? `${pendingCount} PENDING SYNC` : 'BUFFER SYNCED'}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                When vehicles enter remote mountain corridors without 4G cellular signal, all delivery timestamps, customer signatures, and discrepancy notes are written to the browser&apos;s persistent local storage.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Buffered Actions</span>
                  <strong className="text-slate-900">{actions.length} Total</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Awaiting Server Commit</span>
                  <strong className="text-amber-600 font-bold">{pendingCount} Records</strong>
                </div>
              </div>

              {pendingCount > 0 && (
                <button
                  type="button"
                  onClick={handleSyncNow}
                  disabled={isSyncing}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-2xl text-sm shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  {isSyncing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CloudUpload className="w-4 h-4" />
                      <span>Synchronize {pendingCount} Pending Events Now</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Reconciliation Report */}
            {syncReport && (
              <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs space-y-2 shadow-xs">
                <div className="font-extrabold flex items-center gap-1.5 text-emerald-700 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cloud Reconciliation Completed</span>
                </div>
                <p className="leading-relaxed">{syncReport.message}</p>
                <div className="text-[11px] text-emerald-600 font-mono">
                  Synced at: {new Date(syncReport.syncedAt).toLocaleTimeString()}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Recorded Offline Events List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                Recorded Offline Delivery Audit Queue
              </h2>

              {loading ? (
                <div className="text-center p-8 text-xs text-slate-500">
                  Reading local IndexedDB...
                </div>
              ) : actions.length === 0 ? (
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500 space-y-2">
                  <ShieldCheck className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-bold text-slate-700">All delivery records are synchronized</p>
                  <p className="text-[11px] max-w-sm mx-auto text-slate-500">
                    Deliveries completed during network dropouts or rural coverage gaps are automatically buffered in local storage and reconciled here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {actions.map((act) => (
                    <div
                      key={act.actionId}
                      className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                          <span>{act.outletId}</span>
                          <span className="text-xs font-normal text-slate-500">
                            (Stop #{act.stopId})
                          </span>
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            act.synced
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}
                        >
                          {act.synced ? 'Synchronized to Cloud' : 'Buffered Offline'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Recorded at {new Date(act.offlineTimestamp).toLocaleTimeString()}</span>
                      </div>

                      {act.discrepancyNote && (
                        <div className="p-2.5 rounded-xl bg-slate-50 text-slate-700 text-xs border border-slate-200">
                          Discrepancy Note: <strong>{act.discrepancyNote}</strong>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
