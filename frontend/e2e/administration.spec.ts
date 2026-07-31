import { test, expect } from "./fixtures/test";
import { authenticate, TEST_CHAPTER } from "./fixtures/mock-api";

test.beforeEach(async ({ page }) => {
  await authenticate(page);
});

test("changes the signed-in account password", async ({ page, mockApi }) => {
  await page.goto("/account");

  await page.getByTestId("current-password").fill("old-password");
  await page.getByTestId("new-password").fill("new-password-123");
  await page.getByTestId("confirm-password").fill("new-password-123");
  await page.getByRole("button", { name: "Update password" }).click();

  await expect(page.getByText("Password updated successfully", { exact: true })).toBeVisible();
  expect(mockApi.request("PUT", "/accounts/42")?.body).toEqual({
    currentPassword: "old-password",
    newPassword: "new-password-123",
  });
});

test("creates a volunteer account with chapter access", async ({ page, mockApi }) => {
  await page.goto("/admin/accounts");
  await expect(page.getByRole("heading", { name: "Manage Accounts" })).toBeVisible();

  await page.getByRole("button", { name: "New Account" }).click();
  await page.getByTestId("account-full-name").fill("E2E New Volunteer");
  await page.getByTestId("account-username").fill("e2e-new-volunteer");
  await page.getByTestId("account-password").fill("temporary-password");
  await page.getByTestId("account-chapter-0").selectOption(String(TEST_CHAPTER.id));
  await page.getByTestId("account-role-0").selectOption("Editor");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByTestId("account-full-name")).toBeHidden();
  expect(mockApi.request("POST", "/accounts")?.body).toEqual({
    name: "E2E New Volunteer",
    username: "e2e-new-volunteer",
    password: "temporary-password",
    chapterId: TEST_CHAPTER.id,
    role: "Editor",
  });
  expect(mockApi.accounts.some((account) => account.username === "e2e-new-volunteer")).toBe(true);
});

test("creates an individual party", async ({ page, mockApi }) => {
  await page.goto("/admin/parties");
  await expect(page.getByRole("heading", { name: "Manage Parties" })).toBeVisible();

  await page.getByRole("button", { name: "Add Individual" }).click();
  const panel = page.getByTestId("person-panel");
  await panel.getByPlaceholder("Full name").fill("E2E Individual Donor");
  await panel.getByPlaceholder("email@example.com").fill("individual@example.test");
  await panel.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("E2E Individual Donor", { exact: true })).toBeVisible();
  expect(mockApi.request("POST", "/party/person")?.body).toEqual({
    name: "E2E Individual Donor",
    email: "individual@example.test",
  });
});

test("adds and removes a lookup option", async ({ page, mockApi }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Manage Options" })).toBeVisible();

  const manufacturers = page.getByTestId("lookup-manufacturers");
  await manufacturers.getByPlaceholder("Add a manufacturer…").fill("E2E Manufacturer");
  await manufacturers.getByRole("button", { name: "Add" }).click();
  await expect(manufacturers.getByText("E2E Manufacturer", { exact: true })).toBeVisible();
  expect(mockApi.request("POST", "/lookup/manufacturers")?.body).toEqual({
    name: "E2E Manufacturer",
  });

  await manufacturers.getByRole("button", { name: "Remove E2E Manufacturer" }).click();
  await expect(manufacturers.getByText("E2E Manufacturer", { exact: true })).toBeHidden();
  expect(mockApi.request("DELETE", "/lookup/manufacturers/E2E%20Manufacturer")).toBeDefined();
});
