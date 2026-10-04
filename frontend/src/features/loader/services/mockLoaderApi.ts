import type { LoaderApi } from "../types";
import { DASHBOARD, DEMO_PINS, PLAN_UPDATE, TRIP } from "./seed";

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const accepted = new Set<string>(); // the real server upserts by id, so re-sends can't duplicate

export const mockLoaderApi: LoaderApi = {
  async getDashboard() {
    await delay();
    return structuredClone(DASHBOARD);
  },
  async getTrip() {
    await delay();
    return structuredClone(TRIP);
  },
  async getPlanUpdate() {
    await delay(150);
    return structuredClone(PLAN_UPDATE);
  },
  async verifyPin(role, pin) {
    await delay(300);
    return DEMO_PINS[role] === pin;
  },
  async sync(records) {
    await delay(400);
    records.forEach((r) => accepted.add(r.id));
    return { acceptedIds: records.map((r) => r.id) };
  },
};
