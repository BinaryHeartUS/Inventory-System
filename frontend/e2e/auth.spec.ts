import { test, expect } from "./fixtures/test";
import { authenticate } from "./fixtures/mock-api";

test.describe("authentication", () => {
  test("redirects unauthenticated users to sign in", async ({ page }) => {
    await page.goto("/devices");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });

  test("shows an error for invalid credentials", async ({ page, mockApi }) => {
    mockApi.loginStatus = 401;
    await page.goto("/login");

    await page.getByTestId("login-username").fill("wrong-user");
    await page.getByTestId("login-password").fill("wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid username or password")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("signs in and returns to the requested page", async ({ page }) => {
    await page.goto("/devices");
    await page.getByTestId("login-username").fill("e2e-admin");
    await page.getByTestId("login-password").fill("correct-password");
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
