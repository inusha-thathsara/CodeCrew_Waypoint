import { Wifi, WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/lib/useOnlineStatus";
import { useSyncStore } from "@/services/offline/syncStore";

export function SyncStatus() {
  const online = useOnlineStatus();
  const { pending, lastSync, message } = useSyncStore();
  return (
    <div className="shrink-0 text-right" aria-live="polite">
      <p
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
          online ? "bg-ok/15 text-ok" : "bg-warn/20 text-amber-300"
        }`}
      >
        {online ? <Wifi size={14} /> : <WifiOff size={14} />}
        {online ? "Online" : "Offline"}
        {pending > 0 && (
          <span className="rounded-full bg-white/20 px-1.5 text-white">
            {pending}
            <span className="sr-only"> records pending</span>
          </span>
        )}
      </p>
      <p className="mt-0.5 hidden text-[11px] text-slate-400 sm:block">
        {!online
          ? "Saved on this device"
          : (message ?? `Last sync ${lastSync ?? "—"}`)}
      </p>
    </div>
  );
}
