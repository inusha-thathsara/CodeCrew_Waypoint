import Dexie, { Table } from 'dexie';

export interface LocalOfflineAction {
  id?: number;
  actionId: string;
  tripId: string;
  stopId: number;
  outletId: string;
  status: string;
  discrepancyNote?: string;
  signatureData?: string;
  offlineTimestamp: string;
  synced: boolean;
}

export class WaypointOfflineDatabase extends Dexie {
  offlineActions!: Table<LocalOfflineAction, number>;

  constructor() {
    super('WaypointOfflineDB');
    this.version(1).stores({
      offlineActions: '++id, actionId, tripId, stopId, synced, offlineTimestamp',
    });
  }
}

export const offlineDb = new WaypointOfflineDatabase();
