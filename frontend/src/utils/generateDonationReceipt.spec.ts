import { describe, expect, it } from "vitest";
import { buildDescription } from "./generateDonationReceipt";

describe("receipt descriptions", () => {
  it("handles empty selections", () => {
    expect(buildDescription([])).toBe("");
  });
  it("groups identical assets by label and year in selection order", () => {
    expect(
      buildDescription([
        { label: "ThinkPad", year: 2022 },
        { label: "RAM" },
        { label: "ThinkPad", year: 2022 },
        { label: "ThinkPad", year: 2023 },
        { label: "RAM", year: null },
      ])
    ).toBe("2x 2022 ThinkPad, 2x RAM, 2023 ThinkPad");
  });
  it("handles string years and omitted years", () => {
    expect(
      buildDescription([
        { label: "Laptop", year: "2020" },
        { label: "Charger", year: "" },
      ])
    ).toBe("2020 Laptop, Charger");
  });
});
