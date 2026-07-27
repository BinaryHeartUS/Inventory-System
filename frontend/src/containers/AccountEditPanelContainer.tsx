import type { AccountSummary } from "../types/inventory";
import {
  addAccountRole,
  deleteAccount,
  removeAccountRole,
  updateAccountRole,
} from "../services/accountService";
import { AccountEditPanel } from "../components/account/AccountEditPanel";

export function AccountEditPanelContainer({
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
  async function handleSaveRole(chapterId: number, role: string) {
    await updateAccountRole(account.id, chapterId, role);
    onClose();
    onDeleted(); // reload
  }

  async function handleRemoveRole(chapterId: number) {
    await removeAccountRole(account.id, chapterId);
    onClose();
    onDeleted();
  }

  async function handleAddRole(chapterId: number, role: string) {
    await addAccountRole(account.id, chapterId, role);
    onClose();
    onDeleted();
  }

  async function handleDeleteAccount() {
    if (!confirm(`Delete account "${account.username}"? This cannot be undone.`)) return false;
    await deleteAccount(account.id);
    onDeleted();
    return true;
  }

  return (
    <AccountEditPanel
      account={account}
      assignableRoles={assignableRoles}
      assignableChapters={assignableChapters}
      nationalChapterId={nationalChapterId}
      currentUserId={currentUserId}
      onClose={onClose}
      chapterName={chapterName}
      onSaveRole={handleSaveRole}
      onRemoveRole={handleRemoveRole}
      onAddRole={handleAddRole}
      onDeleteAccount={handleDeleteAccount}
    />
  );
}
