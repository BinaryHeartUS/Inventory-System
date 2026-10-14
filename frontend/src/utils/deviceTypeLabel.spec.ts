import { describe, expect, it } from "vitest";
import { deviceTypeLabel, deviceTypePluralLabel } from "./deviceTypeLabel";

describe("device type labels", () => {
  it.each([
    ["Tablet", "Mobile Device"],
    ["Desktop", "Desktop"],
    ["Laptop", "Laptop"],
    [null, ""],
    [undefined, ""],
  ] as const)("labels %s", (value, label) => {
    expect(deviceTypeLabel(value)).toBe(label);
  });
  it.each([
    ["Tablet", "Mobile Devices"],
    ["Desktop", "Desktops"],
    ["Laptop", "Laptops"],
  ])("pluralizes %s", (value, label) => {
    expect(deviceTypePluralLabel(value)).toBe(label);
  });
});
