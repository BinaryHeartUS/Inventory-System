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
  await page.getByTestId("field-chapter").selectOption(TEST_CHAPTER.name);
  await dialog.getByRole("button", { name: "Add Asset", exact: true }).click();

  await expect(page).toHaveURL(/\/devices\/\d+$/);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Framework E2E Desktop" })).toBeVisible();
  await expect(page.getByText(TEST_CHAPTER.name, { exact: true }).first()).toBeVisible();
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
