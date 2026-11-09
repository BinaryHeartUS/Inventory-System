import type { Page } from "@playwright/test";

export type TestRole = "Admin" | "Chapter Admin" | "Editor" | "Viewer";
export const TEST_CHAPTER = { id: 101, name: "E2E Test Chapter" } as const;
export const AUTH_ISSUER = process.env.E2E_AUTH_ISSUER ?? "http://127.0.0.1:4174";

export async function authenticate(page: Page, role: TestRole = "Admin"): Promise<string> {
  const response = await page.request.get(`${AUTH_ISSUER}/fixture/token`, { params: { role } });
  if (!response.ok())
    throw new Error(`E2E issuer failed: ${response.status()} ${await response.text()}`);
  const { access_token: token } = (await response.json()) as { access_token: string };
  const session = await page.request.get("/api/auth/session", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!session.ok())
    throw new Error(`E2E session failed: ${session.status()} ${await session.text()}`);
  const profile = (await session.json()) as {
    username: string;
    chapterRoles: Array<{ chapterId: number; role: string }>;
    role: string;
  };
  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.evaluate((auth) => sessionStorage.setItem("bh_auth", JSON.stringify(auth)), {
    ...profile,
    token,
    issuer: AUTH_ISSUER,
    chapterIds: profile.chapterRoles.map(({ chapterId }) => chapterId),
  });
  return token;
}
