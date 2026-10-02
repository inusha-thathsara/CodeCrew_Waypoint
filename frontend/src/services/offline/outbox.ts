import { db } from "./db";
import { useSyncStore } from "./syncStore";
import { loaderApi } from "@/features/loader/services";

let flushing = false;
let queued = false;

const uid = () =>
  crypto.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export async function refreshPending() {
  useSyncStore.setState({
    pending: await db.outbox.where("synced").equals(0).count(),
  });
}

/** Save an event locally first (works offline), then try to upload. */
export async function recordEvent(
  type: string,
  payload: Record<string, unknown> = {},
) {
  await db.outbox.add({
    id: uid(),
    type,
    payload,
    createdAt: Date.now(),
    synced: 0,
  });
  await refreshPending();
  void flushOutbox();
}

/** Upload pending records. Ids are unique, so the server can ignore duplicates. */
export async function flushOutbox() {
  if (!navigator.onLine) return;
  if (flushing) {
    queued = true;
    return;
  }
  flushing = true;
  try {
    const records = await db.outbox.where("synced").equals(0).toArray();
    if (records.length) {
      const { acceptedIds } = await loaderApi.sync(records);
      await db.outbox.where("id").anyOf(acceptedIds).modify({ synced: 1 });
      const lastSync = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      useSyncStore.setState({
        lastSync,
        message: `✓ SYNCED · ${acceptedIds.length} records uploaded`,
      });
      setTimeout(() => useSyncStore.setState({ message: null }), 6000);
    }
  } catch {
    /* stays queued; retried on the next event or when we come back online */
  } finally {
    flushing = false;
    await refreshPending();
    if (queued) {
      queued = false;
      void flushOutbox();
    }
  }
}

export function startSync() {
  const onOnline = () => void flushOutbox();
  window.addEventListener("online", onOnline);
  void flushOutbox();
  return () => window.removeEventListener("online", onOnline);
}
