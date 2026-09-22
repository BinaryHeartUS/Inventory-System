import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import type { Misc, PartySummary } from "../types/inventory";
import type { MiscChangelogEntry } from "../types/changelog";
import { deleteMisc, getMisc, getMiscChangelog, updateMisc } from "../services/miscService";
import { useLinkedParty } from "../hooks/useLinkedParty";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { canManageAccounts, WRITE_ROLES } from "../utils/roles";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { NotFound } from "../components/NotFound";
import MiscDetailView from "../components/misc/MiscDetailView";

export default function MiscDetailContainer({ id }: { id: string | undefined }) {
  const numId = Number(id);
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { showToast } = useToast();
  const [asset, setAsset] = useState<Misc | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Misc | null>(null);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [partyPickerOpen, setPartyPickerOpen] = useState(false);
  const [editParty, setEditParty] = useState<PartySummary | null>(null);
  const [changelog, setChangelog] = useState<MiscChangelogEntry[]>([]);
  const [linkedParty] = useLinkedParty(asset?.donorId);

  useEffect(() => {
    getMisc(numId)
      .then((result) => {
        setAsset(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    getMiscChangelog(numId)
      .then(setChangelog)
      .catch(() => setChangelog([]));
  }, [numId]);

  if (loading) return <LoadingSpinner />;
  if (!asset)
    return <NotFound entity="Misc asset" id={id} backTo="/search" backLabel="Back to Search" />;

  const canEdit = auth?.chapterRoles.some((role) => WRITE_ROLES.has(role.role)) ?? false;
  const canDelete = canManageAccounts(auth?.role);

  function startEdit() {
    setForm({ ...asset! });
    setEditParty(linkedParty);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setEditParty(null);
  }

  async function saveEdit() {
    if (!form || !editParty || !form.description.trim() || form.value == null || form.value < 0) {
      showToast("Description, value, and donor are required", false);
      return;
    }
    try {
      const updated = await updateMisc(numId, {
        ...form,
        description: form.description.trim(),
        donorId: editParty.id,
      });
      setAsset(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      getMiscChangelog(numId)
        .then(setChangelog)
        .catch(() => {});
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Save failed", false);
    }
  }

  async function handleDelete() {
    try {
      await deleteMisc(numId);
      navigate(`/admin/parties/${asset!.donorId}`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Delete failed", false);
      setShowDeleteConfirm(false);
    }
  }

  function handleFieldChange(key: keyof Misc, value: string | number | null) {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  }

  function handleSelectParty(party: PartySummary) {
    setEditParty(party);
    setForm((current) => (current ? { ...current, donorId: party.id } : current));
    setPartyPickerOpen(false);
  }

  const isDirty =
    editing &&
    !!form &&
    (JSON.stringify(form) !== JSON.stringify(asset) || editParty?.id !== linkedParty?.id);

  return (
    <MiscDetailView
      asset={asset}
      editing={editing}
      form={form}
      saved={saved}
      isDirty={isDirty}
      canEdit={canEdit}
      canDelete={canDelete}
      linkedParty={linkedParty}
      editParty={editParty}
      partyPickerOpen={partyPickerOpen}
      showDeleteConfirm={showDeleteConfirm}
      changelog={changelog}
      onStartEdit={startEdit}
      onCancelEdit={cancelEdit}
      onSaveEdit={saveEdit}
      onDelete={handleDelete}
      onFieldChange={handleFieldChange}
      onOpenPartyPicker={() => setPartyPickerOpen(true)}
      onSelectParty={handleSelectParty}
      onCancelPartyPicker={() => setPartyPickerOpen(false)}
      onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
      onCancelDelete={() => setShowDeleteConfirm(false)}
    />
  );
}
