import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPostVoid: vi.fn(),
  apiPutVoid: vi.fn(),
  apiDelete: vi.fn(),
  apiGetOrNull: vi.fn(),
}));

vi.mock("./api", () => ({
  ...api,
  buildQuery: (params: Record<string, unknown>) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    );
    return `?${query}`;
  },
}));

import { checkAssetIdExists, getAssetPath } from "./assetService";
import { createChapter, deleteChapter } from "./chapterService";
import { addManufacturer, deleteManufacturer } from "./lookupService";
import { createNote, updateNote } from "./noteService";
import { createBulkDevices, createDevice } from "./deviceService";
import { getParts } from "./partService";
import { getTools } from "./toolService";
import type { AnyDevice } from "../types/inventory";

describe("service endpoint delegation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the asset existence endpoint", async () => {
    api.apiGet.mockResolvedValue(true);

    await expect(checkAssetIdExists(42)).resolves.toBe(true);
    expect(api.apiGet).toHaveBeenCalledWith("/assets/42/exists");
  });

  it("resolves asset types to detail routes", async () => {
    api.apiGetOrNull.mockResolvedValue({ type: "Misc" });

    await expect(getAssetPath(401)).resolves.toBe("/misc/401");
    expect(api.apiGetOrNull).toHaveBeenCalledWith("/assets/401/type");
  });

  it("creates and deletes chapters with their expected payloads", async () => {
    api.apiPost.mockResolvedValue({ id: 8, name: "National" });

    await expect(createChapter("National")).resolves.toEqual({ id: 8, name: "National" });
    await deleteChapter(8);
    expect(api.apiPost).toHaveBeenCalledWith("/chapters", { name: "National" });
    expect(api.apiDelete).toHaveBeenCalledWith("/chapters/8");
  });

  it("encodes lookup values in delete paths", async () => {
    await addManufacturer("Acme");
    await deleteManufacturer("Dell & Co");

    expect(api.apiPostVoid).toHaveBeenCalledWith("/lookup/manufacturers", { name: "Acme" });
    expect(api.apiDelete).toHaveBeenCalledWith("/lookup/manufacturers/Dell%20%26%20Co");
  });

  it("uses asset-scoped note endpoints", async () => {
    api.apiPost.mockResolvedValue({ id: 3, text: "Checked" });

    await createNote(12, "Checked");
    await updateNote(12, 3, "Updated");
    expect(api.apiPost).toHaveBeenCalledWith("/assets/12/notes", { text: "Checked" });
    expect(api.apiPutVoid).toHaveBeenCalledWith("/assets/12/notes/3", { text: "Updated" });
  });

  it("passes list filters through as query parameters", async () => {
    api.apiGet.mockResolvedValue([]);

    await getParts({ pageKey: 0, pageSize: 100, source: "donated" });
    await getTools({ pageKey: 1, pageSize: 50, chapter: 4 });
    expect(api.apiGet).toHaveBeenNthCalledWith(1, "/parts?pageKey=0&pageSize=100&source=donated");
    expect(api.apiGet).toHaveBeenNthCalledWith(2, "/tools?pageKey=1&pageSize=50&chapter=4");
  });

  it("creates a bulk device batch and returns every generated ID", async () => {
    const request = {
      count: 3,
      type: "Laptop",
      chapterId: 4,
      manufacturer: "Lenovo",
      model: "ThinkPad T14",
      year: 2022,
      donorId: 301,
      acquisitionDate: "2026-10-11",
    };
    api.apiPost.mockResolvedValue({ ids: [1201, 1202, 1203] });

    await expect(createBulkDevices(request)).resolves.toEqual([1201, 1202, 1203]);
    expect(api.apiPost).toHaveBeenCalledWith("/devices/bulk", request);
  });

  it("includes the selected donor when creating a device", async () => {
    const device: AnyDevice = {
      id: 0,
      type: "Desktop",
      manufacturer: "Dell",
      model: "OptiPlex",
      year: 2022,
      ram: 0,
      storage: 0,
      status: "Not Started",
      chapter: "Test Chapter",
      value: null,
      donorId: 301,
      deviceStuck: false,
    };
    const saved = { ...device, id: 501 };
    api.apiGet
      .mockResolvedValueOnce([{ id: 4, name: "Test Chapter" }])
      .mockResolvedValueOnce(saved);
    api.apiPost.mockResolvedValue({ id: 501 });

    await expect(createDevice(device)).resolves.toEqual(saved);
    expect(api.apiPost).toHaveBeenCalledWith(
      "/devices/desktop",
      expect.objectContaining({ donorId: 301 })
    );
  });
});
