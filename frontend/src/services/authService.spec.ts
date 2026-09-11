import { describe, expect, it } from "vitest";
import { getTokenExpiration } from "./authService";

function tokenWithPayload(payload: object): string {
  return `header.${btoa(JSON.stringify(payload)).replace(/=/g, "")}.signature`;
}

describe("getTokenExpiration", () => {
  it("returns the expiration timestamp in milliseconds", () => {
    expect(getTokenExpiration(tokenWithPayload({ exp: 1_700_000_000 }))).toBe(1_700_000_000_000);
  });

  it("rejects malformed tokens and non-numeric expiration claims", () => {
    expect(getTokenExpiration("not-a-jwt")).toBeNull();
    expect(getTokenExpiration(tokenWithPayload({ exp: "tomorrow" }))).toBeNull();
  });
});
