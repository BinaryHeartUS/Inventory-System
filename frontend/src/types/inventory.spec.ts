import { describe, expect, it } from "vitest";
import { formatLocation, parseLocation } from "./inventory";

describe("parseLocation", () => {
  it("removes PostgreSQL composite quotes from street and country", () => {
    expect(parseLocation('("333 S Wabash Ave",Chicago,Illinois,60604,"United States")')).toEqual({
      street: "333 S Wabash Ave",
      city: "Chicago",
      state: "Illinois",
      zipCode: "60604",
      country: "United States",
    });
  });

  it("keeps commas inside quoted fields", () => {
    expect(parseLocation('("12, Main St",Chicago,Illinois,60604,"United States")')?.street).toBe(
      "12, Main St"
    );
  })
})

describe("party location serialization", () => {
  it("round-trips a complete address", () => {
    const address = {
      street: "123 Main St",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "USA",
    };
    expect(formatLocation(address)).toBe("(123 Main St,Chicago,IL,60601,USA)");
    expect(parseLocation(formatLocation(address))).toEqual(address);
  });

  it("serializes missing fields and handles partial addresses", () => {
    expect(formatLocation({})).toBe("(,,,,)");
    expect(parseLocation(formatLocation({ city: "Chicago" }))).toEqual({
      street: "",
      city: "Chicago",
      state: "",
      zipCode: "",
      country: "",
    });
  });

  it.each([null, undefined, "", "(,,,,)", "( , , , , )", "(street,city)"])(
    "returns null for %s",
    (value) => {
      expect(parseLocation(value)).toBeNull();
    }
  );

  it("trims fields and preserves commas in country names", () => {
    expect(parseLocation("( street , city , state , 12345 ,Country, Region)")).toEqual({
      street: "street",
      city: "city",
      state: "state",
      zipCode: "12345",
      country: "Country, Region",
    });
  });
});
