import { test, expect } from "./fixtures/test";
import { authenticate, TEST_CHAPTER } from "./fixtures/real-api";

async function openAddAsset(page: import("@playwright/test").Page) {
  await authenticate(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Add Asset" }).click();
  const dialog = page.getByRole("dialog", { name: "Add New Asset" });
  await expect(dialog).toBeVisible();
  return dialog;
}

async function openDesktopFields(page: import("@playwright/test").Page) {
  const dialog = await openAddAsset(page);
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByRole("button", { name: /^Device/ }).click();
  await dialog.getByRole("button", { name: /^Desktop/ }).click();
  return dialog;
}

test("creates a desktop with generated ID", async ({ page }) => {
  const dialog = await openDesktopFields(page);

  await page.getByTestId("field-manufacturer").selectOption("Framework");
  await page.getByTestId("field-model").fill("E2E Desktop");
  await page.getByTestId("field-serial-number").fill("E2E-DESKTOP-SERIAL");
  await page.getByTestId("field-chapter").selectOption(TEST_CHAPTER.name);
  await dialog.getByRole("button", { name: "Add Asset", exact: true }).click();

  await expect(page).toHaveURL(/\/devices\/\d+$/);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Framework E2E Desktop" })).toBeVisible();
  await expect(page.getByText("E2E-DESKTOP-SERIAL", { exact: true })).toBeVisible();
  await expect(page.getByText(TEST_CHAPTER.name, { exact: true }).first()).toBeVisible();
});

test("shows the serial field in the mobile add-device form", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const dialog = await openDesktopFields(page);

  const serialNumber = page.getByTestId("field-serial-number");
  await expect(serialNumber).toBeVisible();
  await serialNumber.fill("MOBILE-SERIAL-001");
  await expect(serialNumber).toHaveValue("MOBILE-SERIAL-001");
  await expect(dialog).toBeVisible();
});

test("creates a donated part", async ({ page }) => {
  const dialog = await openAddAsset(page);
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByRole("button", { name: /^Part/ }).click();

  await page.getByTestId("field-part-type").selectOption("RAM");
  await page.getByTestId("field-description").fill("E2E memory module");
  await page.getByTestId("field-chapter").selectOption(TEST_CHAPTER.name);
  await dialog.getByRole("button", { name: "Add Asset", exact: true }).click();

  await expect(page).toHaveURL(/\/parts\/\d+$/);
  await page.reload();
  await expect(page.getByText("E2E memory module", { exact: true })).toBeVisible();
});

test("creates a tool", async ({ page }) => {
  const dialog = await openAddAsset(page);
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByRole("button", { name: /^Tool/ }).click();

  await page.getByTestId("field-description").fill("E2E anti-static mat");
  await page.getByTestId("field-chapter").selectOption(TEST_CHAPTER.name);
  await dialog.getByRole("button", { name: "Add Asset", exact: true }).click();

  await expect(page).toHaveURL(/\/tools\/\d+$/);
  await page.reload();
  await expect(page.getByRole("heading", { name: "E2E anti-static mat" })).toBeVisible();
});

test("creates, edits, receipts, and finds a misc asset by ID", async ({ page }) => {
  const dialog = await openAddAsset(page);
  await dialog.getByRole("button", { name: "Continue" }).click();
  await dialog.getByRole("button", { name: /^Misc/ }).click();

  await expect(dialog.getByTestId("field-chapter")).toHaveCount(0);
  await expect(dialog.getByRole("button", { name: "Add Asset", exact: true })).toBeDisabled();
  await page.getByTestId("field-description").fill("E2E assorted cables");
  await page.getByTestId("field-value").fill("75");
  await expect(dialog.getByRole("button", { name: "Add Asset", exact: true })).toBeDisabled();
  await dialog.getByRole("button", { name: "Select donor" }).click();
  await page.getByText("Test Donor", { exact: true }).click();
  await dialog.getByRole("button", { name: "Add Asset", exact: true }).click();

  await expect(page).toHaveURL(/\/misc\/\d+$/);
  const assetId = page.url().split("/").pop()!;
  await expect(page.getByRole("heading", { name: "E2E assorted cables" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Print Label" })).toHaveCount(0);

  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByTestId("edit-field-description").fill("E2E assorted network cables");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "E2E assorted network cables" })).toBeVisible();

  await page.goto("/admin/parties/301");
  const miscSection = page.getByRole("heading", { name: "Donated Misc" }).locator("../..");
  await expect(miscSection.getByText("E2E assorted network cables", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Create Donation Receipt" }).click();
  await miscSection
    .getByRole("row")
    .filter({ hasText: "E2E assorted network cables" })
    .getByRole("checkbox")
    .check();
  await expect(page.getByRole("button", { name: "Generate Donor Receipt" })).toBeEnabled();

  await page.goto("/search");
  await page.getByLabel("Asset ID").fill(assetId);
  await page.getByRole("button", { name: "Search by asset ID" }).click();
  await expect(page).toHaveURL(new RegExp(`/misc/${assetId}$`));
});

test("rejects an asset ID that is already in use", async ({ page }) => {
  const dialog = await openAddAsset(page);
  await dialog.getByRole("button", { name: "Input an ID" }).click();
  await dialog.getByTestId("asset-id").fill("1001");

  await expect(dialog.getByText("ID 1001 is already in use.")).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Continue" })).toBeDisabled();
});

test("requires the core asset details before submission", async ({ page }) => {
  const dialog = await openDesktopFields(page);

  await expect(dialog.getByRole("button", { name: "Add Asset", exact: true })).toBeDisabled();
});
