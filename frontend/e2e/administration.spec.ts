import { test, expect } from "./fixtures/test";
import { authenticate, E2E_PASSWORD, TEST_CHAPTER } from "./fixtures/real-api";

test.beforeEach(async ({ page }) => {
  await authenticate(page);
});

test("changes the signed-in account password", async ({ page }) => {
  await page.goto("/account");

  await page.getByTestId("current-password").fill(E2E_PASSWORD);
  await page.getByTestId("new-password").fill("new-password-123");
  await page.getByTestId("confirm-password").fill("new-password-123");
  await page.getByRole("button", { name: "Update password" }).click();

  await expect(page.getByText("Password updated successfully", { exact: true })).toBeVisible();
});

test("creates a volunteer account with chapter access", async ({ page }) => {
  await page.goto("/admin/accounts");
  await expect(page.getByRole("heading", { name: "Manage Accounts" })).toBeVisible();

  await page.getByRole("button", { name: "New Account" }).click();
  await page.getByTestId("account-full-name").fill("E2E New Volunteer");
  await page.getByTestId("account-username").fill("e2e-new-volunteer");
  await page.getByTestId("account-password").fill("temporary-password");
  await page.getByTestId("account-chapter-0").selectOption(String(TEST_CHAPTER.id));
  await page.getByTestId("account-role-0").selectOption("Editor");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByTestId("account-full-name")).toBeHidden();
  await page.getByRole("button", { name: /E2E Test Chapter.*account/i }).click();
  await expect(page.getByText("e2e-new-volunteer", { exact: true })).toBeVisible();
});

test("national admins can assign National Viewer access to a chapter admin", async ({ page }) => {
  const adminToken = await authenticate(page, "Admin");
  const chapterResponse = await page.request.post("/api/chapters", {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { name: "E2E National Role Option Chapter" },
  });
  expect(chapterResponse.ok()).toBe(true);
  const chapter = (await chapterResponse.json()) as { id: number };
  const accountResponse = await page.request.post("/api/accounts", {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      name: "E2E National Viewer Volunteer",
      username: "e2e-national-viewer-volunteer",
      password: "temporary-password",
      chapterId: TEST_CHAPTER.id,
      role: "Chapter Admin",
    },
  });
  expect(accountResponse.ok()).toBe(true);

  await page.goto("/admin/accounts");
  await page.getByRole("button", { name: /E2E Test Chapter.*account/i }).click();
  const accountRow = page
    .getByRole("row")
    .filter({ hasText: "e2e-national-viewer-volunteer" })
    .first();
  await accountRow.click();

  const editor = page.locator("tr.rc-raw");
  const addForm = editor.locator("form");
  const chapterSelect = addForm.locator("select").nth(0);
  const roleSelect = addForm.locator("select").nth(1);
  await expect(roleSelect.locator('option[value="Admin"]')).toHaveCount(0);
  await chapterSelect.selectOption(String(chapter.id));
  await expect(roleSelect.locator('option[value="Admin"]')).toHaveCount(0);
  await chapterSelect.selectOption("1");
  await expect(roleSelect.locator('option[value="Admin"]')).toHaveCount(1);
  await roleSelect.selectOption("Viewer");
  await expect(chapterSelect.locator('option[value="1"]')).toHaveCount(1);
  await chapterSelect.selectOption("1");
  await addForm.getByRole("button", { name: "Add", exact: true }).click();

  await expect(editor).toHaveCount(0);
  await accountRow.click();
  const nationalAffiliation = editor.getByRole("row").filter({ hasText: "National" });
  await expect(nationalAffiliation.locator("select")).toHaveValue("Viewer");
});

test("cannot add chapter access when no chapters are available", async ({ page }) => {
  await page.route("**/api/chapters", (route) => route.fulfill({ json: [] }));
  await page.goto("/admin/accounts");
  await page.getByRole("button", { name: "New Account" }).click();

  await expect(page.getByRole("button", { name: "Add role" })).toBeDisabled();
  await expect(page.getByTestId("account-chapter-0")).toBeVisible();
  await expect(page.getByTestId("account-chapter-1")).toHaveCount(0);
});

test("chapter admins can create and demote another chapter admin", async ({ page }) => {
  await authenticate(page, "Chapter Admin");
  await page.goto("/admin/accounts");
  await page.getByRole("button", { name: "New Account" }).click();
  await page.getByTestId("account-full-name").fill("E2E Peer Chapter Admin");
  await page.getByTestId("account-username").fill("e2e-peer-chapter-admin");
  await page.getByTestId("account-password").fill("temporary-password");
  await page.getByTestId("account-chapter-0").selectOption(String(TEST_CHAPTER.id));
  await page.getByTestId("account-role-0").selectOption("Chapter Admin");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByTestId("account-full-name")).toBeHidden();
  await page.getByRole("button", { name: /E2E Test Chapter.*account/i }).click();
  const accountRow = page.getByRole("row").filter({ hasText: "e2e-peer-chapter-admin" }).first();
  await expect(accountRow).toBeVisible();
  await accountRow.click();

  const roleSelect = page.locator('tr.rc-raw td[data-label="Role"] select');
  await expect(roleSelect).toHaveValue("Chapter Admin");
  await roleSelect.selectOption("Editor");
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("E2E Peer Chapter Admin", { exact: true })).toBeVisible();
  await accountRow.click();
  const demotedRoleSelect = page.locator('tr.rc-raw td[data-label="Role"] select');
  await expect(demotedRoleSelect).toHaveValue("Editor");
  await demotedRoleSelect.selectOption("Chapter Admin");
  await page.getByRole("button", { name: "Save" }).click();
  await accountRow.click();
  const promotedRoleSelect = page.locator('tr.rc-raw td[data-label="Role"] select');
  await expect(promotedRoleSelect).toHaveValue("Chapter Admin");
  await promotedRoleSelect.selectOption("Editor");
  await page.getByRole("button", { name: "Save" }).click();
  await accountRow.click();
  await expect(page.locator('tr.rc-raw td[data-label="Role"] select')).toHaveValue("Editor");
});

test("chapter admins cannot adjust affiliations outside their chapters", async ({ page }) => {
  const adminToken = await authenticate(page, "Admin");
  const accountResponse = await page.request.post("/api/accounts", {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: {
      name: "E2E Cross-Chapter Volunteer",
      username: "e2e-cross-chapter-volunteer",
      password: "temporary-password",
      chapterId: TEST_CHAPTER.id,
      role: "Editor",
    },
  });
  expect(accountResponse.ok()).toBe(true);
  const account = (await accountResponse.json()) as { id: number };
  const affiliationResponse = await page.request.post(`/api/accounts/${account.id}/roles`, {
    headers: { Authorization: `Bearer ${adminToken}` },
    data: { chapterId: 1, role: "Editor" },
  });
  expect(affiliationResponse.ok()).toBe(true);

  await authenticate(page, "Chapter Admin");
  await page.goto("/admin/accounts");
  await page.getByRole("button", { name: /E2E Test Chapter.*account/i }).click();
  await page.getByRole("row").filter({ hasText: "e2e-cross-chapter-volunteer" }).click();

  const editor = page.locator("tr.rc-raw");
  const managedAffiliation = editor.getByRole("row").filter({ hasText: TEST_CHAPTER.name });
  const unmanagedAffiliation = editor.getByRole("row").filter({ hasText: "National" });
  await expect(managedAffiliation.locator("select")).toBeEnabled();
  await expect(unmanagedAffiliation.locator("select")).toHaveCount(0);
  await expect(unmanagedAffiliation.getByTitle("Remove chapter access")).toHaveCount(0);
  await expect(editor.getByText("Add Chapter Access", { exact: true })).toHaveCount(0);
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

test.describe("password validation and failures", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/account");
    await page.getByTestId("current-password").fill(E2E_PASSWORD);
  });

  test("rejects mismatched new passwords", async ({ page }) => {
    await page.getByTestId("new-password").fill("new-password-123");
    await page.getByTestId("confirm-password").fill("different-password");
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page.getByText("New passwords do not match", { exact: true })).toBeVisible();
  });

  test("rejects a short new password", async ({ page }) => {
    await page.getByTestId("new-password").fill("short");
    await page.getByTestId("confirm-password").fill("short");
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(
      page.getByText("New password must be at least 8 characters", { exact: true })
    ).toBeVisible();
  });

  test("reports an incorrect current password and retains the form", async ({ page }) => {
    await page.getByTestId("current-password").fill("incorrect-password");
    await page.getByTestId("new-password").fill("new-password-123");
    await page.getByTestId("confirm-password").fill("new-password-123");
    await page.getByRole("button", { name: "Update password" }).click();

    await expect(page.getByText("Current password is incorrect", { exact: true })).toBeVisible();
    await expect(page.getByTestId("current-password")).toHaveValue("incorrect-password");
  });
});

test("requires a chapter and role when creating an account", async ({ page }) => {
  await page.goto("/admin/accounts");
  await page.getByRole("button", { name: "New Account" }).click();
  await page.getByTestId("account-full-name").fill("Missing Affiliation");
  await page.getByTestId("account-username").fill("missing-affiliation");
  await page.getByTestId("account-password").fill("temporary-password");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(page.getByTestId("account-chapter-0")).toBeFocused();
  expect(
    await page.getByTestId("account-chapter-0").evaluate((select) => select.matches(":invalid"))
  ).toBe(true);
});

test("reports duplicate usernames without adding an account", async ({ page }) => {
  await page.goto("/admin/accounts");
  await page.getByRole("button", { name: "New Account" }).click();
  await page.getByTestId("account-full-name").fill("Duplicate User");
  await page.getByTestId("account-username").fill("e2e-admin");
  await page.getByTestId("account-password").fill("temporary-password");
  await page.getByTestId("account-chapter-0").selectOption(String(TEST_CHAPTER.id));
  await page.getByTestId("account-role-0").selectOption("Editor");
  await page.getByRole("button", { name: "Create Account" }).click();

  await expect(
    page.getByText("Username 'e2e-admin' is already taken", { exact: true })
  ).toBeVisible();
});

test("does not offer deletion for a chapter that contains inventory", async ({ page }) => {
  await page.goto("/chapters");

  await expect(page.getByTitle(/Cannot delete.*chapter still has/i)).toBeDisabled();
});

test("does not submit a duplicate lookup value", async ({ page }) => {
  await page.goto("/settings");
  const manufacturers = page.getByTestId("lookup-manufacturers");
  await manufacturers.getByPlaceholder("Add a manufacturer…").fill("framework");
  await manufacturers.getByRole("button", { name: "Add" }).click();

  await expect(manufacturers.getByText("Framework", { exact: true })).toHaveCount(1);
});
