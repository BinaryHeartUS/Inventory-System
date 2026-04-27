import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChapters } from '../context/ChapterContext'
import PageHeading from '../components/PageHeading'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls =
  'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none ' +
  'focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white'
const labelCls = 'text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Account() {
  const { auth, logout } = useAuth()
  const { chapterName } = useChapters()
  const navigate = useNavigate()

  // ── Change password form ───────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError,   setPwError]   = useState<string | null>(null)
  const [pwSuccess, setPwSuccess] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError(null)
    setPwSuccess(false)

    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      setPwError('New password must be at least 8 characters')
      return
    }

    setPwLoading(true)
    try {
      // TODO: wire to PUT /api/auth/password when backend endpoint is ready
      await new Promise(r => setTimeout(r, 400)) // simulate request
      setPwSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setPwLoading(false)
    }
  }

  // ── Logout ─────────────────────────────────────────────────────────────────
  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="space-y-6 max-w-xl">

      <PageHeading title="Account" subtitle="Your profile and security settings" />

      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Profile</p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <circle cx="12" cy="8" r="4"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">{auth?.username}</p>
            <div className="mt-1 space-y-0.5">
              {(auth?.chapterRoles ?? []).length === 0
                ? <p className="text-xs text-slate-400">No chapter access</p>
                : (auth?.chapterRoles ?? []).map(cr => (
                    <p key={cr.chapterId} className="text-xs text-slate-500">
                      {chapterName(cr.chapterId)}
                      <span className="ml-1.5 text-slate-400">·</span>
                      <span className="ml-1.5 text-slate-400">{cr.role}</span>
                    </p>
                  ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* Change password card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Change Password
        </p>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className={labelCls}>Current password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>New password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Confirm new password</label>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={inputCls}
              required
            />
          </div>

          {pwError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {pwError}
            </p>
          )}
          {pwSuccess && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              Password updated successfully
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pwLoading}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-heart-blue hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              {pwLoading ? 'Saving…' : 'Update password'}
            </button>
          </div>
        </form>
      </div>

      {/* Sign out card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
          Session
        </p>
        <p className="text-xs text-slate-400 mb-4">
          Signing out clears your session. You will need to log in again to access the inventory.
        </p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </div>

    </div>
  )
}
