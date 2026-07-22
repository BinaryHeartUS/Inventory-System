import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useChapters } from "../context/ChapterContext";
import { useVisibleChapters } from "../context/ChapterContext";
import PageHeading from "../components/PageHeading";
import {
  getAccounts,
  createAccount,
  deleteAccount,
  addAccountRole,
  updateAccountRole,
  removeAccountRole,
  type AccountSummary,
} from "../services/accountService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none " +
  "focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white";
const labelCls = "text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block";

const ROLE_BADGE: Record<string, string> = {
  Admin: "bg-red-100 text-red-700",
  "Chapter Admin": "bg-blue-100 text-blue-700",
  Editor: "bg-green-100 text-green-700",
  Viewer: "bg-slate-100 text-slate-600",
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${ROLE_BADGE[role] ?? "bg-slate-100 text-slate-600"}`}
    >
      {role}
    </span>
  );
}

// ─── Edit panel ───────────────────────────────────────────────────────────────

function AccountEditPanel({
  account,
  assignableRoles,
  assignableChapters,
  nationalChapterId,
  currentUserId,
  onClose,
  onDeleted,
  chapterName,
}: {
  account: AccountSummary;
  assignableRoles: string[];
  assignableChapters: { id: number; name: string }[];
  nationalChapterId: number | undefined;
  currentUserId: number | undefined;
  onClose: () => void;
  onDeleted: () => void;
  chapterName: (id: number) => string;
}) {
  const isAdminAccount = account.chapterRoles.some((cr) => cr.role === "Admin");

  // Per-affiliation role state (tracks unsaved changes)
  const [roleValues, setRoleValues] = useState<Record<number, string>>(
    Object.fromEntries(account.chapterRoles.map((cr) => [cr.chapterId, cr.role]))
  );
  const [savingChapter, setSavingChapter] = useState<number | null>(null);
  const [removingChapter, setRemovingChapter] = useState<number | null>(null);
  const [rowError, setRowError] = useState<Record<number, string>>({});

  // Add-chapter row
  const [addChapter, setAddChapter] = useState("");
  const [addRole, setAddRole] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  /** Roles available for a given chapter ID (Admin only for National). */
  function rolesFor(chapterId: number): string[] {
    if (chapterId === nationalChapterId) return assignableRoles;
    return assignableRoles.filter((r) => r !== "Admin");
  }

  /** Chapters available when a role is already chosen (National only for Admin). */
  const addChapterOptions =
    addRole === "Admin"
      ? assignableChapters.filter((c) => c.id === nationalChapterId)
      : assignableChapters.filter((c) => c.id !== nationalChapterId);

  // Delete account
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleSaveRole(chapterId: number) {
    setSavingChapter(chapterId);
    setRowError((prev) => ({ ...prev, [chapterId]: "" }));
    try {
      await updateAccountRole(account.id, chapterId, roleValues[chapterId]);
      onClose();
      onDeleted(); // reload
    } catch (e) {
      setRowError((prev) => ({
        ...prev,
        [chapterId]: e instanceof Error ? e.message : "Failed to save",
      }));
    } finally {
      setSavingChapter(null);
    }
  }

  async function handleRemove(chapterId: number) {
    setRemovingChapter(chapterId);
    setRowError((prev) => ({ ...prev, [chapterId]: "" }));
    try {
      await removeAccountRole(account.id, chapterId);
      onClose();
      onDeleted();
    } catch (e) {
      setRowError((prev) => ({
        ...prev,
        [chapterId]: e instanceof Error ? e.message : "Failed to remove",
      }));
      setRemovingChapter(null);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addChapter || !addRole) return;
    setAddLoading(true);
    setAddError(null);
    try {
      await addAccountRole(account.id, Number(addChapter), addRole);
      onClose();
      onDeleted();
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Failed to add");
      setAddLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete account "${account.username}"? This cannot be undone.`)) return;
    setDeleteLoading(true);
    try {
      await deleteAccount(account.id);
      onDeleted();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete account");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Editing — {account.name}
        </p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Affiliations table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden mb-4">
        <table className="responsive-cards w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="text-left px-4 py-2">Chapter</th>
              <th className="text-left px-4 py-2">Role</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {account.chapterRoles.map((cr) => {
              const isSelf = account.id === currentUserId;
              const isDirty = roleValues[cr.chapterId] !== cr.role;
              return (
                <tr key={cr.chapterId} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2.5 text-slate-700 font-medium" data-label="Chapter">
                    {chapterName(cr.chapterId)}
                  </td>
                  <td className="px-4 py-2.5" data-label="Role">
                    {isAdminAccount ? (
                      <RoleBadge role={cr.role} />
                    ) : (
                      <div className="flex items-center gap-2">
                        <select
                          value={roleValues[cr.chapterId]}
                          onChange={(e) =>
                            !isSelf &&
                            setRoleValues((prev) => ({ ...prev, [cr.chapterId]: e.target.value }))
                          }
                          disabled={isSelf}
                          className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {rolesFor(cr.chapterId).map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        {isDirty && !isSelf && (
                          <button
                            onClick={() => handleSaveRole(cr.chapterId)}
                            disabled={savingChapter === cr.chapterId}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-heart-blue hover:opacity-90 disabled:opacity-50 transition-opacity"
                          >
                            {savingChapter === cr.chapterId ? "Saving…" : "Save"}
                          </button>
                        )}
                        {rowError[cr.chapterId] && (
                          <span className="text-xs text-red-500">{rowError[cr.chapterId]}</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right" data-label="">
                    {!isSelf && !isAdminAccount && (
                      <button
                        onClick={() => handleRemove(cr.chapterId)}
                        disabled={removingChapter === cr.chapterId}
                        title="Remove chapter access"
                        className="text-slate-300 hover:text-red-500 disabled:opacity-40 transition-colors text-xs font-medium"
                      >
                        {removingChapter === cr.chapterId ? "Removing…" : "Remove"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add chapter row */}
      {isAdminAccount && (
        <p className="text-xs text-slate-400 bg-slate-100 rounded-lg px-3 py-2 mb-5">
          Admin accounts cannot have their roles modified. Delete the account to remove admin
          access.
        </p>
      )}
      {!isAdminAccount && (
        <form
          onSubmit={handleAdd}
          className="flex flex-col items-stretch gap-3 mb-5 sm:flex-row sm:items-end"
        >
          <div>
            <label className={labelCls}>Add Chapter Access</label>
            <select
              value={addChapter}
              onChange={(e) => setAddChapter(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue bg-white w-full sm:w-44"
            >
              <option value="">Chapter…</option>
              {addChapterOptions
                .filter((c) => !account.chapterRoles.some((cr) => cr.chapterId === c.id))
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className={`${labelCls} hidden sm:block`}>&nbsp;</label>
            <select
              value={addRole}
              onChange={(e) => setAddRole(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue bg-white w-full sm:w-36"
            >
              <option value="">Role…</option>
              {assignableRoles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!addChapter || !addRole || addLoading}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white bg-heart-blue hover:opacity-90 disabled:opacity-40 transition-opacity w-full sm:w-auto"
          >
            {addLoading ? "Adding…" : "Add"}
          </button>
          {addError && <p className="text-xs text-red-500 self-center">{addError}</p>}
        </form>
      )}

      {/* Delete account */}
      {currentUserId !== account.id && (
        <div className="border-t border-slate-200 pt-4 flex justify-end">
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
            {deleteLoading ? "Deleting…" : "Delete Account"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAccounts() {
  const { auth } = useAuth();
  const { chapterName } = useChapters();
  const isAdmin = auth?.role === "Admin";
  const isChapterAdmin = auth?.role === "Chapter Admin";

  // ── Account list ────────────────────────────────────────────────────────────
  const [accounts, setAccounts] = useState<AccountSummary[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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
      }
    }
    reloadRef.current = fetch;
    fetch();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadAccounts = useCallback(() => reloadRef.current(), []);

  // ── Create form ─────────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formAffiliations, setFormAffiliations] = useState([{ chapter: "", role: "" }]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const assignableRoles = isAdmin
    ? ["Admin", "Chapter Admin", "Editor", "Viewer"]
    : ["Editor", "Viewer"];

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

  function setAffiliation(index: number, field: "chapter" | "role", value: string) {
    setFormAffiliations((prev) => prev.map((a, i) => (i === index ? { ...a, [field]: value } : a)));
  }

  function rolesForChapter(chapterId: string): string[] {
    if (!chapterId || Number(chapterId) !== nationalChapterId)
      return assignableRoles.filter((r) => r !== "Admin");
    return assignableRoles;
  }

  function addAffiliationRow() {
    setFormAffiliations((prev) => [...prev, { chapter: "", role: "" }]);
  }

  function removeAffiliationRow(index: number) {
    setFormAffiliations((prev) => prev.filter((_, i) => i !== index));
  }

  function resetForm() {
    setFormName("");
    setFormUsername("");
    setFormPassword("");
    setFormAffiliations([{ chapter: "", role: "" }]);
    setFormError(null);
    setShowForm(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    for (const a of formAffiliations) {
      if (!a.chapter || !a.role) {
        setFormError("Each affiliation needs a chapter and role");
        return;
      }
    }
    setFormLoading(true);
    try {
      const first = formAffiliations[0];
      const created = await createAccount({
        name: formName,
        username: formUsername,
        password: formPassword,
        chapterId: Number(first.chapter),
        role: first.role,
      });
      for (const a of formAffiliations.slice(1)) {
        await addAccountRole(created.id, Number(a.chapter), a.role);
      }
      await loadAccounts();
      resetForm();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Failed to create account");
    } finally {
      setFormLoading(false);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-end justify-between">
        <PageHeading
          title="Manage Accounts"
          subtitle={isAdmin ? "All volunteer accounts" : "Accounts in your chapter"}
        />
        {(isAdmin || isChapterAdmin) && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-heart-blue hover:opacity-90 px-4 py-2 rounded-lg transition-opacity"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Account
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
            New Account
          </p>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={inputCls}
                required
                autoFocus
              />
            </div>
            <div>
              <label className={labelCls}>Username</label>
              <input
                type="text"
                autoComplete="off"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Password</label>
              <input
                type="password"
                autoComplete="new-password"
                value={formPassword}
                onChange={(e) => setFormPassword(e.target.value)}
                className={inputCls}
                required
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className={labelCls}>Chapter Access</span>
                <button
                  type="button"
                  onClick={addAffiliationRow}
                  className="flex items-center gap-1 text-xs font-semibold text-heart-blue hover:opacity-80 transition-opacity"
                >
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add role
                </button>
              </div>
              {formAffiliations.map((a, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select
                    value={a.chapter}
                    onChange={(e) => setAffiliation(i, "chapter", e.target.value)}
                    className={`${inputCls} flex-1`}
                    required
                  >
                    <option value="">Chapter…</option>
                    {assignableChapters.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={a.role}
                    onChange={(e) => setAffiliation(i, "role", e.target.value)}
                    className={`${inputCls} flex-1`}
                    required
                  >
                    <option value="">Role…</option>
                    {rolesForChapter(a.chapter).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  {formAffiliations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeAffiliationRow(i)}
                      className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            {formError && (
              <p className="sm:col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-heart-blue hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {formLoading ? "Creating…" : "Create Account"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {listError && <p className="text-sm text-red-600 px-6 py-4">{listError}</p>}
        {accounts.length === 0 && !listError ? (
          <p className="text-sm text-slate-400 px-6 py-8 text-center">No accounts found</p>
        ) : (
          <table className="responsive-cards w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="text-left px-6 py-3">Username</th>
                <th className="text-left px-6 py-3">Name</th>
                <th className="text-left px-6 py-3">Chapter Access</th>
                {(isAdmin || isChapterAdmin) && <th className="px-6 py-3 w-16" />}
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <>
                  <tr
                    key={account.id}
                    className={`border-b border-slate-50 transition-colors ${expandedId === account.id ? "bg-slate-50" : "hover:bg-slate-50 cursor-pointer"}`}
                    onClick={() =>
                      (isAdmin || isChapterAdmin) &&
                      setExpandedId((id) => (id === account.id ? null : account.id))
                    }
                  >
                    <td className="px-6 py-3 font-medium text-slate-900" data-label="Username">
                      {account.username}
                    </td>
                    <td className="px-6 py-3 text-slate-600" data-label="Name">
                      {account.name}
                    </td>
                    <td className="px-6 py-3" data-label="Access">
                      <div className="flex flex-wrap gap-2">
                        {account.chapterRoles.map((cr) => (
                          <span
                            key={cr.chapterId}
                            className="inline-flex items-center gap-1 text-xs text-slate-500"
                          >
                            <span>{chapterName(cr.chapterId)}</span>
                            <RoleBadge role={cr.role} />
                          </span>
                        ))}
                      </div>
                    </td>
                    {(isAdmin || isChapterAdmin) && (
                      <td className="px-6 py-3 text-right" data-label="">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className={`text-slate-300 inline transition-transform ${expandedId === account.id ? "rotate-180" : ""}`}
                        >
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </td>
                    )}
                  </tr>
                  {expandedId === account.id && (isAdmin || isChapterAdmin) && (
                    <tr key={`${account.id}-edit`} className="rc-raw">
                      <td colSpan={4} className="p-0 rc-raw">
                        <AccountEditPanel
                          account={account}
                          assignableRoles={assignableRoles}
                          assignableChapters={assignableChapters}
                          nationalChapterId={nationalChapterId}
                          currentUserId={(auth as { id?: number })?.id}
                          chapterName={chapterName}
                          onClose={() => setExpandedId(null)}
                          onDeleted={() => {
                            setExpandedId(null);
                            loadAccounts();
                          }}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
