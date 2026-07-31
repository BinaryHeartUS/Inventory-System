import { expect, test } from "./fixtures/test";
import { authenticate, TEST_CHAPTER } from "./fixtures/mock-api";

async function openAddAsset(page: import("@playwright/test").Page) {
  await authenticate(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Add Asset" }).click();
  return page.getByRole("dialog", { name: "Add New Asset" });
}

async function openDesktopFields(page: import("@playwright/test").Page) {
  const dialog = await openAddAsset(page);
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByRole("button", { name: /^Device/ }).click();
  await dialog.getByRole("button", { name: /^Desktop/ }).click();
  return dialog;
}

test("logs out when an API request reports an expired session", async ({ page, mockApi }) => {
  mockApi.fail("GET", "/chapters", 401, "Session expired");
  await authenticate(page);
  await page.goto("/devices");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem("bh_auth"))).toBeNull();
});

test("rejects an asset ID that is already in use", async ({ page, mockApi }) => {
  const dialog = await openAddAsset(page);
  await dialog.getByRole("button", { name: "Input an ID" }).click();
  await dialog.getByTestId("asset-id").fill("1001");

  await expect(dialog.getByText("ID 1001 is already in use.")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Continue" })).toBeDisabled();
  expect(mockApi.request("GET", "/assets/1001/exists")).toBeDefined();
});

test("requires the core asset details before submission", async ({ page, mockApi }) => {
  const dialog = await openDesktopFields(page);

  await expect(dialog.getByRole("button", { name: "Add Asset", exact: true })).toBeDisabled();
  expect(mockApi.request("POST", "/devices/desktop")).toBeUndefined();
});

test("keeps add asset open when creation fails", async ({ page, mockApi }) => {
  mockApi.fail("POST", "/devices/desktop", 500, "Unable to create device");
  const dialog = await openDesktopFields(page);
  await page.getByTestId("field-manufacturer").selectOption("Framework");
  await page.getByTestId("field-model").fill("Failure Test Desktop");
  await page.getByTestId("field-chapter").selectOption(TEST_CHAPTER.name);
  await dialog.getByRole("button", { name: "Add Asset", exact: true }).click();

  await expect(page.getByText("Unable to create device", { exact: true })).toBeVisible();
  await expect(dialog).toBeVisible();
  expect(mockApi.devices.some((device) => device.model === "Failure Test Desktop")).toBe(false);
});

test("preserves device edits when saving fails", async ({ page, mockApi }) => {
  mockApi.fail("PUT", "/devices/laptop/1001", 500, "Unable to save device");
  await authenticate(page);
  await page.goto("/devices/1001");
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByTestId("edit-field-model").fill("Unsaved failure model");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByText("Unable to save device", { exact: true })).toBeVisible();
  await expect(page.getByTestId("edit-field-model")).toHaveValue("Unsaved failure model");
  expect(mockApi.devices.find((device) => device.id === 1001)?.model).toBe("Laptop 13");
});

test("prevents viewers from editing device details", async ({ page, mockApi }) => {
  await authenticate(page, "Viewer");
  await page.goto("/devices/1001");

  const editButton = page.getByRole("button", { name: "Edit" });
  await expect(editButton).toBeDisabled();
  await expect(editButton).toHaveAttribute("title", "Viewers cannot edit devices");
  expect(mockApi.request("PUT", "/devices/laptop/1001")).toBeUndefined();
});

test("prevents editors from modifying donated devices", async ({ page, mockApi }) => {
  await authenticate(page, "Editor");
  await page.goto("/devices/1002");

  const editButton = page.getByRole("button", { name: "Edit" });
  await expect(editButton).toBeDisabled();
  await expect(editButton).toHaveAttribute("title", "Donated devices cannot be edited");
  expect(mockApi.request("PUT", "/devices/desktop/1002")).toBeUndefined();
});

test.describe("password validation and failures", () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    await page.goto("/account");
    await page.getByTestId("current-password").fill("old-password");
  });

  test("rejects mismatched new passwords without an API request", async ({ page, mockApi }) => {
    await page.getByTestId("new-password").fill("new-password-123");
    await page.getByTestId("confirm-password").fill("different-password");
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page.getByText("New passwords do not match", { exact: true })).toBeVisible();
    expect(mockApi.request("PUT", "/accounts/42")).toBeUndefined();
  });

  test("rejects a short new password without an API request", async ({ page, mockApi }) => {
    await page.getByTestId("new-password").fill("short");
    await page.getByTestId("confirm-password").fill("short");
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(
      page.getByText("New password must be at least 8 characters", { exact: true })
    ).toBeVisible();
    expect(mockApi.request("PUT", "/accounts/42")).toBeUndefined();
  });

  test("reports a password API failure and retains the form", async ({ page, mockApi }) => {
    mockApi.fail("PUT", "/accounts/42", 400, "Current password is incorrect");
    await page.getByTestId("new-password").fill("new-password-123");
    await page.getByTestId("confirm-password").fill("new-password-123");
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page.getByText("Current password is incorrect", { exact: true })).toBeVisible();
    await expect(page.getByTestId("current-password")).toHaveValue("old-password");
  });
});

test("requires a chapter and role when creating an account", async ({ page, mockApi }) => {
  await authenticate(page);
  await page.goto("/admin/accounts");
  await page.getByRole("button", { name: "New Account" }).click();
  await page.getByTestId("account-full-name").fill("Missing Affiliation");
  await page.getByTestId("account-username").fill("missing-affiliation");
  await page.getByTestId("account-password").fill("temporary-password");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByTestId("account-chapter-0")).toBeFocused();
  expect(
    await page.getByTestId("account-chapter-0").evaluate((select) => select.matches(":invalid"))
  ).toBe(true);
  expect(mockApi.request("POST", "/accounts")).toBeUndefined();
});

test("reports duplicate usernames without adding an account", async ({ page, mockApi }) => {
  mockApi.fail("POST", "/accounts", 409, "Username already exists");
  await authenticate(page);
  await page.goto("/admin/accounts");
  await page.getByRole("button", { name: "New Account" }).click();
  await page.getByTestId("account-full-name").fill("Duplicate User");
  await page.getByTestId("account-username").fill("e2e-admin");
  await page.getByTestId("account-password").fill("temporary-password");
  await page.getByTestId("account-chapter-0").selectOption(String(TEST_CHAPTER.id));
  await page.getByTestId("account-role-0").selectOption("Editor");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByText("Username already exists", { exact: true })).toBeVisible();
  expect(mockApi.accounts.filter((account) => account.username === "e2e-admin")).toHaveLength(1);
});

test("does not offer deletion for a chapter that contains inventory", async ({ page, mockApi }) => {
  await authenticate(page);
  await page.goto("/chapters");

  const deleteButton = page.getByTitle(/Cannot delete.*chapter still has/i);
  await expect(deleteButton).toBeDisabled();
  expect(mockApi.request("DELETE", `/chapters/${TEST_CHAPTER.id}`)).toBeUndefined();
});

test("does not submit a duplicate lookup value", async ({ page, mockApi }) => {
  await authenticate(page);
  await page.goto("/settings");
  const manufacturers = page.getByTestId("lookup-manufacturers");
  await manufacturers.getByPlaceholder("Add a manufacturer…").fill("framework");
  await manufacturers.getByRole("button", { name: "Add" }).click();

  expect(mockApi.request("POST", "/lookup/manufacturers")).toBeUndefined();
  await expect(manufacturers.getByText("Framework", { exact: true })).toHaveCount(1);
});

test("rolls back an optimistic lookup addition when the API fails", async ({ page, mockApi }) => {
  mockApi.fail("POST", "/lookup/manufacturers", 500, "Lookup unavailable");
  await authenticate(page);
  await page.goto("/settings");
  const manufacturers = page.getByTestId("lookup-manufacturers");
  await manufacturers.getByPlaceholder("Add a manufacturer…").fill("Failed Manufacturer");
  await manufacturers.getByRole("button", { name: "Add" }).click();

  await expect(
    manufacturers.getByText('Failed to add "Failed Manufacturer". Please try again.', {
      exact: true,
    })
  ).toBeVisible();
  await expect(manufacturers.getByText("Failed Manufacturer", { exact: true })).toBeHidden();
  expect(mockApi.lookups.manufacturers).not.toContain("Failed Manufacturer");
});

test("shows useful empty states for unmatched inventory and global search", async ({ page }) => {
  await authenticate(page);
  await page.goto("/devices");
  await page.getByPlaceholder("ID, manufacturer, model, CPU…").fill("no-such-device");
  await expect(page.getByText(/No devices match the current filters/)).toBeVisible();

  await page.goto("/search");
  await page
    .getByPlaceholder("Search by ID, model, manufacturer, chapter, status…")
    .fill("no-such-asset");
  await expect(page.getByText(/No results for/)).toBeVisible();
  await expect(page.getByText("no-such-asset", { exact: true })).toBeVisible();
});
