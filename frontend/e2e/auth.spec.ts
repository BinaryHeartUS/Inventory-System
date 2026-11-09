import type { Page } from "@playwright/test";
import { createHash } from "node:crypto";
import { test, expect } from "./fixtures/test";
import { authenticate, AUTH_ISSUER } from "./fixtures/real-api";
import { DEVICE_FILTER_STORAGE_KEY } from "../src/components/devices/deviceFilterStorage";

async function getStoredTokenExpiration(page: Page): Promise<number> {
  return page.evaluate(() => {
    const auth = JSON.parse(sessionStorage.getItem("bh_auth") ?? "{}");
    const segment = auth.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(segment.padEnd(Math.ceil(segment.length / 4) * 4, "=")));
    return payload.exp * 1000;
  });
}

test.describe("authentication", () => {
  test("redirects unauthenticated users to sign in", async ({ page }) => {
    await page.goto("/devices");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in to Inventory" })).toBeVisible();
  });

  test("logs out when the API rejects an expired session", async ({ page }) => {
    await authenticate(page);
    await page.evaluate(() => {
      const auth = JSON.parse(sessionStorage.getItem("bh_auth") ?? "{}");
      const [header, payload] = auth.token.split(".");
      sessionStorage.setItem("bh_auth", JSON.stringify({ ...auth, token: `${header}.${payload}.invalid` }));
    });
    await page.goto("/devices");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in to Inventory" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem("bh_auth"))).toBeNull();
  });

  test("rejects an expired stored session before restoring auth", async ({ page }) => {
    await authenticate(page);
    const expiresAt = await getStoredTokenExpiration(page);
    await page.clock.install({ time: expiresAt + 1 });

    await page.goto("/devices");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in to Inventory" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem("bh_auth"))).toBeNull();
  });

  test("logs out when an active session reaches its expiration", async ({ page }) => {
    await authenticate(page);
    const expiresAt = await getStoredTokenExpiration(page);
    await page.clock.install({ time: expiresAt - 1_000 });
    await page.goto("/devices");
    await expect(page.getByRole("heading", { name: "Devices" })).toBeVisible();

    await page.clock.fastForward(1_001);

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in to Inventory" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem("bh_auth"))).toBeNull();
  });

  test("signs in and returns to the requested page", async ({ page }) => {
    await page.goto("/devices");
    await page.getByRole("button", { name: "Sign in with BinaryHeart" }).click();
    await expect(page).toHaveURL(new RegExp(`^${AUTH_ISSUER}/api/oauth/authorize\\?`));
    const authorize = new URL(page.url());
    expect(authorize.searchParams.get("code_challenge_method")).toBe("S256");
    expect(authorize.searchParams.get("code_challenge")).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(authorize.searchParams.get("state")).toMatch(/^[A-Za-z0-9_-]{43}$/);
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page).toHaveURL(/\/devices$/);
    await expect(page.getByRole("heading", { name: "Devices" })).toBeVisible();
    const auth = await page.evaluate(() => JSON.parse(sessionStorage.getItem("bh_auth") ?? "{}"));
    expect(auth).toMatchObject({ issuer: AUTH_ISSUER, username: "e2e-admin", role: "Admin" });
    expect(auth.chapterIds).toEqual(expect.arrayContaining([1, 101]));
    expect(auth.mode).toBeUndefined();
  });

  test("rejects a callback with a modified state", async ({ page }) => {
    await page.addInitScript({ content: `
      if (location.pathname === "/auth/callback") {
        const flow = JSON.parse(sessionStorage.getItem("bh_oauth") ?? "{}");
        flow.state = "wrong-state";
        sessionStorage.setItem("bh_oauth", JSON.stringify(flow));
      }
    ` });
    await page.goto("/devices");
    await page.getByRole("button", { name: "Sign in with BinaryHeart" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("alert")).toContainText("Sign-in verification failed");
    expect(await page.evaluate(() => sessionStorage.getItem("bh_auth"))).toBeNull();
  });

  test("issuer rejects an incorrect PKCE verifier and consumes the code", async ({ page }) => {
    await page.goto("/login");
    const verifier = "b".repeat(43);
    const challenge = createHash("sha256").update(verifier).digest("base64url");
    const origin = new URL(page.url()).origin;
    const authorize = new URL(`${AUTH_ISSUER}/api/oauth/authorize`);
    authorize.search = new URLSearchParams({
      response_type: "code",
      client_id: "inventory",
      redirect_uri: `${origin}/auth/callback`,
      code_challenge: challenge,
      code_challenge_method: "S256",
      state: "c".repeat(43),
    }).toString();
    const response = await page.request.post(authorize.href, {
      form: { role: "Admin" },
      maxRedirects: 0,
    });
    expect(response.status()).toBe(302);
    const callback = new URL(response.headers().location);
    const exchange = {
      grant_type: "authorization_code",
      client_id: "inventory",
      code: callback.searchParams.get("code")!,
      redirect_uri: authorize.searchParams.get("redirect_uri")!,
      code_verifier: "a".repeat(43),
    };
    const first = await page.request.post(`${AUTH_ISSUER}/api/oauth/token`, { form: exchange });
    expect(first.status()).toBe(400);
    const replay = await page.request.post(`${AUTH_ISSUER}/api/oauth/token`, {
      form: { ...exchange, code_verifier: verifier },
    });
    expect(replay.status()).toBe(400);
  });

  test("signs out and clears access to protected pages", async ({ page }) => {
    await authenticate(page);
    await page.evaluate(
      ([key, value]) => sessionStorage.setItem(key, value),
      [DEVICE_FILTER_STORAGE_KEY, "saved-filters"]
    );
    await page.goto("/devices");
    await expect(page.getByRole("heading", { name: "Devices" })).toBeVisible();

    const logout = page.waitForRequest((request) => request.url().startsWith(`${AUTH_ISSUER}/api/oauth/logout`));
    await page.getByRole("button", { name: "Sign out" }).click();
    const logoutUrl = new URL((await logout).url());
    expect(logoutUrl.searchParams.get("client_id")).toBe("inventory");
    expect(logoutUrl.searchParams.get("post_logout_redirect_uri")).toBe(`${new URL(page.url()).origin}/login`);

    await expect(page).toHaveURL(/\/login$/);
    await expect
      .poll(() => page.evaluate((key) => sessionStorage.getItem(key), DEVICE_FILTER_STORAGE_KEY))
      .toBeNull();
    await page.goto("/devices");
    await expect(page).toHaveURL(/\/login$/);
  });
});
