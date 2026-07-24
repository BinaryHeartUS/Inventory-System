import { useState } from "react";
import PageHeading from "../PageHeading";

const inputCls =
  "w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none " +
  "focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white";
const labelCls = "text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block";

export interface AccountRole {
  chapterId: number;
  chapterName: string;
  role: string;
}

export interface AccountViewProps {
  username?: string;
  roles: AccountRole[];
  pwError: string | null;
  pwSuccess: boolean;
  pwLoading: boolean;
  onChangePassword: (current: string, next: string, confirm: string) => Promise<boolean>;
  onLogout: () => void;
}

export default function AccountView({
  username,
  roles,
  pwError,
  pwSuccess,
  pwLoading,
  onChangePassword,
  onLogout,
}: AccountViewProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const ok = await onChangePassword(currentPassword, newPassword, confirmPassword);
    if (ok) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <PageHeading title="Account" subtitle="Your profile and security settings" />

      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Profile</p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-400"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">{username}</p>
            <div className="mt-1 space-y-0.5">
              {roles.length === 0 ? (
                <p className="text-xs text-slate-400">No chapter access</p>
              ) : (
                roles.map((cr) => (
                  <p key={cr.chapterId} className="text-xs text-slate-500">
                    {cr.chapterName}
                    <span className="ml-1.5 text-slate-400">·</span>
                    <span className="ml-1.5 text-slate-400">{cr.role}</span>
                  </p>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change password card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Change Password
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Current password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
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
              onChange={(e) => setNewPassword(e.target.value)}
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
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {pwLoading ? "Saving…" : "Update password"}
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
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </div>
  );
}
