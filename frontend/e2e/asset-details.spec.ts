import { test, expect } from "./fixtures/test";
import { authenticate } from "./fixtures/real-api";

test.beforeEach(async ({ page }) => {
  await authenticate(page);
});

test("edits and saves a device", async ({ page }) => {
  await page.goto("/devices/1001");
  await expect(page.getByRole("heading", { name: "Framework Laptop 13" })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByTestId("edit-field-model").fill("Laptop 13 E2E");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("heading", { name: "Framework Laptop 13 E2E" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Framework Laptop 13 E2E" })).toBeVisible();
});

test("edits and saves a part", async ({ page }) => {
  await page.goto("/parts/1101");
  await expect(page.getByRole("heading", { name: "RAM" })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByTestId("edit-field-description").fill("32GB DDR5 SODIMM");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByText("32GB DDR5 SODIMM", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("32GB DDR5 SODIMM", { exact: true })).toBeVisible();
});

test("edits and saves a tool", async ({ page }) => {
  await page.goto("/tools/1201");
  await expect(page.getByRole("heading", { name: "Precision screwdriver kit" })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByTestId("edit-field-description").fill("Precision screwdriver set");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("heading", { name: "Precision screwdriver set" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Precision screwdriver set" })).toBeVisible();
});

test("guards navigation while edits are unsaved", async ({ page }) => {
  await page.goto("/devices/1001");
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByTestId("edit-field-model").fill("Unsaved model");

  const partsLink = page.locator("aside").first().getByRole("link", { name: "Parts", exact: true });
  await partsLink.click();

  const dialog = page.getByRole("dialog", { name: "Discard unsaved changes?" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Keep editing" }).click();
  await expect(page).toHaveURL(/\/devices\/1001$/);
  await expect(page.getByTestId("edit-field-model")).toHaveValue("Unsaved model");

  await partsLink.click();
  await dialog.getByRole("button", { name: "Discard changes" }).click();
  await expect(page).toHaveURL(/\/parts$/);
});

test("prevents viewers from editing device details", async ({ page }) => {
  await authenticate(page, "Viewer");
  await page.goto("/devices/1001");

  const editButton = page.getByRole("button", { name: "Edit" });
  await expect(editButton).toBeDisabled();
  await expect(editButton).toHaveAttribute("title", "Viewers cannot edit devices");
});

test("prevents editors from modifying donated devices", async ({ page }) => {
  await authenticate(page, "Editor");
  await page.goto("/devices/1002");

  const editButton = page.getByRole("button", { name: "Edit" });
  await expect(editButton).toBeDisabled();
  await expect(editButton).toHaveAttribute("title", "Donated devices cannot be edited");
});
