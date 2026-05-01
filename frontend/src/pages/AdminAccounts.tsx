import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChapters } from '../context/ChapterContext'
import { useVisibleChapters } from '../context/ChapterContext'
import PageHeading from '../components/PageHeading'
import {
  getAccounts, createAccount, deleteAccount, addAccountRole, updateAccountRole,
  type AccountSummary,
} from '../services/accountService'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none ' +
  'focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white'
const labelCls = 'text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block'

const ROLE_BADGE: Record<string, string> = {
  'Admin':         'bg-red-100 text-red-700',
  'Chapter Admin': 'bg-blue-100 text-blue-700',
  'Editor':        'bg-green-100 text-green-700',
  'Viewer':        'bg-slate-100 text-slate-600',
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${ROLE_BADGE[role] ?? 'bg-slate-100 text-slate-600'}`}>
      {role}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminAccounts() {
  const { auth } = useAuth()
  const { chapterName } = useChapters()
  const isAdmin = auth?.role === 'Admin'
  const isChapterAdmin = auth?.role === 'Chapter Admin'

  // ── Account list ────────────────────────────────────────────────────────────
  const [accounts, setAccounts] = useState<AccountSummary[]>([])
  const [listError, setListError] = useState<string | null>(null)

  // Stable ref so handlers can trigger a reload without re-running the effect
  const reloadRef = useRef<() => void>(() => {})

  useEffect(() => {
    let cancelled = false
    async function fetch() {
      try {
        const data = await getAccounts()
        if (!cancelled) { setAccounts(data); setListError(null) }
      } catch (e) {
        if (!cancelled) setListError(e instanceof Error ? e.message : 'Failed to load accounts')
      }
    }
    reloadRef.current = fetch
    fetch()
    return () => { cancelled = true }
  }, [])

  const loadAccounts = useCallback(() => reloadRef.current(), [])

  // ── Create form ─────────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName]         = useState('')
  const [formUsername, setFormUsername] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formAffiliations, setFormAffiliations] = useState([{ chapter: '', role: '' }])
  const [formError, setFormError]   = useState<string | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Roles the current user may assign
  const assignableRoles = isAdmin
    ? ['Chapter Admin', 'Editor', 'Viewer']
    : ['Editor', 'Viewer']

  // Chapters the current user may create accounts for:
  // - Admins: all chapters
  // - Chapter Admins: only chapters where they specifically hold the Chapter Admin role
  const allChapters = useVisibleChapters()
  const { chapters: allChaptersIncludingNational } = useChapters()
  const assignableChapters = isAdmin
    ? allChaptersIncludingNational
    : allChapters.filter(c =>
        (auth?.chapterRoles ?? []).some(cr => cr.chapterId === c.id && cr.role === 'Chapter Admin')
      )

  function setAffiliation(index: number, field: 'chapter' | 'role', value: string) {
    setFormAffiliations(prev => prev.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  function addAffiliationRow() {
    setFormAffiliations(prev => [...prev, { chapter: '', role: '' }])
  }

  function removeAffiliationRow(index: number) {
    setFormAffiliations(prev => prev.filter((_, i) => i !== index))
  }

  function resetForm() {
    setFormName(''); setFormUsername(''); setFormPassword('')
    setFormAffiliations([{ chapter: '', role: '' }]); setFormError(null)
    setShowForm(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    for (const a of formAffiliations) {
      if (!a.chapter || !a.role) { setFormError('Each affiliation needs a chapter and role'); return }
    }

    setFormLoading(true)
    try {
      const first = formAffiliations[0]
      const created = await createAccount({
        name: formName, username: formUsername,
        password: formPassword, chapterId: Number(first.chapter), role: first.role,
      })
      for (const a of formAffiliations.slice(1)) {
        await addAccountRole(created.id, Number(a.chapter), a.role)
      }
      await loadAccounts()
      resetForm()
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Failed to create account')
    } finally {
      setFormLoading(false)
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function handleDelete(id: number) {
    if (!confirm('Delete this account? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await deleteAccount(id)
      await loadAccounts()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to delete account')
    } finally {
      setDeletingId(null)
    }
  }

  // ── Add role ────────────────────────────────────────────────────────────────
  const [addRoleFor, setAddRoleFor] = useState<number | null>(null)
  const [addRoleChapter, setAddRoleChapter] = useState('')
  const [addRoleRole, setAddRoleRole] = useState('')
  const [addRoleError, setAddRoleError] = useState<string | null>(null)
  const [addRoleLoading, setAddRoleLoading] = useState(false)

  function openAddRole(id: number) {
    setAddRoleFor(id); setAddRoleChapter(''); setAddRoleRole(''); setAddRoleError(null)
  }

  async function handleAddRole(e: React.FormEvent) {
    e.preventDefault()
    if (!addRoleFor || !addRoleChapter || !addRoleRole) return
    setAddRoleLoading(true); setAddRoleError(null)
    try {
      await addAccountRole(addRoleFor, Number(addRoleChapter), addRoleRole)
      await loadAccounts()
      setAddRoleFor(null)
    } catch (e) {
      setAddRoleError(e instanceof Error ? e.message : 'Failed to add role')
    } finally {
      setAddRoleLoading(false)
    }
  }

  // ── Edit role (update existing affiliation) ─────────────────────────────────
  const [editRoleFor, setEditRoleFor] = useState<{ accountId: number; chapterId: number } | null>(null)
  const [editRoleValue, setEditRoleValue] = useState('')
  const [editRoleError, setEditRoleError] = useState<string | null>(null)
  const [editRoleLoading, setEditRoleLoading] = useState(false)

  function openEditRole(accountId: number, chapterId: number, currentRole: string) {
    setEditRoleFor({ accountId, chapterId })
    setEditRoleValue(currentRole)
    setEditRoleError(null)
    setAddRoleFor(null)
  }

  async function handleEditRole(e: React.FormEvent) {
    e.preventDefault()
    if (!editRoleFor || !editRoleValue) return
    setEditRoleLoading(true); setEditRoleError(null)
    try {
      await updateAccountRole(editRoleFor.accountId, editRoleFor.chapterId, editRoleValue)
      await loadAccounts()
      setEditRoleFor(null)
    } catch (e) {
      setEditRoleError(e instanceof Error ? e.message : 'Failed to update role')
    } finally {
      setEditRoleLoading(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-end justify-between">
        <PageHeading
          title="Manage Accounts"
          subtitle={isAdmin ? 'All volunteer accounts' : 'Accounts in your chapter'}
        />
        {(isAdmin || isChapterAdmin) && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 text-sm font-medium text-white bg-heart-blue hover:opacity-90 px-4 py-2 rounded-lg transition-opacity"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
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
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Full name</label>
              <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
                className={inputCls} required autoFocus />
            </div>
            <div>
              <label className={labelCls}>Username</label>
              <input type="text" autoComplete="off" value={formUsername}
                onChange={e => setFormUsername(e.target.value)} className={inputCls} required />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Password</label>
              <input type="password" autoComplete="new-password" value={formPassword}
                onChange={e => setFormPassword(e.target.value)} className={inputCls} required />
            </div>

            {/* Affiliations */}
            <div className="col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className={labelCls}>Chapter Access</span>
                <button type="button" onClick={addAffiliationRow}
                  className="flex items-center gap-1 text-xs font-semibold text-heart-blue hover:opacity-80 transition-opacity">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add role
                </button>
              </div>
              {formAffiliations.map((a, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <select value={a.chapter} onChange={e => setAffiliation(i, 'chapter', e.target.value)}
                    className={`${inputCls} flex-1`} required>
                    <option value="">Chapter…</option>
                    {assignableChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <select value={a.role} onChange={e => setAffiliation(i, 'role', e.target.value)}
                    className={`${inputCls} flex-1`} required>
                    <option value="">Role…</option>
                    {assignableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {formAffiliations.length > 1 && (
                    <button type="button" onClick={() => removeAffiliationRow(i)}
                      className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                      title="Remove">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {formError && (
              <p className="col-span-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}

            <div className="col-span-2 flex justify-end gap-2">
              <button type="button" onClick={resetForm}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={formLoading}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-heart-blue hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
                {formLoading ? 'Creating…' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Account list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {listError && (
          <p className="text-sm text-red-600 px-6 py-4">{listError}</p>
        )}
        {accounts.length === 0 && !listError ? (
          <p className="text-sm text-slate-400 px-6 py-8 text-center">No accounts found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="text-left px-6 py-3">Username</th>
                <th className="text-left px-6 py-3">Name</th>
                <th className="text-left px-6 py-3">Chapter Access</th>
                {(isAdmin || isChapterAdmin) && <th className="px-6 py-3" />}
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <>
                  <tr key={account.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-900">{account.username}</td>
                    <td className="px-6 py-3 text-slate-600">{account.name}</td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-2">
                        {account.chapterRoles.map(cr => {
                          const isEditing = editRoleFor?.accountId === account.id && editRoleFor.chapterId === cr.chapterId
                          return (
                            <span key={cr.chapterId} className="inline-flex items-center gap-1 text-xs text-slate-600 group">
                              <span className="text-slate-400">{chapterName(cr.chapterId)}</span>
                              {isEditing ? (
                                <form onSubmit={handleEditRole} className="inline-flex items-center gap-1">
                                  <select value={editRoleValue} onChange={e => setEditRoleValue(e.target.value)}
                                    className="text-xs border border-heart-blue rounded px-1 py-0.5 outline-none bg-white" autoFocus>
                                    {assignableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                                  </select>
                                  <button type="submit" disabled={editRoleLoading}
                                    className="text-green-600 hover:text-green-700 disabled:opacity-50">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                  </button>
                                  <button type="button" onClick={() => setEditRoleFor(null)}
                                    className="text-slate-400 hover:text-slate-600">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                  </button>
                                  {editRoleError && <span className="text-red-500 text-[10px]">{editRoleError}</span>}
                                </form>
                              ) : (
                                <span className="inline-flex items-center gap-0.5">
                                  <RoleBadge role={cr.role} />
                                  {(isAdmin || isChapterAdmin) && (
                                    <button type="button"
                                      onClick={() => openEditRole(account.id, cr.chapterId, cr.role)}
                                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-heart-blue transition-opacity ml-0.5"
                                      title="Edit role">
                                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                      </svg>
                                    </button>
                                  )}
                                </span>
                              )}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    {(isAdmin || isChapterAdmin) && (
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isAdmin && (
                            <button
                              onClick={() => addRoleFor === account.id ? setAddRoleFor(null) : openAddRole(account.id)}
                              className="text-slate-400 hover:text-heart-blue transition-colors"
                              title="Add chapter/role"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                              </svg>
                            </button>
                          )}
                          {account.id !== (auth as { id?: number })?.id && (
                            <button
                              onClick={() => handleDelete(account.id)}
                              disabled={deletingId === account.id}
                              className="text-slate-400 hover:text-red-500 disabled:opacity-40 transition-colors"
                              title="Delete account"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                  {addRoleFor === account.id && (
                    <tr key={`${account.id}-addrole`} className="bg-slate-50 border-b border-slate-100">
                      <td colSpan={isAdmin ? 4 : 3} className="px-6 py-3">
                        <form onSubmit={handleAddRole} className="flex items-end gap-3">
                          <div>
                            <label className={labelCls}>Chapter</label>
                            <select value={addRoleChapter} onChange={e => setAddRoleChapter(e.target.value)}
                              className={`${inputCls} w-44`} required>
                              <option value="">Select…</option>
                              {assignableChapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelCls}>Role</label>
                            <select value={addRoleRole} onChange={e => setAddRoleRole(e.target.value)}
                              className={`${inputCls} w-40`} required>
                              <option value="">Select…</option>
                              {assignableRoles.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </div>
                          {addRoleError && (
                            <p className="text-xs text-red-600 self-center">{addRoleError}</p>
                          )}
                          <div className="flex gap-2 self-end">
                            <button type="button" onClick={() => setAddRoleFor(null)}
                              className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                              Cancel
                            </button>
                            <button type="submit" disabled={addRoleLoading}
                              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-heart-blue hover:opacity-90 disabled:opacity-50 transition-opacity">
                              {addRoleLoading ? 'Saving…' : 'Add'}
                            </button>
                          </div>
                        </form>
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
  )
}
