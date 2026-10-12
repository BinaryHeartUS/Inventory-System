import { describe, expect, it } from "vitest";
import {
  formatCalendarDate,
  parseCalendarDate,
  parseAcquisitionDateRange,
} from "./acquisitionDateRange";

describe("acquisition date ranges", () => {
  it("accepts inclusive, equal, open-ended and empty ranges", () => {
    expect(parseAcquisitionDateRange("2025-12-01", "2026-01-15").range).toEqual({
      acquiredFrom: "2025-12-01",
      acquiredTo: "2026-01-15",
    });
    expect(parseAcquisitionDateRange("2026-01-15", "2026-01-15").error).toBeNull();
    expect(parseAcquisitionDateRange("2026-01-15", "").range).toEqual({
      acquiredFrom: "2026-01-15",
      acquiredTo: null,
    });
    expect(parseAcquisitionDateRange("", "2026-01-15").range).toEqual({
      acquiredFrom: null,
      acquiredTo: "2026-01-15",
    });
    expect(parseAcquisitionDateRange("", "").range).toEqual({
      acquiredFrom: null,
      acquiredTo: null,
    });
  });

  it("rejects reversed and impossible dates", () => {
    expect(parseAcquisitionDateRange("2026-01-15", "2025-12-01").range).toBeNull();
    for (const value of ["2025-02-29", "2026-04-31", "2026-13-01", "not-a-date", "0000-01-01"]) {
      expect(parseCalendarDate(value)).toBeUndefined();
      expect(parseAcquisitionDateRange(value, "").range).toBeNull();
    }
  });

  it("round-trips dates in local calendar time without UTC conversion", () => {
    for (const value of ["2024-02-29", "2026-01-15", "2026-12-31"]) {
      expect(formatCalendarDate(parseCalendarDate(value)!)).toBe(value);
    }
  });
});
