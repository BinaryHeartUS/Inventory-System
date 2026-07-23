import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useChapters, useVisibleChapters } from "../context/ChapterContext";
import { getAccounts, createAccount, addAccountRole } from "../services/accountService";
import type { AccountSummary } from "../types/inventory";
import {
  assignableRoles as assignableRolesFor,
  canManageAccounts,
  primaryChapterId,
} from "../utils/roles";
import AdminAccountsView, {
  type AccountGroup,
  type CreateAccountPayload,
} from "../components/adminAccounts/AdminAccountsView";

/**
 * AdminAccountsContainer — loads volunteer accounts, groups them by primary
 * chapter, resolves the assignable roles/chapters for the current user, and
 * performs account creation.
 */
export default function AdminAccountsContainer() {
  const { auth } = useAuth();
  const { chapterName } = useChapters();
  const isAdmin = auth?.role === "Admin";
  const canManage = canManageAccounts(auth?.role);

  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const reloadRef = useRef<() => void>(() => {});

  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      try {
        const data = await getAccounts();
        if (!cancelled) {
          setAccounts(data);
          setListError(null);
        }
      } catch (e) {
        if (!cancelled) setListError(e instanceof Error ? e.message : "Failed to load accounts");
      } finally {
        if (!cancelled) setAccountsLoaded(true);
      }
    }
    reloadRef.current = fetch;
    fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadAccounts = useCallback(() => reloadRef.current(), []);

  const assignableRoles = assignableRolesFor(auth?.role);

  const allChapters = useVisibleChapters();
  const { chapters: allChaptersIncludingNational } = useChapters();
  const nationalChapterId = allChaptersIncludingNational.find((c) => c.name === "National")?.id;
  const assignableChapters = isAdmin
    ? allChaptersIncludingNational
    : allChapters.filter((c) =>
        (auth?.chapterRoles ?? []).some(
          (cr) => cr.chapterId === c.id && cr.role === "Chapter Admin"
        )
      );

  const groups = useMemo<AccountGroup[]>(() => {
    const byChapter = new Map<number, AccountSummary[]>();
    for (const account of accounts) {
      const pid = primaryChapterId(account.chapterRoles, nationalChapterId, chapterName) ?? -1; // -1 = no chapter access
      const bucket = byChapter.get(pid);
      if (bucket) bucket.push(account);
      else byChapter.set(pid, [account]);
    }

    return Array.from(byChapter.entries())
      .map(([chapterId, accts]) => ({
        chapterId,
        name: chapterId === -1 ? "No chapter access" : chapterName(chapterId),
        accounts: [...accts].sort((a, b) => a.username.localeCompare(b.username)),
      }))
      .sort((a, b) => {
        if (a.chapterId === nationalChapterId) return -1;
        if (b.chapterId === nationalChapterId) return 1;
        if (a.chapterId === -1) return 1;
        if (b.chapterId === -1) return -1;
        return a.name.localeCompare(b.name);
      });
  }, [accounts, nationalChapterId, chapterName]);

  async function handleCreate(payload: CreateAccountPayload): Promise<string | null> {
    try {
      const first = payload.affiliations[0];
      const created = await createAccount({
        name: payload.name,
        username: payload.username,
        password: payload.password,
        chapterId: Number(first.chapter),
        role: first.role,
      });
      for (const a of payload.affiliations.slice(1)) {
        await addAccountRole(created.id, Number(a.chapter), a.role);
      }
      await loadAccounts();
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : "Failed to create account";
    }
  }

  return (
    <AdminAccountsView
      isAdmin={isAdmin}
      canManage={canManage}
      groups={groups}
      accountsLoaded={accountsLoaded}
      listError={listError}
      assignableRoles={assignableRoles}
      assignableChapters={assignableChapters}
      nationalChapterId={nationalChapterId}
      currentUserId={(auth as { id?: number })?.id}
      chapterName={chapterName}
      onCreate={handleCreate}
      onReload={loadAccounts}
    />
  );
}
