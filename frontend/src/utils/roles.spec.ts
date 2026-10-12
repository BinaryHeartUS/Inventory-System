import { describe, expect, it } from "vitest";
import { assignableRoles, canManageAccounts, primaryChapterId } from "./roles";

describe("role permissions", () => {
  it("resolves non-National ties alphabetically and ranks unknown roles last", () => {
    const chapterName = (id: number) => id === 1 ? "Zeta" : "Alpha";
    expect(primaryChapterId([{ chapterId: 1, role: "Editor" }, { chapterId: 2, role: "Editor" }], undefined, chapterName)).toBe(2);
    expect(primaryChapterId([{ chapterId: 1, role: "Custom" }, { chapterId: 2, role: "Viewer" }], undefined, chapterName)).toBe(2);
    expect(canManageAccounts("Admin")).toBe(true);
    expect(canManageAccounts(null)).toBe(false);
  });
  it("limits account management and role assignment by seniority", () => {
    expect(canManageAccounts("Editor")).toBe(false);
    expect(canManageAccounts("Chapter Admin")).toBe(true);
    expect(assignableRoles("Admin")).toEqual(["Admin", "Chapter Admin", "Editor", "Viewer"]);
    expect(assignableRoles("Chapter Admin")).toEqual(["Editor", "Viewer"]);
  });

  it("selects the highest-ranking chapter and prefers National on ties", () => {
    const chapterName = (id: number) => ({ 1: "National", 2: "Zeta", 3: "Alpha" })[id] ?? "";

    expect(
      primaryChapterId(
        [
          { chapterId: 2, role: "Editor" },
          { chapterId: 1, role: "Editor" },
          { chapterId: 3, role: "Viewer" },
        ],
        1,
        chapterName
      )
    ).toBe(1);
    expect(primaryChapterId([], 1, chapterName)).toBeNull();
  });
});
