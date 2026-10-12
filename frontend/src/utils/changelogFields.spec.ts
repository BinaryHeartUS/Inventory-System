import { describe, expect, it } from "vitest";
import { buildDeviceFields, buildMiscFields, buildPartFields, buildToolFields } from "./changelogFields";

describe("changelog field builders", () => {
  it.each([
    ["device", buildDeviceFields, 23],
    ["part", buildPartFields, 8],
    ["tool", buildToolFields, 5],
    ["misc", buildMiscFields, 4],
  ] as const)("preserves missing %s snapshots as null", (_name, build, length) => {
    const fields = build({ assetId: 42 });
    expect(fields).toHaveLength(length);
    expect(fields.every((field) => field.old === null && field.new === null)).toBe(true);
    expect(new Set(fields.map((field) => field.label)).size).toBe(length);
  });

  it("formats device identifiers, dates, amounts, hardware, and flags", () => {
    const fields = buildDeviceFields({ assetId: 42, oldManufacturer: "Dell", newManufacturer: "Lenovo", oldYear: 2020, newYear: 2022, oldChapterID: 1, newChapterID: 2, oldValue: 100, newValue: 250, oldHasWifi: false, newHasWifi: true, oldBatteryHealth: 0.5, newBatteryHealth: 0.9, newAcquisitionDate: "2026-01-15" });
    expect(fields).toEqual(expect.arrayContaining([
      { label: "Manufacturer", old: "Dell", new: "Lenovo" },
      { label: "Year", old: "2020", new: "2022" },
      { label: "Chapter ID", old: "#1", new: "#2" },
      { label: "Value", old: "$100.00", new: "$250.00" },
      { label: "Has Wi-Fi", old: "No", new: "Yes" },
      { label: "Battery Health", old: "50%", new: "90%" },
      { label: "Acquisition Date", old: null, new: "Jan 15, 2026" },
    ]));
  });

  it("formats part source and relationships", () => {
    expect(buildPartFields({ assetId: 43, oldWasPurchased: false, newWasPurchased: true, newContainedIn: 42, newChapterID: 1, newDonorID: 2 })).toEqual(expect.arrayContaining([
      { label: "Was Purchased", old: "No", new: "Yes" },
      { label: "Contained In", old: null, new: "#42" },
      { label: "Chapter ID", old: null, new: "#1" },
      { label: "Donor ID", old: null, new: "#2" },
    ]));
  });

  it("formats tool and miscellaneous snapshots", () => {
    expect(buildToolFields({ assetId: 44, newDescription: "Screwdriver", newValue: 10, newChapterID: 1, newDonorID: 2 })).toEqual(expect.arrayContaining([{ label: "Value", old: null, new: "$10.00" }]));
    expect(buildMiscFields({ assetId: 45, newDescription: "Cables", newValue: 100, newDonorId: 1 })).toEqual(expect.arrayContaining([{ label: "Donor ID", old: null, new: "#1" }]));
  });
});