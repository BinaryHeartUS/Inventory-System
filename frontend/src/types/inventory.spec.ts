import { describe, expect, it } from "vitest";
import { parseLocation } from "./inventory";

describe("parseLocation", () => {
  it("removes PostgreSQL composite quotes from street and country", () => {
    expect(
      parseLocation('("333 S Wabash Ave",Chicago,Illinois,60604,"United States")')
    ).toEqual({
      street: "333 S Wabash Ave",
      city: "Chicago",
      state: "Illinois",
      zipCode: "60604",
      country: "United States",
    });
  });

  it("keeps commas inside quoted fields", () => {
    expect(
      parseLocation('("12, Main St",Chicago,Illinois,60604,"United States")')?.street
    ).toBe("12, Main St");
  });
});
