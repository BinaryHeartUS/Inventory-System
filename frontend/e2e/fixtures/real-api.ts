import type { Page } from "@playwright/test";

export type TestRole = "Admin" | "Chapter Admin" | "Editor" | "Viewer";

export const TEST_CHAPTER = { id: 101, name: "E2E Test Chapter" } as const;
export const E2E_PASSWORD = "correct-password";

const USERNAMES: Record<TestRole, string> = {
  Admin: "e2e-admin",
  "Chapter Admin": "e2e-chapter-admin",
  Editor: "e2e-editor",
  Viewer: "e2e-viewer",
};

interface LoginResponse {
  token: string;
  username: string;
  chapterRoles: Array<{ chapterId: number; role: string }>;
  role: string;
}

export async function authenticate(page: Page, role: TestRole = "Admin"): Promise<void> {
  const response = await page.request.post("/api/auth/login", {
    data: { username: USERNAMES[role], password: E2E_PASSWORD },
  });
  if (!response.ok()) {
    throw new Error(`E2E authentication failed: ${response.status()} ${await response.text()}`);
  }

  const login = (await response.json()) as LoginResponse;
  const storedAuth = {
    ...login,
    chapterIds: login.chapterRoles.map((chapterRole) => chapterRole.chapterId),
  };

  await page.goto("/login");
  await page.evaluate((auth) => sessionStorage.setItem("bh_auth", JSON.stringify(auth)), storedAuth);
}