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
        // Mark all as synced in local IndexedDB
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

  const pendingCount = actions.filter((a) => !a.synced).length;

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
              <h1 className="text-base font-black text-white">
                Offline Reconciliation Center
              </h1>
              <p className="text-[11px] text-slate-400">
                IndexedDB Queue • Automated Conflict Resolution
              </p>
            </div>
          </div>

          <button
            onClick={loadOfflineActions}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 space-y-4">
          {/* Status Card */}
          <div className="p-4 rounded-2xl bg-[#0F1B30] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-blue-400" />
                Local Storage Buffer
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  pendingCount > 0
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {pendingCount > 0 ? `${pendingCount} PENDING SYNC` : 'UP TO DATE'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When working in field dead-zones, store signatures and delivery timestamps are securely buffered in browser IndexedDB.
            </p>

            {pendingCount > 0 && (
              <button
                type="button"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
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

          {/* Sync Report Success Banner */}
          {syncReport && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>Reconciliation Completed Successfully</span>
              </div>
              <p>{syncReport.message}</p>
              <div className="text-[11px] text-slate-400">
                Synced at: {new Date(syncReport.syncedAt).toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* Offline Actions List */}
          <div className="space-y-2.5">
            <h2 className="text-xs uppercase tracking-wider text-slate-400 font-semibold px-1">
              Recorded Offline Delivery Events
            </h2>

            {loading ? (
              <div className="text-center p-8 text-xs text-slate-500">
                Reading IndexedDB...
              </div>
            ) : actions.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400 space-y-1">
                <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="font-semibold text-slate-300">No pending offline events</p>
                <p className="text-[11px] text-slate-500">
                  Switch the Driver to &ldquo;Simulate Offline&rdquo; on the home screen to test offline delivery capture.
                </p>
              </div>
            ) : (
              actions.map((act) => (
                <div
                  key={act.actionId}
                  className="p-3.5 rounded-xl border border-slate-800 bg-[#0E172A] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>{act.outletId}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        (Stop #{act.stopId})
                      </span>
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        act.synced
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {act.synced ? 'Synchronized' : 'Queued Offline'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Recorded: {new Date(act.offlineTimestamp).toLocaleTimeString()}
                  </div>

                  {act.discrepancyNote && (
                    <div className="p-2 rounded bg-slate-900 text-slate-300 text-[11px] border border-slate-800">
                      Discrepancy: {act.discrepancyNote}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
