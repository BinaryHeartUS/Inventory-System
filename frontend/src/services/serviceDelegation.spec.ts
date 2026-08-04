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

import { checkAssetIdExists } from "./assetService";
import { createChapter, deleteChapter } from "./chapterService";
import { addManufacturer, deleteManufacturer } from "./lookupService";
import { createNote, updateNote } from "./noteService";
import { getParts } from "./partService";
import { getTools } from "./toolService";

describe("service endpoint delegation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the asset existence endpoint", async () => {
    api.apiGet.mockResolvedValue(true);

    await expect(checkAssetIdExists(42)).resolves.toBe(true);
    expect(api.apiGet).toHaveBeenCalledWith("/assets/42/exists");
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
});
