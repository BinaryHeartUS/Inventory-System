import { useState, Fragment } from "react";
import type { AccountSummary, ChapterSummary } from "../../types/inventory";
import PageHeading from "../PageHeading";
import { AccountEditPanelContainer } from "../../containers/AccountEditPanelContainer";
import { RoleBadge } from "./RoleBadge";
import { Chevron } from "../Chevron";
import { inputCls, labelCls } from "../../utils/formStyles";

export interface AccountGroup {
  chapterId: number;
  name: string;
  accounts: AccountSummary[];
}

export interface CreateAccountPayload {
  name: string;
  username: string;
  password: string;
  affiliations: Array<{ chapter: string; role: string }>;
}

export interface AdminAccountsViewProps {
  isAdmin: boolean;
  canManage: boolean;
  groups: AccountGroup[];
  accountsLoaded: boolean;
  listError: string | null;
  assignableRoles: string[];
  assignableChapters: ChapterSummary[];
  nationalChapterId: number | undefined;
  currentUserId: number | undefined;
  chapterName: (id: number) => string;
  onCreate: (payload: CreateAccountPayload) => Promise<string | null>;
  onReload: () => void;
}

export default function AdminAccountsView({
  isAdmin,
  canManage,
  groups,
  accountsLoaded,
  listError,
  assignableRoles,
  assignableChapters,
  nationalChapterId,
  currentUserId,
  chapterName,
  onCreate,
  onReload,
}: AdminAccountsViewProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formAffiliations, setFormAffiliations] = useState([{ chapter: "", role: "" }]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const colCount = canManage ? 4 : 3;

  function toggleChapter(id: number) {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
      const error = await onCreate({
        name: formName,
        username: formUsername,
        password: formPassword,
        affiliations: formAffiliations,
      });
      if (error) {
        setFormError(error);
      } else {
        resetForm();
      }
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-end justify-between">
        <PageHeading
          title="Manage Accounts"
          subtitle={`${isAdmin ? "All volunteer accounts" : "Accounts in your chapter"}, grouped by chapter`}
        />
        {canManage && (
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

      {/* Account list — grouped by chapter */}
      {listError && (
        <p className="text-sm text-red-600 bg-white border border-slate-200 rounded-xl px-6 py-4">
          {listError}
        </p>
      )}
      {!accountsLoaded && !listError ? (
        <p className="text-sm text-slate-400 bg-white border border-slate-200 rounded-xl px-6 py-8 text-center">
          Loading accounts…
        </p>
      ) : groups.length === 0 && !listError ? (
        <p className="text-sm text-slate-400 bg-white border border-slate-200 rounded-xl px-6 py-8 text-center">
          No accounts found
        </p>
      ) : (
        <div className="space-y-3">
          {groups.map((group) => {
            const groupExpanded = expandedChapters.has(group.chapterId);
            return (
              <div
                key={group.chapterId}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleChapter(group.chapterId)}
                  className="w-full flex items-center gap-2.5 px-6 py-3 bg-slate-50 hover:bg-slate-100 transition-colors select-none cursor-pointer text-slate-700"
                >
                  <Chevron expanded={groupExpanded} />
                  <span className="font-semibold">{group.name}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                    {group.accounts.length} {group.accounts.length === 1 ? "account" : "accounts"}
                  </span>
                </button>
                {groupExpanded && (
                  <table className="responsive-cards w-full text-sm border-t border-slate-100">
                    <thead>
                      <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <th className="text-left px-6 py-3">Username</th>
                        <th className="text-left px-6 py-3">Name</th>
                        <th className="text-left px-6 py-3">Chapter Access</th>
                        {canManage && <th className="px-6 py-3 w-16" />}
                      </tr>
                    </thead>
                    <tbody>
                      {group.accounts.map((account) => (
                        <Fragment key={account.id}>
                          <tr
                            className={`border-b border-slate-50 transition-colors ${expandedId === account.id ? "bg-slate-50" : "hover:bg-slate-50 cursor-pointer"}`}
                            onClick={() =>
                              canManage &&
                              setExpandedId((id) => (id === account.id ? null : account.id))
                            }
                          >
                            <td
                              className="px-6 py-3 font-medium text-slate-900"
                              data-label="Username"
                            >
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
                            {canManage && (
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
                          {expandedId === account.id && canManage && (
                            <tr className="rc-raw">
                              <td colSpan={colCount} className="p-0 rc-raw">
                                <AccountEditPanelContainer
                                  account={account}
                                  assignableRoles={assignableRoles}
                                  assignableChapters={assignableChapters}
                                  nationalChapterId={nationalChapterId}
                                  currentUserId={currentUserId}
                                  chapterName={chapterName}
                                  onClose={() => setExpandedId(null)}
                                  onDeleted={() => {
                                    setExpandedId(null);
                                    onReload();
                                  }}
                                />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
