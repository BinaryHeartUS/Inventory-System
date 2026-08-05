import { test, expect } from "./fixtures/test";
import { authenticate } from "./fixtures/real-api";

test.beforeEach(async ({ page }) => {
  await authenticate(page);
});

test("shows the stuck pill in device list surfaces and device details", async ({ page }) => {
  await page.goto("/devices");
  const devicesRow = page.getByRole("row").filter({ hasText: "Laptop 13" });
  const model = devicesRow.getByText("Laptop 13", { exact: true });
  const stuck = devicesRow.getByLabel("Device stuck");
  await expect(stuck).toBeVisible();
  const modelBox = await model.boundingBox();
  const stuckBox = await stuck.boundingBox();
  expect(modelBox).not.toBeNull();
  expect(stuckBox).not.toBeNull();
  expect(stuckBox!.x).toBeGreaterThan(modelBox!.x + modelBox!.width);
  expect(stuckBox!.x - (modelBox!.x + modelBox!.width)).toBeLessThan(12);
  expect(Math.abs(stuckBox!.y - modelBox!.y)).toBeLessThan(2);
  const notStartedRow = page.getByRole("row").filter({ hasText: "ThinkCentre M90q" });
  await expect(notStartedRow).toBeVisible();
  await expect(notStartedRow.getByLabel("Device stuck")).toBeHidden();

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

test("keeps the stuck pill beside the model in the mobile layout", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/devices");

  const devicesRow = page.getByRole("row").filter({ hasText: "Laptop 13" });
  const model = devicesRow.getByText("Laptop 13", { exact: true });
  const stuck = devicesRow.getByLabel("Device stuck");
  const modelBox = await model.boundingBox();
  const stuckBox = await stuck.boundingBox();
  expect(modelBox).not.toBeNull();
  expect(stuckBox).not.toBeNull();
  expect(stuckBox!.x).toBeGreaterThan(modelBox!.x + modelBox!.width);
  expect(Math.abs(stuckBox!.y - modelBox!.y)).toBeLessThan(2);
  const [scrollWidth, clientWidth] = await page
    .locator("html")
    .evaluate((element) => [element.scrollWidth, element.clientWidth]);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
});

test("stuck filter clears a conflicting status filter", async ({ page }) => {
  await page.goto("/devices");

  await page.locator("select").selectOption("Donated");
  await page.getByText("Include Donated", { exact: true }).click();
  await expect(page.getByText("OptiPlex 7090", { exact: true })).toBeVisible();
  await expect(page.getByText("Laptop 13", { exact: true })).toBeHidden();

  await page.getByText("Stuck Devices Only", { exact: true }).click();

  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();
  await expect(page.getByText("OptiPlex 7090", { exact: true })).toBeHidden();
  await expect(page.getByLabel("Device stuck")).toBeVisible();
  await expect(page.locator("select")).toBeDisabled();
  await expect(page.locator("select")).toHaveValue("All");
  await expect(page.getByRole("checkbox", { name: "Include Donated" })).not.toBeChecked();
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

  await page.getByRole("button", { name: "Edit" }).first().click();
  await page.getByTestId("edit-field-model").fill("Laptop 13 Active");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("heading", { name: "Framework Laptop 13 Active" })).toBeVisible();
  await expect(page.getByLabel("Device stuck")).toBeHidden();
});

test("editing a note clears the stuck flag", async ({ page }) => {
  await page.goto("/devices/1001");
  await expect(page.getByLabel("Device stuck")).toBeVisible();

  const notesPane = page.getByRole("heading", { name: "Notes" }).locator("../..");
  await notesPane.getByRole("button", { name: "Edit" }).click();
  const note = notesPane.getByRole("textbox", { name: "Edit note" });
  await note.fill("Replacement battery ordered");
  const noteSaved = page.waitForResponse(
    (response) =>
      response.request().method() === "PUT" &&
      /\/api\/assets\/1001\/notes\/\d+$/.test(response.url()) &&
      response.ok()
  );
  await notesPane.getByRole("button", { name: "Save", exact: true }).click();
  await noteSaved;
  await page.reload();

  await expect(page.getByLabel("Device stuck")).toBeHidden();
});

test("saving an unchanged note keeps the stuck flag", async ({ page }) => {
  await page.goto("/devices/1001");
  await expect(page.getByLabel("Device stuck")).toBeVisible();

  const notesPane = page.getByRole("heading", { name: "Notes" }).locator("../..");
  await notesPane.getByRole("button", { name: "Edit" }).click();
  const noteSaved = page.waitForResponse(
    (response) =>
      response.request().method() === "PUT" &&
      /\/api\/assets\/1001\/notes\/\d+$/.test(response.url()) &&
      response.ok()
  );
  await notesPane.getByRole("button", { name: "Save", exact: true }).click();
  await noteSaved;
  await page.reload();

  await expect(page.getByLabel("Device stuck")).toBeVisible();
});
