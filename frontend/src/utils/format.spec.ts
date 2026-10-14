import { describe, expect, it } from "vitest";
import {
  formatBool,
  formatDate,
  formatId,
  formatMoney,
  formatNumber,
  formatPercent,
  formatText,
} from "./format";

describe("display formatters", () => {
  it("handles zero, true, null, and undefined consistently", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(null)).toBeNull();
    expect(formatId(null)).toBeNull();
    expect(formatBool(true)).toBe("Yes");
    expect(formatBool(undefined)).toBeNull();
    expect(formatPercent(null)).toBeNull();
    expect(formatMoney(0)).toBe("$0.00");
  });
  it("formats display values and preserves missing values", () => {
    expect(formatText("")).toBe("");
    expect(formatText(undefined)).toBeNull();
    expect(formatMoney(12.5)).toBe("$12.50");
    expect(formatMoney(null)).toBeNull();
    expect(formatId(42)).toBe("#42");
    expect(formatBool(false)).toBe("No");
    expect(formatPercent(0.855)).toBe("86%");
  });

  it("formats date-only and timestamp dates without timezone shifts", () => {
    expect(formatDate("2025-03-04")).toBe("Mar 4, 2025");
    expect(formatDate("2025-03-04T23:59:59Z")).toBe("Mar 4, 2025");
    expect(formatDate(null)).toBeNull();
  });
});
