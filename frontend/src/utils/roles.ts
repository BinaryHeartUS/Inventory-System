// Role/permission business logic. Roles form a strict seniority ladder:
// Admin > Chapter Admin > Editor > Viewer. "National" is a special meta-chapter.
// Keep all role semantics here so pages ask questions instead of re-deriving them.

export type Role = "Admin" | "Chapter Admin" | "Editor" | "Viewer";

/** All roles, most-privileged first. */
export const ROLES: Role[] = ["Admin", "Chapter Admin", "Editor", "Viewer"];

/** Numeric rank for comparing role seniority (higher = more privileged). */
export const ROLE_RANK: Record<string, number> = {
  Admin: 3,
  "Chapter Admin": 2,
  Editor: 1,
  Viewer: 0,
};

/** Roles that grant write (create/edit) access to a chapter's inventory. */
export const WRITE_ROLES = new Set<string>(["Admin", "Chapter Admin", "Editor"]);

/** Tailwind badge classes per role. */
export const ROLE_BADGE_CLASS: Record<string, string> = {
  Admin: "bg-red-100 text-red-700",
  "Chapter Admin": "bg-blue-100 text-blue-700",
  Editor: "bg-green-100 text-green-700",
  Viewer: "bg-slate-100 text-slate-600",
};

/** Can this role reach the account-management screens at all? */
export function canManageAccounts(role: string | undefined | null): boolean {
  return role === "Admin" || role === "Chapter Admin";
}

/** Which roles a user of the given role is allowed to assign to others. */
export function assignableRoles(role: string | undefined | null): string[] {
  return role === "Admin" ? ["Admin", "Chapter Admin", "Editor", "Viewer"] : ["Editor", "Viewer"];
}

interface ChapterRoleLike {
  chapterId: number;
  role: string;
}

/**
 * Determines the "primary" chapter for an account = the chapter where it holds
 * its highest-ranked role. Ties break toward National, then alphabetically by
 * chapter name. Returns null when the account has no chapter roles.
 */
export function primaryChapterId(
  chapterRoles: ChapterRoleLike[],
  nationalChapterId: number | undefined,
  chapterName: (id: number) => string
): number | null {
  if (chapterRoles.length === 0) return null;
  const maxRank = Math.max(...chapterRoles.map((r) => ROLE_RANK[r.role] ?? -1));
  const tied = chapterRoles.filter((r) => (ROLE_RANK[r.role] ?? -1) === maxRank);
  const national = tied.find((r) => r.chapterId === nationalChapterId);
  if (national) return national.chapterId;
  return [...tied].sort((a, b) =>
    chapterName(a.chapterId).localeCompare(chapterName(b.chapterId))
  )[0].chapterId;
}
