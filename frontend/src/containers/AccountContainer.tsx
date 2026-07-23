import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useChapters } from "../context/ChapterContext";
import { getStoredToken } from "../services/authService";
import { updatePassword } from "../services/accountService";
import AccountView from "../components/account/AccountView";

/**
 * AccountContainer — owns password-change persistence, session logout, and the
 * resolution of the current user's chapter roles to display names.
 */
export default function AccountContainer() {
  const { auth, logout } = useAuth();
  const { chapterName } = useChapters();
  const navigate = useNavigate();

  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  async function handleChangePassword(
    current: string,
    next: string,
    confirm: string
  ): Promise<boolean> {
    setPwError(null);
    setPwSuccess(false);

    if (next !== confirm) {
      setPwError("New passwords do not match");
      return false;
    }
    if (next.length < 8) {
      setPwError("New password must be at least 8 characters");
      return false;
    }

    setPwLoading(true);
    try {
      const token = getStoredToken();
      if (!token) throw new Error("Not authenticated");
      const volunteerId = Number(JSON.parse(atob(token.split(".")[1])).sub);
      await updatePassword(volunteerId, current, next);
      setPwSuccess(true);
      return true;
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to update password");
      return false;
    } finally {
      setPwLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const roles = (auth?.chapterRoles ?? []).map((cr) => ({
    chapterId: cr.chapterId,
    chapterName: chapterName(cr.chapterId),
    role: cr.role,
  }));

  return (
    <AccountView
      username={auth?.username}
      roles={roles}
      pwError={pwError}
      pwSuccess={pwSuccess}
      pwLoading={pwLoading}
      onChangePassword={handleChangePassword}
      onLogout={handleLogout}
    />
  );
}
