import { test, expect } from "./fixtures/test";
import { authenticate, TEST_CHAPTER } from "./fixtures/mock-api";

async function openAddAsset(page: import("@playwright/test").Page) {
  await authenticate(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Add Asset" }).click();
  await expect(page.getByRole("dialog", { name: "Add New Asset" })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
}

test("creates a desktop with generated ID", async ({ page, mockApi }) => {
  await openAddAsset(page);
  await page.getByRole("button", { name: /^Device/ }).click();
  await page.getByRole("button", { name: /^Desktop/ }).click();

  await page.getByTestId("field-manufacturer").selectOption("Framework");
  await page.getByTestId("field-model").fill("E2E Desktop");
  await page.getByTestId("field-chapter").selectOption(TEST_CHAPTER.name);
  await page
    .getByRole("dialog", { name: "Add New Asset" })
    .getByRole("button", { name: "Add Asset", exact: true })
    .click();

  await expect(page).toHaveURL(/\/devices\/2000$/);
  expect(mockApi.request("POST", "/devices/desktop")?.body).toMatchObject({
    chapterId: TEST_CHAPTER.id,
    manufacturer: "Framework",
    model: "E2E Desktop",
    status: "Not Started",
  });
});

test("creates a donated part", async ({ page, mockApi }) => {
  await openAddAsset(page);
  await page.getByRole("button", { name: /^Part/ }).click();

  await page.getByTestId("field-part-type").selectOption("RAM");
  await page.getByTestId("field-description").fill("E2E memory module");
  await page.getByTestId("field-chapter").selectOption(TEST_CHAPTER.name);
  await page
    .getByRole("dialog", { name: "Add New Asset" })
    .getByRole("button", { name: "Add Asset", exact: true })
    .click();

  await expect(page).toHaveURL(/\/parts\/2000$/);
  expect(mockApi.request("POST", "/parts")?.body).toMatchObject({
    chapterId: TEST_CHAPTER.id,
    type: "RAM",
    description: "E2E memory module",
    wasPurchased: false,
  });
});

test("creates a tool", async ({ page, mockApi }) => {
  await openAddAsset(page);
  await page.getByRole("button", { name: /^Tool/ }).click();

  await page.getByTestId("field-description").fill("E2E anti-static mat");
  await page.getByTestId("field-chapter").selectOption(TEST_CHAPTER.name);
  await page
    .getByRole("dialog", { name: "Add New Asset" })
    .getByRole("button", { name: "Add Asset", exact: true })
    .click();

  await expect(page).toHaveURL(/\/tools\/2000$/);
  expect(mockApi.request("POST", "/tools")?.body).toMatchObject({
    chapterId: TEST_CHAPTER.id,
    description: "E2E anti-static mat",
  });
});
