import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { env } from "node:process";
import { fileURLToPath } from "node:url";
import { test, expect } from "./fixtures/test";
import { authenticate } from "./fixtures/real-api";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function queryDatabase(sql: string): string {
  return execFileSync(
    "docker",
    [
      "compose",
      "-p",
      env.E2E_COMPOSE_PROJECT ?? "inventory-e2e",
      "-f",
      resolve(repositoryRoot, "docker-compose.e2e.yml"),
      "exec",
      "-T",
      "db",
      "psql",
      "-Atqc",
      sql,
      "-U",
      "binaryheart",
      "-d",
      "inventory",
    ],
    { encoding: "utf8" }
  ).trim();
}

function authorization(token: string) {
  return { Authorization: `Bearer ${token}` };
}

test("editor manages a National misc asset through donor, changelog, note, and type APIs", async ({
  page,
}) => {
  const token = await authenticate(page, "Editor");
  const headers = authorization(token);
  const createResponse = await page.request.post("/api/misc", {
    headers,
    data: { assetId: 1401, description: "E2E cable lot", value: 80, donorId: 301 },
  });
  expect(createResponse.status()).toBe(201);
  expect(await createResponse.json()).toEqual({ id: 1401 });

  const getResponse = await page.request.get("/api/misc/1401", { headers });
  expect(getResponse.status()).toBe(200);
  const misc = await getResponse.json();
  expect(misc).toMatchObject({
    id: 1401,
    description: "E2E cable lot",
    value: 80,
    donorId: 301,
  });
  expect(misc.acquisitionDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  expect(misc).not.toHaveProperty("chapter");
  expect(misc).not.toHaveProperty("chapterId");
  expect(
    queryDatabase(
      "SELECT (chapter_id = (SELECT id FROM chapter WHERE name = 'National'))::text || ',' || (acquisition_date = CURRENT_DATE)::text FROM asset WHERE id = 1401"
    )
  ).toBe("true,true");

  const donorResponse = await page.request.get(
    "/api/misc?donorId=301&pageSize=1&pageKey=0",
    { headers }
  );
  expect(donorResponse.status()).toBe(200);
  expect(await donorResponse.json()).toEqual([misc]);

  const typeResponse = await page.request.get("/api/assets/1401/type", { headers });
  expect(typeResponse.status()).toBe(200);
  expect(await typeResponse.json()).toEqual({ type: "Misc" });

  const updateResponse = await page.request.put("/api/misc/1401", {
    headers,
    data: {
      assetId: 9999,
      description: "E2E network cable lot",
      acquisitionDate: misc.acquisitionDate,
      value: 95,
      donorId: 301,
    },
  });
  expect(updateResponse.status()).toBe(204);

  const changelogResponse = await page.request.get("/api/misc/1401/changelog", { headers });
  expect(changelogResponse.status()).toBe(200);
  expect(await changelogResponse.json()).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        miscId: 1401,
        oldDescription: "E2E cable lot",
        newDescription: "E2E network cable lot",
        oldValue: 80,
        newValue: 95,
      }),
    ])
  );

  const noteResponse = await page.request.post("/api/assets/1401/notes", {
    headers,
    data: { text: "E2E inspected" },
  });
  expect(noteResponse.status()).toBe(200);
  const note = await noteResponse.json();
  expect(note).toMatchObject({ assetId: 1401, text: "E2E inspected" });

  const secondCreateResponse = await page.request.post("/api/misc", {
    headers,
    data: { assetId: 1402, description: "E2E adapters", value: 10, donorId: 301 },
  });
  expect(secondCreateResponse.status()).toBe(201);
  const wrongAssetUpdate = await page.request.put(`/api/assets/1402/notes/${note.id}`, {
    headers,
    data: { text: "must not change" },
  });
  expect(wrongAssetUpdate.status()).toBe(500);

  const noteUpdate = await page.request.put(`/api/assets/1401/notes/${note.id}`, {
    headers,
    data: { text: "E2E inspected and sorted" },
  });
  expect(noteUpdate.status()).toBe(201);
  const notesResponse = await page.request.get("/api/assets/1401/notes", { headers });
  expect(notesResponse.status()).toBe(200);
  expect(await notesResponse.json()).toEqual([
    expect.objectContaining({
      id: note.id,
      assetId: 1401,
      text: "E2E inspected and sorted",
    }),
  ]);
});

test("viewer cannot create or update misc assets", async ({ page }) => {
  const token = await authenticate(page, "Viewer");
  const headers = authorization(token);

  const createResponse = await page.request.post("/api/misc", {
    headers,
    data: { description: "Viewer asset", value: 10, donorId: 301 },
  });
  expect(createResponse.status()).toBe(403);

  const updateResponse = await page.request.put("/api/misc/1001", {
    headers,
    data: { description: "Viewer update", value: 10, donorId: 301 },
  });
  expect(updateResponse.status()).toBe(403);
});

test("validates misc input and allows an admin to delete", async ({ page }) => {
  const token = await authenticate(page);
  const headers = authorization(token);

  const invalidResponse = await page.request.post("/api/misc", {
    headers,
    data: { description: "", value: -1, donorId: null },
  });
  expect(invalidResponse.status()).toBe(400);
  expect(await invalidResponse.text()).toBe("Description, value, and donor are required");

  const createResponse = await page.request.post("/api/misc", {
    headers,
    data: { assetId: 1403, description: "Delete me", value: 1, donorId: 301 },
  });
  expect(createResponse.status()).toBe(201);

  const deleteResponse = await page.request.delete("/api/misc/1403", { headers });
  expect(deleteResponse.status()).toBe(204);
  expect((await page.request.get("/api/misc/1403", { headers })).status()).toBe(404);
  expect((await page.request.get("/api/assets/1403/type", { headers })).status()).toBe(404);
});