import { create } from "zustand";

export const useSyncStore = create<{
  pending: number;
  lastSync: string | null;
  message: string | null;
}>(() => ({
  pending: 0,
  lastSync: null,
  message: null,
}));
