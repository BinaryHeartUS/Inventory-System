import { test, expect } from "./fixtures/test";
import { authenticate } from "./fixtures/mock-api";

test.beforeEach(async ({ page }) => {
  await authenticate(page);
});

test("edits and saves a device", async ({ page, mockApi }) => {
  await page.goto("/devices/1001");
  await expect(page.getByRole("heading", { name: "Framework Laptop 13" })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByTestId("edit-field-model").fill("Laptop 13 E2E");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("heading", { name: "Framework Laptop 13 E2E" })).toBeVisible();
  expect(mockApi.request("PUT", "/devices/laptop/1001")?.body).toMatchObject({
    model: "Laptop 13 E2E",
  });
});

test("edits and saves a part", async ({ page, mockApi }) => {
  await page.goto("/parts/1101");
  await expect(page.getByRole("heading", { name: "RAM" })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByTestId("edit-field-description").fill("32GB DDR5 SODIMM");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByText("32GB DDR5 SODIMM", { exact: true })).toBeVisible();
  expect(mockApi.request("PUT", "/parts/1101")?.body).toMatchObject({
    description: "32GB DDR5 SODIMM",
  });
});

test("edits and saves a tool", async ({ page, mockApi }) => {
  await page.goto("/tools/1201");
  await expect(page.getByRole("heading", { name: "Precision screwdriver kit" })).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByTestId("edit-field-description").fill("Precision screwdriver set");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("heading", { name: "Precision screwdriver set" })).toBeVisible();
  expect(mockApi.request("PUT", "/tools/1201")?.body).toMatchObject({
    description: "Precision screwdriver set",
  });
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
