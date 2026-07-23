import { useState } from "react";
import type { AccountSummary } from "../types/inventory";
import { labelCls } from "../utils/formStyles";
import { RoleBadge } from "./RoleBadge";
/**
 * The inline expand-in-place editor for a single account's chapter affiliations
 * (add/change/remove roles) plus account deletion. Rendered inside the accounts
 * table as a full-width row.
 *
 * Presentational: keeps only local form/UI state (pending role selections, per-row
 * loading and error indicators). All persistence runs through the injected
 * onSaveRole / onRemoveRole / onAddRole / onDeleteAccount callbacks, which live in
 * AccountEditPanelContainer.
 */
export function AccountEditPanel({
  account,
  assignableRoles,
  assignableChapters,
  nationalChapterId,
  currentUserId,
  onClose,
  chapterName,
  onSaveRole,
  onRemoveRole,
  onAddRole,
  onDeleteAccount,
}: {
  account: AccountSummary;
  assignableRoles: string[];
  assignableChapters: { id: number; name: string }[];
  nationalChapterId: number | undefined;
  currentUserId: number | undefined;
  onClose: () => void;
  chapterName: (id: number) => string;
  onSaveRole: (chapterId: number, role: string) => Promise<void>;
  onRemoveRole: (chapterId: number) => Promise<void>;
  onAddRole: (chapterId: number, role: string) => Promise<void>;
  onDeleteAccount: () => Promise<boolean>;
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
      await onSaveRole(chapterId, roleValues[chapterId]);
    } catch (e) {
      setRowError((prev) => ({
        ...prev,
        [chapterId]: e instanceof Error ? e.message : "Failed to save",
      }));
      setSavingChapter(null);
    }
  }

  async function handleRemove(chapterId: number) {
    setRemovingChapter(chapterId);
    setRowError((prev) => ({ ...prev, [chapterId]: "" }));
    try {
      await onRemoveRole(chapterId);
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
      await onAddRole(Number(addChapter), addRole);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Failed to add");
      setAddLoading(false);
    }
  }

  async function handleDelete() {
    setDeleteLoading(true);
    try {
      const proceeded = await onDeleteAccount();
      if (!proceeded) setDeleteLoading(false);
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
