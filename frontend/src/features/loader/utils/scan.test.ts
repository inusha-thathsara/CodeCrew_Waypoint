import { describe, expect, it } from "vitest";
import { TRIP } from "../services/seed";
import { evaluateScan } from "./scan";

const base = { trip: TRIP, scans: {}, activeOutletId: "OUT076" };

describe("evaluateScan", () => {
  it("accepts a valid crate", () => {
    expect(evaluateScan({ ...base, raw: "CR-076-001" }).ok).toBe(true);
  });
  it("rejects a duplicate scan", () => {
    const scans = { "CR-076-001": { at: "", tempC: 3, weightKg: 18 } };
    const r = evaluateScan({ ...base, scans, raw: "CR-076-001" });
    expect(r.ok === false && r.reason).toBe("DUPLICATE");
  });
  it("rejects a crate for the wrong destination", () => {
    const r = evaluateScan({ ...base, raw: "CR-002-001" });
    expect(r.ok === false && r.reason).toBe("WRONG_DESTINATION");
    expect(r.ok === false && r.expected).toBe("OUT076");
  });
  it("flags the damaged crate", () => {
    const r = evaluateScan({ ...base, raw: "CR-076-019" });
    expect(r.ok === false && r.reason).toBe("DAMAGED");
  });
  it("rejects an unreadable barcode", () => {
    const r = evaluateScan({ ...base, raw: "abc" });
    expect(r.ok === false && r.reason).toBe("INVALID_FORMAT");
  });
});
