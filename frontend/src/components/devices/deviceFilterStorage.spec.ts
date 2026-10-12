import { describe, expect, it } from "vitest";
import {
  DEVICE_FILTER_EXPIRY_MS,
  DEVICE_FILTER_STORAGE_KEY,
  clearDeviceFilters,
  createDeviceFilters,
  loadDeviceFilters,
  saveDeviceFilterPreset,
  saveDeviceFilters,
} from "./deviceFilterStorage";

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("device filter storage", () => {
  it("round-trips every device filter", () => {
    const storage = createStorage();
    const filters = createDeviceFilters({
      search: "Framework",
      types: ["Laptop"],
      statuses: ["In Progress"],
      operatingSystems: ["Ubuntu"],
      chapter: 101,
      stuckOnly: true,
      yearFrom: 2020,
      yearTo: 2024,
      acquiredFrom: "2025-12-01",
      acquiredTo: "2026-01-15",
      sort: "model",
      dir: "desc",
    });

    saveDeviceFilters(filters, storage, 1_000);

    expect(loadDeviceFilters(storage, 2_000)).toEqual(filters);
  });

  it("expires filters six hours after their last update", () => {
    const storage = createStorage();
    saveDeviceFilters(createDeviceFilters({ search: "Framework" }), storage, 1_000);

    expect(loadDeviceFilters(storage, 1_000 + DEVICE_FILTER_EXPIRY_MS)).toEqual(
      createDeviceFilters()
    );
    expect(storage.getItem(DEVICE_FILTER_STORAGE_KEY)).toBeNull();
  });

  it("creates navigation presets from defaults and clears them", () => {
    const storage = createStorage();
    saveDeviceFilterPreset({ chapter: 101, statuses: ["Donated"] }, storage, 1_000);

    expect(loadDeviceFilters(storage, 2_000)).toEqual(
      createDeviceFilters({ chapter: 101, statuses: ["Donated"] })
    );

    clearDeviceFilters(storage);
    expect(storage.getItem(DEVICE_FILTER_STORAGE_KEY)).toBeNull();
  });

  it("discards invalid acquisition bounds while retaining other filters", () => {
    const storage = createStorage();
    saveDeviceFilters(
      createDeviceFilters({
        search: "Framework",
        acquiredFrom: "2026-01-15",
        acquiredTo: "2025-12-01",
      }),
      storage,
      1_000
    );
    const restored = loadDeviceFilters(storage, 2_000);
    expect(restored.search).toBe("Framework");
    expect(restored.acquiredFrom).toBeNull();
    expect(restored.acquiredTo).toBeNull();
  });

  it("discards malformed stored filters", () => {
    const storage = createStorage();
    storage.setItem(DEVICE_FILTER_STORAGE_KEY, "not-json");

    expect(loadDeviceFilters(storage)).toEqual(createDeviceFilters());
    expect(storage.getItem(DEVICE_FILTER_STORAGE_KEY)).toBeNull();
  });
});
