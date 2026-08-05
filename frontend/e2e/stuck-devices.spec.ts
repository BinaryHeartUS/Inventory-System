import { test, expect } from "./fixtures/test";
import { authenticate } from "./fixtures/real-api";

test.beforeEach(async ({ page }) => {
  await authenticate(page);
});

test("shows the stuck pill in device list surfaces and device details", async ({ page }) => {
  await page.goto("/devices");
  const devicesRow = page.getByRole("row").filter({ hasText: "Laptop 13" });
  await expect(devicesRow.getByLabel("Device stuck")).toBeVisible();

  await page.goto("/search");
  await page
    .getByPlaceholder("Search by ID, model, manufacturer, chapter, status…")
    .fill("Framework");
  const searchResult = page.getByRole("link").filter({ hasText: "Framework Laptop 13" });
  await expect(searchResult.getByLabel("Device stuck")).toBeVisible();

  await page.goto("/parts/1101");
  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("button", { name: "Select device (optional)" }).click();
  await expect(page.getByRole("heading", { name: "Select a Device" })).toBeVisible();
  const pickerRow = page.getByRole("row").filter({ hasText: "Laptop 13" });
  await expect(pickerRow.getByLabel("Device stuck")).toBeVisible();

  await page.goto("/devices/1001");
  await expect(page.getByRole("heading", { name: "Framework Laptop 13" })).toBeVisible();
  await expect(page.getByLabel("Device stuck")).toBeVisible();
});

test("stuck filter ignores status visibility filters", async ({ page }) => {
  await page.goto("/devices");

  await page.locator("select").selectOption("Donated");
  await page.getByText("Include Donated", { exact: true }).click();
  await expect(page.getByText("OptiPlex 7090", { exact: true })).toBeVisible();
  await expect(page.getByText("Laptop 13", { exact: true })).toBeHidden();

  await page.getByText("Show Stuck Devices", { exact: true }).click();

  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();
  await expect(page.getByText("OptiPlex 7090", { exact: true })).toBeHidden();
  await expect(page.getByLabel("Device stuck")).toBeVisible();
  await expect(page.locator("select")).toBeDisabled();
});

test("adding a note clears the stuck flag", async ({ page }) => {
  await page.goto("/devices/1001");
  await expect(page.getByLabel("Device stuck")).toBeVisible();

  await page.getByPlaceholder("Add a note… (Ctrl+Enter to submit)").fill("Work resumed");
  const noteSaved = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().endsWith("/api/assets/1001/notes") &&
      response.ok()
  );
  await page.getByRole("button", { name: "Add note" }).click();
  await noteSaved;
  await page.reload();

  await expect(page.getByLabel("Device stuck")).toBeHidden();
});

test("editing a device clears the stuck flag", async ({ page }) => {
  await page.goto("/devices/1001");
  await expect(page.getByLabel("Device stuck")).toBeVisible();

  await page.getByRole("button", { name: "Edit" }).click();
  await page.getByTestId("edit-field-model").fill("Laptop 13 Active");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("heading", { name: "Framework Laptop 13 Active" })).toBeVisible();
  await expect(page.getByLabel("Device stuck")).toBeHidden();
});
