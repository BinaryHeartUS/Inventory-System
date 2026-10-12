import { test, expect } from "./fixtures/test";
import { authenticate, TEST_CHAPTER } from "./fixtures/real-api";
import type { Page } from "@playwright/test";
import { DEVICE_FILTER_STORAGE_KEY } from "../src/components/devices/deviceFilterStorage";

async function selectTestChapter(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: TEST_CHAPTER.name }).click();
}

test.beforeEach(async ({ page }) => {
  await authenticate(page);
});

test("dashboard shows seeded chapter inventory", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Pipeline", { exact: true })).toBeVisible();
  await expect(page.getByText("Device Types", { exact: true })).toBeVisible();
  await expect(page.getByText(TEST_CHAPTER.name, { exact: true })).toBeVisible();
  await expect(page.getByText("2 total", { exact: true })).toBeVisible();
  const stuckCard = page.getByRole("button", { name: /Stuck Devices/ });
  await expect(stuckCard.getByText("1", { exact: true })).toBeVisible();
  await expect(
    stuckCard.getByText("100% of 1 In Progress and Ready To Donate devices", { exact: true })
  ).toBeVisible();
});

test("dashboard pipeline metrics open chapter-filtered device lists", async ({ page }) => {
  await selectTestChapter(page);
  await page.getByRole("button").filter({ hasText: "Not Started" }).click();

  await expect(page).toHaveURL(/\/devices$/);
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeVisible();
  await expect(page.getByText("Laptop 13", { exact: true })).toBeHidden();

  await selectTestChapter(page);
  await page.getByRole("button").filter({ hasText: "Donated" }).click();

  await expect(page).toHaveURL(/\/devices$/);
  await expect(page.getByText("OptiPlex 7090", { exact: true })).toBeVisible();
});

test("dashboard device types open chapter-filtered device lists", async ({ page }) => {
  await selectTestChapter(page);
  await page.getByRole("button").filter({ hasText: "Desktops" }).click();

  await expect(page).toHaveURL(/\/devices$/);
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeVisible();
  await expect(page.getByText("Laptop 13", { exact: true })).toBeHidden();
});

test("device types can be combined from the checklist", async ({ page }) => {
  await page.goto("/devices");

  const typesButton = page.getByRole("button", { name: /^Device Types/ });
  await expect(typesButton).toContainText("3");
  await typesButton.click();
  await expect(page.getByRole("checkbox", { name: "Desktop" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Laptop" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Mobile Device" })).toBeChecked();

  await page.getByRole("checkbox", { name: "Desktop" }).uncheck();
  await page.getByRole("checkbox", { name: "Mobile Device" }).uncheck();
  await expect(typesButton).toContainText("1");
  await expect(page).toHaveURL(/\/devices$/);
  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeHidden();
});

test("operating systems can be combined with not specified", async ({ page }) => {
  await page.goto("/devices");

  const operatingSystemsButton = page.getByRole("button", { name: /^Operating Systems/ });
  await expect(operatingSystemsButton).toContainText("3");
  await operatingSystemsButton.click();
  await expect(page.getByRole("checkbox", { name: "Ubuntu" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Windows 11" })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Not specified" })).toBeChecked();

  await page.getByRole("checkbox", { name: "Windows 11" }).uncheck();
  await page.getByRole("checkbox", { name: "Not specified" }).uncheck();
  await expect(operatingSystemsButton).toContainText("1");
  await expect(page).toHaveURL(/\/devices$/);
  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeHidden();

  await page.getByRole("checkbox", { name: "Not specified" }).check();
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeVisible();

  await page.getByRole("checkbox", { name: "Ubuntu" }).uncheck();
  await expect(page.getByText("Laptop 13", { exact: true })).toBeHidden();
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeVisible();
});

test("model years can be filtered with inclusive open-ended bounds", async ({ page }) => {
  await page.goto("/devices");

  const yearFrom = page.getByLabel("Model year from");
  const yearTo = page.getByLabel("Model year to");
  const yearButton = page.getByRole("button", { name: "Year", exact: true });
  await expect(yearFrom).toBeHidden();
  await yearButton.click();
  await yearFrom.fill("2023");

  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeVisible();
  await expect(page.getByText("OptiPlex 7090", { exact: true })).toBeHidden();
  await expect(page).toHaveURL(/\/devices$/);

  await page.reload();
  await expect(yearFrom).toBeHidden();
  await yearButton.click();
  await expect(yearFrom).toHaveValue("2023");
  await yearTo.fill("2023");
  await expect(page.getByText("Laptop 13", { exact: true })).toBeHidden();
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeVisible();

  await yearFrom.fill("2024");
  await expect(
    page.getByText("The starting year cannot be later than the ending year.")
  ).toBeVisible();
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeVisible();
  await expect(page.getByText("Laptop 13", { exact: true })).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(yearFrom).toBeHidden();
  await expect(yearButton).toBeFocused();
  await yearButton.click();
  await expect(yearFrom).toHaveValue("2024");
  await page.getByRole("heading", { name: "Devices", exact: true }).click();
  await expect(yearFrom).toBeHidden();
});

test("acquisition dates support calendar selection, open bounds and persistence", async ({
  page,
}) => {
  await page.goto("/devices");
  const button = page.getByRole("button", { name: "Acquisition date", exact: true });
  const from = page.getByLabel("Acquired from", { exact: true });
  const to = page.getByLabel("Acquired to", { exact: true });
  await expect(from).toBeHidden();
  await button.click();
  await from.fill("2025-12-01");
  await to.fill("2026-01-15");
  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeVisible();
  await expect(page.getByText("2 matching devices", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/devices$/);

  await page.reload();
  await button.click();
  await expect(from).toHaveValue("2025-12-01");
  await expect(to).toHaveValue("2026-01-15");
  await to.fill("2025-12-01");
  await expect(page.getByText("Laptop 13", { exact: true })).toBeHidden();
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeVisible();
  await from.fill("2026-01-15");
  await expect(
    page.getByText("The starting date cannot be later than the ending date.")
  ).toBeVisible();
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeVisible();
  await to.fill("");
  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeHidden();

  await from.fill("");
  const dialog = page.getByRole("dialog", { name: "Acquisition date range" });
  await dialog.getByRole("combobox", { name: /month/i }).selectOption("0");
  await dialog.getByRole("combobox", { name: /year/i }).selectOption("2026");
  await dialog.getByRole("button", { name: /January 15th, 2026/ }).click();
  await dialog.getByRole("button", { name: /January 16th, 2026/ }).click();
  await expect(from).toHaveValue("2026-01-15");
  await expect(to).toHaveValue("2026-01-16");
  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeHidden();
  await page.screenshot({ path: "test-results/acquisition-date-desktop.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  const box = await dialog.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  expect(box!.y + box!.height).toBeLessThanOrEqual(844 - 64);
  const [scrollWidth, clientWidth] = await page
    .locator("html")
    .evaluate((element) => [element.scrollWidth, element.clientWidth]);
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  await page.screenshot({ path: "test-results/acquisition-date-mobile.png" });
  await page.keyboard.press("Escape");
  await expect(from).toBeHidden();
  await page.getByRole("button", { name: "Clear filters" }).first().click();
  await button.click();
  await expect(from).toHaveValue("");
  await expect(to).toHaveValue("");
});

test("range resets clear invalid drafts without clearing other filters", async ({ page }) => {
  await page.goto("/devices");
  const search = page.getByPlaceholder("ID, manufacturer, model, CPU…");
  await search.fill("Framework");
  const yearButton = page.getByRole("button", { name: "Year", exact: true });
  const dateButton = page.getByRole("button", { name: "Acquisition date", exact: true });
  const yearFrom = page.getByLabel("Model year from");
  const yearTo = page.getByLabel("Model year to");
  const from = page.getByLabel("Acquired from", { exact: true });
  const to = page.getByLabel("Acquired to", { exact: true });

  await dateButton.click();
  await from.fill("2026-01-15");
  await to.fill("2026-01-15");
  await yearButton.click();
  const yearReset = page
    .getByRole("dialog", { name: "Year range" })
    .getByRole("button", { name: "Reset range" });
  await expect(yearReset).toBeDisabled();
  await yearFrom.fill("2024");
  await yearTo.fill("2024");
  await yearFrom.fill("2025");
  await expect(page.getByRole("alert")).toBeVisible();
  await yearReset.click();
  await expect(yearFrom).toHaveValue("");
  await expect(yearTo).toHaveValue("");
  await expect(page.getByRole("alert")).toBeHidden();
  await expect(yearReset).toBeDisabled();
  await expect(search).toHaveValue("Framework");

  await yearFrom.fill("2024");
  await dateButton.click();
  await expect(from).toHaveValue("2026-01-15");
  await expect(to).toHaveValue("2026-01-15");
  await from.fill("2026-01-16");
  await expect(page.getByRole("alert")).toBeVisible();
  const dateReset = page
    .getByRole("dialog", { name: "Acquisition date range" })
    .getByRole("button", { name: "Reset range" });
  await dateReset.click();
  await expect(from).toHaveValue("");
  await expect(to).toHaveValue("");
  await expect(page.getByRole("alert")).toBeHidden();
  await expect(dateReset).toBeDisabled();
  await expect(search).toHaveValue("Framework");
  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();

  await page.reload();
  await expect(search).toHaveValue("Framework");
  await dateButton.click();
  await expect(from).toHaveValue("");
  await expect(to).toHaveValue("");
  await yearButton.click();
  await expect(yearFrom).toHaveValue("2024");
  await expect(yearTo).toHaveValue("");
});

test("dashboard stuck items opens the chapter-filtered stuck list", async ({ page }) => {
  await selectTestChapter(page);
  await page.getByRole("button", { name: /Stuck Devices/ }).click();

  await expect(page).toHaveURL(/\/devices$/);
  await page.getByRole("button", { name: /^Statuses/ }).click();
  await expect(page.getByRole("checkbox", { name: "Stuck only" })).toBeChecked();
  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeHidden();
});

test("devices can be filtered and opened", async ({ page }) => {
  await page.goto("/devices");

  await expect(page.getByRole("heading", { name: "Devices" })).toBeVisible();
  await expect(page.getByText("Framework", { exact: true })).toBeVisible();
  await page.getByPlaceholder("ID, manufacturer, model, CPU…").fill("Framework");
  await expect(page).toHaveURL(/\/devices$/);
  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();
  await expect(page.getByText("OptiPlex 7090", { exact: true })).toBeHidden();

  await page.getByText("Laptop 13", { exact: true }).click();
  await expect(page).toHaveURL(/\/devices\/1001$/);

  await page.getByRole("main").getByRole("link", { name: "Devices" }).click();
  await expect(page.getByPlaceholder("ID, manufacturer, model, CPU…")).toHaveValue("Framework");
  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();
  await expect(page.getByText("OptiPlex 7090", { exact: true })).toBeHidden();

  await page.reload();
  await expect(page.getByPlaceholder("ID, manufacturer, model, CPU…")).toHaveValue("Framework");
  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).first().click();
  await expect(page.getByPlaceholder("ID, manufacturer, model, CPU…")).toHaveValue("");
  await expect
    .poll(() => page.evaluate((key) => sessionStorage.getItem(key), DEVICE_FILTER_STORAGE_KEY))
    .toBeNull();
});

test("places the continuation marker after the matching-device count", async ({ page }) => {
  await page.route(/\/api\/devices\?.*search=bulk/, async (route) => {
    const templateUrl = new URL(route.request().url());
    templateUrl.searchParams.delete("search");
    templateUrl.searchParams.set("pageSize", "1");
    const response = await route.fetch({ url: templateUrl.toString() });
    const [template] = (await response.json()) as Array<Record<string, unknown>>;
    const devices = Array.from({ length: 50 }, (_, index) => ({
      ...template,
      id: 2000 + index,
      model: `Bulk Device ${index + 1}`,
    }));
    await route.fulfill({ response, json: devices });
  });

  await page.goto("/devices");
  await page.getByPlaceholder("ID, manufacturer, model, CPU…").fill("bulk");

  await expect(page.getByText("50+ matching devices", { exact: true })).toBeVisible();
});

test("parts are grouped by type and open from an expanded group", async ({ page }) => {
  await page.goto("/parts");

  await expect(page.getByRole("heading", { name: "Parts" })).toBeVisible();
  await page.getByRole("button", { name: /RAM.*1 part/i }).click();
  await expect(page.getByText("16GB DDR5 SODIMM", { exact: true })).toBeVisible();

  await page.getByText("16GB DDR5 SODIMM", { exact: true }).click();
  await expect(page).toHaveURL(/\/parts\/1101$/);
});

test("tools list shows seeded tools and opens detail", async ({ page }) => {
  await page.goto("/tools");

  await expect(page.getByRole("heading", { name: "Tools" })).toBeVisible();
  await page.getByText("Precision screwdriver kit", { exact: true }).click();
  await expect(page).toHaveURL(/\/tools\/1201$/);
});

test("donations shows donated devices and chapter totals", async ({ page }) => {
  await page.goto("/donations");

  await expect(page.getByRole("heading", { name: "Donations" })).toBeVisible();
  await expect(page.getByText("1 device donated all time", { exact: true })).toBeVisible();
  await expect(page.getByText("OptiPlex 7090", { exact: true })).toBeVisible();
  await expect(page.getByText(TEST_CHAPTER.name, { exact: true }).first()).toBeVisible();
});

test("national admin can create a chapter in isolated state", async ({ page }) => {
  await page.goto("/chapters");

  await page.getByRole("button", { name: "New Chapter" }).click();
  await page.getByRole("textbox").fill("Another Test Chapter");
  await page.getByRole("button", { name: "Create Chapter" }).click();

  await expect(page.getByText("Another Test Chapter", { exact: true })).toBeVisible();
});

test("global search returns devices, parts, and tools", async ({ page }) => {
  await page.goto("/search");

  const search = page.getByPlaceholder("Search by ID, model, manufacturer, chapter, status…");
  await search.fill("1");

  await expect(page.getByText(/result.*for "1"/)).toBeVisible();
  await expect(page.getByText("Framework Laptop 13", { exact: true })).toBeVisible();
  await expect(page.getByText("16GB DDR5 SODIMM", { exact: true })).toBeVisible();
  await expect(page.getByText("Precision screwdriver kit", { exact: true })).toBeVisible();
});

test("shows useful empty states for unmatched inventory and global search", async ({ page }) => {
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
