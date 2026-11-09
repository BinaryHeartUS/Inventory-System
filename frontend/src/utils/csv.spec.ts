import { describe, expect, it } from "vitest";
import { escapeCsvCell, slugify, today } from "./csv";

describe("CSV utilities", () => {
  it("uses today's ISO date for filenames", () => {
    expect(today()).toBe(new Date().toISOString().slice(0, 10));
  });
  it("quotes cells and escapes embedded quotes", () => {
    expect(escapeCsvCell('Dell "Latitude"')).toBe('"Dell ""Latitude"""');
    expect(escapeCsvCell(null)).toBe('""');
  });

  it.each(["=1+1", "+1+1", "-1+1", "@SUM(A1)", " \t=1+1", "\r\n=1+1"])(
    "neutralizes spreadsheet formulas in text: %j",
    (value) => {
      expect(escapeCsvCell(value)).toBe(`"'${value}"`);
    }
  );

  it("preserves numeric values, including negative numbers", () => {
    expect(escapeCsvCell(-42)).toBe('"-42"');
    expect(escapeCsvCell(0)).toBe('"0"');
    expect(escapeCsvCell("ordinary text")).toBe('"ordinary text"');
  });

  it("creates lowercase filename slugs", () => {
    expect(slugify("Rose-Hulman Institute of Technology")).toBe(
      "rose-hulman-institute-of-technology"
    );
  });
});
