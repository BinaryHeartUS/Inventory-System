import { test, expect } from "./fixtures/test";
import { authenticate } from "./fixtures/real-api";

test.beforeEach(async ({ page }) => {
  await authenticate(page);
});

test("creates an individual party", async ({ page }) => {
  await page.goto("/admin/parties");
  await expect(page.getByRole("heading", { name: "Manage Parties" })).toBeVisible();

  await page.getByRole("button", { name: "Add Individual" }).click();
  const panel = page.getByTestId("person-panel");
  await panel.getByPlaceholder("Full name").fill("E2E Individual Donor");
  await panel.getByPlaceholder("email@example.com").fill("individual@example.test");
  await panel.getByRole("button", { name: "Create" }).click();

  await expect(page.getByText("E2E Individual Donor", { exact: true })).toBeVisible();
});

test("adds and removes a lookup option", async ({ page }) => {
  await page.goto("/settings");
  await expect(page.getByRole("heading", { name: "Manage Options" })).toBeVisible();

  const manufacturers = page.getByTestId("lookup-manufacturers");
  await manufacturers.getByPlaceholder("Add a manufacturer…").fill("E2E Manufacturer");
  await manufacturers.getByRole("button", { name: "Add" }).click();
  await expect(manufacturers.getByText("E2E Manufacturer", { exact: true })).toBeVisible();

  await manufacturers.getByRole("button", { name: "Remove E2E Manufacturer" }).click();
  await expect(manufacturers.getByText("E2E Manufacturer", { exact: true })).toBeHidden();
});

test("does not submit a duplicate lookup value", async ({ page }) => {
  await page.goto("/settings");
  const manufacturers = page.getByTestId("lookup-manufacturers");
  await manufacturers.getByPlaceholder("Add a manufacturer…").fill("framework");
  await manufacturers.getByRole("button", { name: "Add" }).click();

  await expect(manufacturers.getByText("Framework", { exact: true })).toHaveCount(1);
});
