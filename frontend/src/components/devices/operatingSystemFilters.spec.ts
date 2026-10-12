import { describe, expect, it } from "vitest";
import {
  getOperatingSystemFilterParams,
  getSelectedOperatingSystems,
  UNSPECIFIED_OPERATING_SYSTEM,
} from "./operatingSystemFilters";

const OPTIONS = ["Ubuntu", "Windows 11"];

describe("operating system filters", () => {
  it("selects every named and unspecified option by default", () => {
    expect(getSelectedOperatingSystems(null, false, OPTIONS)).toEqual([
      "Ubuntu",
      "Windows 11",
      UNSPECIFIED_OPERATING_SYSTEM,
    ]);
  });

  it("trims, orders, and combines requested options", () => {
    expect(getSelectedOperatingSystems("Windows 11, Ubuntu", true, OPTIONS)).toEqual([
      "Ubuntu",
      "Windows 11",
      UNSPECIFIED_OPERATING_SYSTEM,
    ]);
  });

  it("omits API parameters for the default selection", () => {
    expect(
      getOperatingSystemFilterParams(
        ["Ubuntu", "Windows 11", UNSPECIFIED_OPERATING_SYSTEM],
        OPTIONS
      )
    ).toEqual({
      operatingSystems: undefined,
      includeUnspecifiedOperatingSystem: undefined,
    });
  });

  it("maps named and unspecified selections to separate API parameters", () => {
    expect(
      getOperatingSystemFilterParams(["Ubuntu", UNSPECIFIED_OPERATING_SYSTEM], OPTIONS)
    ).toEqual({
      operatingSystems: "Ubuntu",
      includeUnspecifiedOperatingSystem: true,
    });
    expect(getOperatingSystemFilterParams([UNSPECIFIED_OPERATING_SYSTEM], OPTIONS)).toEqual({
      operatingSystems: undefined,
      includeUnspecifiedOperatingSystem: true,
    });
  });
});