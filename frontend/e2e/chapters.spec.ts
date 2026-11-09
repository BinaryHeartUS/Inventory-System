/// <reference lib="dom" />

import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { test, expect } from "./fixtures/test";
import { authenticate } from "./fixtures/real-api";

function applyDirectory(active: boolean) {
  const directory = [
    { id: 1, name: "National", active: true },
    { id: 101, name: "Renamed E2E Chapter", active },
    { id: 102, name: "New E2E Chapter", active: true },
  ];
  execFileSync(
    "docker",
    [
      "compose",
      "-p",
      process.env.E2E_COMPOSE_PROJECT ?? "inventory-e2e",
      "-f",
      resolve("../docker-compose.e2e.yml"),
      "exec",
      "-T",
      "db",
      "psql",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "binaryheart",
      "-d",
      "inventory",
    ],
    {
      input: `SELECT Apply_Chapter_Directory('${JSON.stringify(directory)}'::jsonb);`,
      stdio: ["pipe", "pipe", "pipe"],
    }
  );
}

test("reflects renamed and inactive chapters while preserving history and rejecting stale-token writes", async ({
  page,
}) => {
  const token = await authenticate(page, "Admin");
  const syncStatus = await page.request.get("/api/chapters/sync", {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(syncStatus.status()).toBe(200);
  expect(await syncStatus.json()).toMatchObject({ healthy: true, error: "" });
  await page.goto("/tools/1201");
  await expect(page.getByRole("button", { name: "Edit", exact: true })).toBeVisible();

  applyDirectory(false);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByRole("button", { name: "Edit", exact: true })).toBeHidden();
  await expect(page.getByRole("button", { name: "Add Asset" })).toBeVisible();

  const headers = { Authorization: `Bearer ${token}` };
  const history = await page.request.get("/api/tools/1201", { headers });
  expect(history.status()).toBe(200);
  expect((await history.json()).chapterId).toBe(101);
  const denied = await page.request.post("/api/tools", {
    headers,
    data: { chapterId: 101, description: "Must not be created" },
  });
  expect(denied.status()).toBe(403);
  const chapters = await page.request.get("/api/chapters", { headers });
  expect(await chapters.json()).toEqual(
    expect.arrayContaining([
      { id: 101, name: "Renamed E2E Chapter", active: false },
      { id: 102, name: "New E2E Chapter", active: true },
    ])
  );

  applyDirectory(true);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.getByRole("button", { name: "Edit", exact: true })).toBeVisible();
});

test("restricts synchronization diagnostics to National admins", async ({ page }) => {
  const token = await authenticate(page, "Chapter Admin");
  const response = await page.request.get("/api/chapters/sync", {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.status()).toBe(403);
});
