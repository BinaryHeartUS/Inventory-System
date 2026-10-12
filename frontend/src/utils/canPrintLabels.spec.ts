import { expect, it } from "vitest";
import { canPrintLabels } from "./canPrintLabels";

it("uses the actual runtime's Web Serial availability", () => {
  expect(canPrintLabels()).toBe(typeof navigator !== "undefined" && "serial" in navigator);
});