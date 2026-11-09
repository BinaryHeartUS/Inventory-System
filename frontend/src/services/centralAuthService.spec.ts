import { webcrypto, createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadAuthConfig } from "./authConfig";
import {
  beginCentralLogin,
  centralLogout,
  finishCentralLogin,
  safeInventoryPath,
} from "./centralAuthService";
import { getStoredAuth } from "./authService";

const issuer = "https://auth.binaryheart.dev";
const origin = "https://inventory.binaryheart.dev";
let storage: Map<string, string>;
const assign = vi.fn();

beforeEach(async () => {
  storage = new Map();
  vi.stubGlobal("crypto", webcrypto);
  vi.stubGlobal("window", { location: { origin, assign } });
  vi.stubGlobal("sessionStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({ issuer, clientId: "inventory" }))
  );
  await loadAuthConfig();
  assign.mockClear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function callback(returnPath = "/devices?search=test"): Promise<string> {
  await beginCentralLogin(returnPath);
  const authorize = new URL(assign.mock.calls.at(-1)![0]);
  return `${origin}/auth/callback?${new URLSearchParams({
    code: "one-use-code",
    state: authorize.searchParams.get("state")!,
    iss: issuer,
  })}`;
}

function token() {
  return `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature`;
}

describe("central authentication", () => {
  it.each([
    {},
    { issuer: "", clientId: "inventory" },
    { issuer: "http://auth.binaryheart.org", clientId: "inventory" },
    { issuer: "https://auth.binaryheart.org/", clientId: "inventory" },
    { issuer, clientId: "another-service" },
  ])("rejects invalid authentication configuration %j", async (config) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(config)));
    await expect(loadAuthConfig()).rejects.toThrow();
  });

  it("uses random state and an S256 challenge, with an exact callback", async () => {
    await callback();
    const url = new URL(assign.mock.calls[0][0]);
    const flow = JSON.parse(storage.get("bh_oauth")!);
    expect(url.origin).toBe(issuer);
    expect(url.pathname).toBe("/api/oauth/authorize");
    expect(url.searchParams.get("redirect_uri")).toBe(origin + "/auth/callback");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toBe(
      createHash("sha256").update(flow.verifier).digest("base64url")
    );
    expect(flow.state).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(flow.verifier).not.toBe(flow.state);
    expect(url.searchParams.has("code_verifier")).toBe(false);
    expect(flow.returnPath).toBe("/devices?search=test");
  });

  it("exchanges without preflight headers and stores only backend-normalized permissions", async () => {
    const url = await callback();
    const accessToken = token();
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ access_token: accessToken, token_type: "Bearer" }))
      .mockResolvedValueOnce(
        Response.json({
          token: accessToken,
          username: "viewer",
          role: "Viewer",
          chapterRoles: [{ chapterId: 3, role: "Viewer" }],
        })
      );
    vi.stubGlobal("fetch", fetch);
    expect(await finishCentralLogin(url)).toBe("/devices?search=test");
    expect(fetch.mock.calls[0][0]).toBe(issuer + "/api/oauth/token");
    const options = fetch.mock.calls[0][1] as RequestInit;
    expect(options.headers).toBeUndefined();
    expect(options.credentials).toBe("omit");
    expect((options.body as URLSearchParams).get("code_verifier")).toHaveLength(43);
    expect(fetch.mock.calls[1][0]).toBe("/api/auth/session");
    expect(getStoredAuth()).toMatchObject({ issuer, role: "Viewer", chapterIds: [3] });
    expect(storage.has("bh_oauth")).toBe(false);
    await expect(finishCentralLogin(url)).rejects.toThrow("expired");
  });

  it.each([
    "state",
    "iss",
    "duplicate-state",
    "duplicate-code",
    "expired",
    "future",
    "callback",
    "redirect",
    "flow-issuer",
  ])("rejects %s before attempting token exchange", async (failure) => {
    const url = new URL(await callback());
    const flow = JSON.parse(storage.get("bh_oauth")!);
    if (failure === "state") url.searchParams.set("state", "wrong");
    if (failure === "iss") url.searchParams.set("iss", "https://other.invalid");
    if (failure === "duplicate-state") url.searchParams.append("state", flow.state);
    if (failure === "duplicate-code") url.searchParams.append("code", "another");
    if (failure === "expired") flow.createdAt -= 11 * 60 * 1000;
    if (failure === "future") flow.createdAt += 60 * 1000;
    if (failure === "callback") url.hostname = "other.invalid";
    if (failure === "redirect") flow.redirectUri = origin + "/other";
    if (failure === "flow-issuer") flow.issuer = "https://other.invalid";
    storage.set("bh_oauth", JSON.stringify(flow));
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    await expect(finishCentralLogin(url.href)).rejects.toThrow();
    expect(fetch).not.toHaveBeenCalled();
    expect(storage.has("bh_auth")).toBe(false);
  });

  it("surfaces provider and token/Inventory verification failures without persisting a session", async () => {
    const url = new URL(await callback());
    url.searchParams.set("error", "access_denied");
    await expect(finishCentralLogin(url.href)).rejects.toThrow("not completed");
    const retry = await callback();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 400 })));
    await expect(finishCentralLogin(retry)).rejects.toThrow("Unable to complete");
    const another = await callback();
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({ access_token: token(), token_type: "Bearer" }))
        .mockResolvedValueOnce(new Response("", { status: 403 }))
    );
    await expect(finishCentralLogin(another)).rejects.toThrow("Inventory access");
    expect(storage.has("bh_auth")).toBe(false);
  });

  it("discards old sessions and sessions from a different issuer", () => {
    storage.set("bh_auth", JSON.stringify({ token: token(), role: "Admin" }));
    expect(getStoredAuth()).toBeNull();
    storage.set("bh_auth", JSON.stringify({ token: token(), issuer: "https://other.invalid" }));
    expect(getStoredAuth()).toBeNull();
    expect(storage.has("bh_auth")).toBe(false);
  });

  it("clears local tokens and ends the central session on explicit sign-out", () => {
    storage.set("bh_auth", "old");
    storage.set("bh_oauth", "old");
    centralLogout();
    expect(storage.size).toBe(0);
    const url = new URL(assign.mock.calls[0][0]);
    expect(url.origin + url.pathname).toBe(issuer + "/api/oauth/logout");
    expect(url.searchParams.get("post_logout_redirect_uri")).toBe(origin + "/login");
  });

  it.each([
    "https://other.invalid",
    "//other.invalid",
    "///",
    "/\\other.invalid",
    "/\t/other.invalid",
    "/login",
    "/auth/callback?code=old",
    "/\u0001/other",
  ])("does not accept unsafe or looping return path %s", (path) => {
    expect(safeInventoryPath(path)).toBe("/");
  });
});
