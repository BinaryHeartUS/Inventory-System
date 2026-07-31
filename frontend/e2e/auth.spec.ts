import { test, expect } from "./fixtures/test";
import { authenticate, E2E_PASSWORD } from "./fixtures/real-api";

test.describe("authentication", () => {
  test("redirects unauthenticated users to sign in", async ({ page }) => {
    await page.goto("/devices");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("shows an error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.getByTestId("login-username").fill("wrong-user");
    await page.getByTestId("login-password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid username or password")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("logs out when the API rejects an expired session", async ({ page }) => {
    await authenticate(page);
    await page.evaluate(() => {
      const auth = JSON.parse(sessionStorage.getItem("bh_auth") ?? "{}");
      sessionStorage.setItem("bh_auth", JSON.stringify({ ...auth, token: "expired-token" }));
    });
    await page.goto("/devices");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem("bh_auth"))).toBeNull();
  });

  test("signs in and returns to the requested page", async ({ page }) => {
    await page.goto("/devices");
    await page.getByTestId("login-username").fill("e2e-admin");
    await page.getByTestId("login-password").fill(E2E_PASSWORD);
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/devices$/);
    await expect(page.getByRole("heading", { name: "Devices" })).toBeVisible();
  });

  test("signs out and clears access to protected pages", async ({ page }) => {
    await authenticate(page);
    await page.goto("/account");
    await expect(page.getByRole("heading", { name: "Account" })).toBeVisible();

    await page.getByRole("button", { name: "Sign out" }).click();

    await expect(page).toHaveURL(/\/login$/);
    await page.goto("/devices");
    await expect(page).toHaveURL(/\/login$/);
  });
});
