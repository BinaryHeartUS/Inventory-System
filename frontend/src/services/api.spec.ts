import { afterEach, describe, expect, it, vi } from "vitest";
import {
  apiGet,
  apiGetOrNull,
  apiPost,
  buildQuery,
  fetchAllPages,
  setTokenProvider,
  setUnauthorizedHandler,
} from "./api";

describe("API utilities", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setTokenProvider(() => null);
    setUnauthorizedHandler(() => {});
  });

  it("builds a query while omitting empty values", () => {
    expect(
      buildQuery({ pageKey: 0, search: "Dell XPS", donated: false, absent: null, blank: "" })
    ).toBe("?pageKey=0&search=Dell+XPS&donated=false");
  });

  it("fetches every page and respects the maximum item limit", async () => {
    const fetchPage = vi.fn(async (pageKey: number) => [[1, 2], [3, 4], [5]][pageKey] ?? []);

    await expect(fetchAllPages(fetchPage, 2, 3)).resolves.toEqual([1, 2, 3]);
    expect(fetchPage).toHaveBeenCalledTimes(2);
  });

  it("sends the token and returns parsed GET data", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 1 }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    setTokenProvider(() => "token");

    await expect(apiGet<{ id: number }>("/assets/1")).resolves.toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledWith("/api/assets/1", {
      headers: { Authorization: "Bearer token" },
    });
  });

  it("returns null for a missing resource", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 404 })));

    await expect(apiGetOrNull("/devices/1")).resolves.toBeNull();
  });

  it("notifies the auth handler and rejects unauthorized requests", async () => {
    const onUnauthorized = vi.fn();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 401 })));
    setUnauthorizedHandler(onUnauthorized);

    await expect(apiGet("/accounts")).rejects.toThrow("UNAUTHORIZED");
    expect(onUnauthorized).toHaveBeenCalledOnce();
  });

  it("serializes POST bodies", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 2 }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiPost<{ id: number }>("/chapters", { name: "National" })).resolves.toEqual({
      id: 2,
    });
    expect(fetchMock).toHaveBeenCalledWith("/api/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "National" }),
    });
  });
});
