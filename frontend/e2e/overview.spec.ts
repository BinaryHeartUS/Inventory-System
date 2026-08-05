import { test, expect } from "./fixtures/test";
import { authenticate, TEST_CHAPTER } from "./fixtures/real-api";
import type { Page } from "@playwright/test";

async function selectTestChapter(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: TEST_CHAPTER.name }).click();
}

async function expectSearchParam(page: Page, name: string, value: string) {
  await expect.poll(() => new URL(page.url()).searchParams.get(name)).toBe(value);
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
  const stuckCard = page.getByRole("button").filter({ hasText: "Stuck Items" });
  await expect(stuckCard.getByText("1", { exact: true })).toBeVisible();
  await expect(
    stuckCard.getByText("100% of in-progress and ready-to-donate devices", { exact: true })
  ).toBeVisible();
});

test("dashboard pipeline metrics open chapter-filtered device lists", async ({ page }) => {
  await selectTestChapter(page);
  await page.getByRole("button").filter({ hasText: "Not Started" }).click();

  await expectSearchParam(page, "chapter", String(TEST_CHAPTER.id));
  await expectSearchParam(page, "status", "Not Started");
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeVisible();
  await expect(page.getByText("Laptop 13", { exact: true })).toBeHidden();

  await selectTestChapter(page);
  await page.getByRole("button").filter({ hasText: "Donated" }).click();

  await expectSearchParam(page, "status", "Donated");
  await expectSearchParam(page, "includeDonated", "true");
  await expect(page.getByText("OptiPlex 7090", { exact: true })).toBeVisible();
});

test("dashboard device types open chapter-filtered device lists", async ({ page }) => {
  await selectTestChapter(page);
  await page.getByRole("button").filter({ hasText: "Desktops" }).click();

  await expectSearchParam(page, "chapter", String(TEST_CHAPTER.id));
  await expectSearchParam(page, "type", "Desktop");
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeVisible();
  await expect(page.getByText("Laptop 13", { exact: true })).toBeHidden();
});

test("dashboard stuck items opens the chapter-filtered stuck list", async ({ page }) => {
  await selectTestChapter(page);
  await page.getByRole("button").filter({ hasText: "Stuck Items" }).click();

  await expectSearchParam(page, "chapter", String(TEST_CHAPTER.id));
  await expectSearchParam(page, "stuckOnly", "true");
  await expect(page.getByRole("checkbox", { name: "Stuck Devices Only" })).toBeChecked();
  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();
  await expect(page.getByText("ThinkCentre M90q", { exact: true })).toBeHidden();
});

test("devices can be filtered and opened", async ({ page }) => {
  await page.goto("/devices");

  await expect(page.getByRole("heading", { name: "Devices" })).toBeVisible();
  await expect(page.getByText("Framework", { exact: true })).toBeVisible();
  await page.getByPlaceholder("ID, manufacturer, model, CPU…").fill("Framework");
  await expectSearchParam(page, "search", "Framework");
  await expect(page.getByText("Laptop 13", { exact: true })).toBeVisible();
  await expect(page.getByText("OptiPlex 7090", { exact: true })).toBeHidden();

  await page.getByText("Laptop 13", { exact: true }).click();
  await expect(page).toHaveURL(/\/devices\/1001$/);
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

  await page.goto("/devices?search=bulk");

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
