import { expect, it } from "vitest";
import { registerServiceWorker } from "./registerServiceWorker";

it("skips service-worker registration in development", () => {
  expect(import.meta.env.DEV).toBe(true);
  expect(registerServiceWorker).not.toThrow();
});
