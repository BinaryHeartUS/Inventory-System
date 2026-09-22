import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiGetOrNull: vi.fn(),
  apiPost: vi.fn(),
  apiPutVoid: vi.fn(),
  apiDelete: vi.fn(),
}));

vi.mock("./api", () => ({
  ...api,
  buildQuery: (params: Record<string, unknown>) =>
    `?${new URLSearchParams(Object.entries(params).map(([key, value]) => [key, String(value)]))}`,
}));

import {
  createMisc,
  deleteMisc,
  getMisc,
  getMiscByDonor,
  getMiscChangelog,
  updateMisc,
} from "./miscService";

const misc = {
  id: 401,
  description: "Cable bundle",
  acquisitionDate: "2026-09-22",
  value: 25,
  donorId: 9,
};

describe("miscService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("gets one donor's paginated misc assets", async () => {
    api.apiGet.mockResolvedValue([misc]);

    await expect(getMiscByDonor({ donorId: 9, pageKey: 2, pageSize: 25 })).resolves.toEqual([misc]);

    expect(api.apiGet).toHaveBeenCalledWith("/misc?donorId=9&pageKey=2&pageSize=25");
  });

  it("gets a misc asset by ID with null support", async () => {
    api.apiGetOrNull.mockResolvedValue(null);

    await expect(getMisc(401)).resolves.toBeNull();

    expect(api.apiGetOrNull).toHaveBeenCalledWith("/misc/401");
  });

  it("creates a generated-ID misc asset without chapter data", async () => {
    const unsaved = { ...misc, id: 0, acquisitionDate: null };
    api.apiPost.mockResolvedValue({ id: 401 });
    api.apiGet.mockResolvedValue(misc);

    await expect(createMisc(unsaved)).resolves.toEqual(misc);

    expect(api.apiPost).toHaveBeenCalledWith("/misc", {
      assetId: undefined,
      description: "Cable bundle",
      acquisitionDate: undefined,
      value: 25,
      donorId: 9,
    });
    expect(api.apiGet).toHaveBeenCalledWith("/misc/401");
  });

  it("preserves an explicit asset ID and acquisition date on create", async () => {
    api.apiPost.mockResolvedValue({ id: 401 });
    api.apiGet.mockResolvedValue(misc);

    await createMisc(misc);

    expect(api.apiPost).toHaveBeenCalledWith("/misc", {
      assetId: 401,
      description: "Cable bundle",
      acquisitionDate: "2026-09-22",
      value: 25,
      donorId: 9,
    });
  });

  it("updates then reloads a misc asset", async () => {
    api.apiGet.mockResolvedValue(misc);

    await expect(updateMisc(401, misc)).resolves.toEqual(misc);

    expect(api.apiPutVoid).toHaveBeenCalledWith("/misc/401", {
      assetId: 401,
      description: "Cable bundle",
      acquisitionDate: "2026-09-22",
      value: 25,
      donorId: 9,
    });
    expect(api.apiGet).toHaveBeenCalledWith("/misc/401");
  });

  it("deletes a misc asset by ID", async () => {
    await deleteMisc(401);

    expect(api.apiDelete).toHaveBeenCalledWith("/misc/401");
  });

  it("maps changelog misc IDs to the shared asset ID", async () => {
    api.apiGet.mockResolvedValue([{ id: 1, miscId: 401 }, { id: 2 }]);

    await expect(getMiscChangelog(401)).resolves.toEqual([
      { id: 1, miscId: 401, assetId: 401 },
      { id: 2, assetId: 0 },
    ]);

    expect(api.apiGet).toHaveBeenCalledWith("/misc/401/changelog");
  });
});
