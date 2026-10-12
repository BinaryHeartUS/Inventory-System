import { describe, expect, it } from "vitest";
import { escapeCsvCell, slugify, today } from "./csv";

describe("CSV utilities", () => {
  it("uses today's ISO date for filenames", () => { expect(today()).toBe(new Date().toISOString().slice(0, 10)); });
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
