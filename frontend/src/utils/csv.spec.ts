import { describe, expect, it } from "vitest";
import { escapeCsvCell, slugify } from "./csv";

describe("CSV utilities", () => {
  it("quotes cells and escapes embedded quotes", () => {
    expect(escapeCsvCell('Dell "Latitude"')).toBe('"Dell ""Latitude"""');
    expect(escapeCsvCell(null)).toBe('""');
  });

  it("creates lowercase filename slugs", () => {
    expect(slugify("Rose-Hulman Institute of Technology")).toBe(
      "rose-hulman-institute-of-technology"
    );
  });
});
