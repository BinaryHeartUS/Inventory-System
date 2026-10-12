import { describe, expect, it } from "vitest";
import { parseModelYearRange } from "./modelYearRange";

describe("parseModelYearRange", () => {
  it("accepts inclusive and open-ended ranges", () => {
    expect(parseModelYearRange("2020", "2024", 2026)).toEqual({
      range: { yearFrom: 2020, yearTo: 2024 },
      error: null,
    });
    expect(parseModelYearRange("2020", "", 2026).range).toEqual({
      yearFrom: 2020,
      yearTo: null,
    });
    expect(parseModelYearRange("", "2024", 2026).range).toEqual({
      yearFrom: null,
      yearTo: 2024,
    });
  });

  it("rejects invalid and reversed ranges", () => {
    expect(parseModelYearRange("1979", "", 2026).range).toBeNull();
    expect(parseModelYearRange("", "2027", 2026).range).toBeNull();
    expect(parseModelYearRange("2025", "2024", 2026).range).toBeNull();
  });
});
