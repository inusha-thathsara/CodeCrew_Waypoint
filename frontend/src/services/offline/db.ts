import Dexie, { type Table } from "dexie";

export interface OutboxRecord {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: number;
  synced: 0 | 1;
}
export interface KvRecord {
  key: string;
  value: unknown;
}

class WaypointDb extends Dexie {
  outbox!: Table<OutboxRecord, string>;
  kv!: Table<KvRecord, string>;
  constructor() {
    super("waypoint-loader");
    this.version(1).stores({ outbox: "id, synced, createdAt", kv: "key" });
  }
}
export const db = new WaypointDb();
