import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { AnyDevice, Part, PartySummary } from "../types/inventory";
import { getPart, updatePart, deletePart, getPartChangelog } from "../services/partService";
import { getDevice } from "../services/deviceService";
import { useLookups } from "../hooks/useLookups";
import { canPrintLabels } from "../utils/canPrintLabels";
import { useChapters, useWritableChapters } from "../context/ChapterContext";
import { useToast } from "../context/ToastContext";
import { useLinkedParty } from "../hooks/useLinkedParty";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { NotFound } from "../components/NotFound";
import type { PartChangelogEntry } from "../types/changelog";
import PartDetailView from "../components/partDetail/PartDetailView";

export interface PartDetailContainerProps {
  id: string | undefined;
}

/**
 * PartDetailContainer — loads a single part, its linked device and changelog,
 * owns the edit form + dirty detection, and wires save/delete/print/device/
 * donor actions.
 */
export default function PartDetailContainer({ id }: PartDetailContainerProps) {
  const numId = Number(id);
  const navigate = useNavigate();

  const lookups = useLookups();
  const { chapters, chapterName } = useChapters();
  const writableChapters = useWritableChapters();
  const { showToast } = useToast();

  const [part, setPart] = useState<Part | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Part | null>(null);
  const [saved, setSaved] = useState(false);
  const [printId, setPrintId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Device linked to this part (for view mode display)
  const [linkedDevice, setLinkedDevice] = useState<AnyDevice | null>(null);
  // Device selected while editing
  const [editDevice, setEditDevice] = useState<AnyDevice | null>(null);
  const [devicePickerOpen, setDevicePickerOpen] = useState(false);
  const [linkedParty] = useLinkedParty(part?.donorId);
  const [editParty, setEditParty] = useState<PartySummary | null>(null);
  const [partyPickerOpen, setPartyPickerOpen] = useState(false);
  const [changelog, setChangelog] = useState<PartChangelogEntry[]>([]);

  useEffect(() => {
    getPart(numId)
      .then((p) => {
        setPart(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [numId]);

  // Fetch linked device info whenever the saved part's containedIn changes
  useEffect(() => {
    if (part?.containedIn != null) {
      getDevice(part.containedIn).then(setLinkedDevice);
    } else {
      Promise.resolve().then(() => setLinkedDevice(null));
    }
  }, [part?.containedIn]);

  useEffect(() => {
    getPartChangelog(numId)
      .then(setChangelog)
      .catch(() => setChangelog([]));
  }, [numId]);

  if (loading) return <LoadingSpinner />;

  if (!part) {
    return <NotFound entity="Part" id={id} backTo="/parts" backLabel="Back to Parts" />;
  }

  function startEdit() {
    setForm({ ...part } as Part);
    setEditDevice(linkedDevice);
    setEditParty(linkedParty);
    setEditing(true);
  }
  function cancelEdit() {
    setEditing(false);
    setEditDevice(null);
    setEditParty(null);
  }
  async function saveEdit() {
    if (!form) return;
    try {
      const updated = await updatePart(numId, form);
      setPart(updated);
      setEditing(false);
      setEditDevice(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      getPartChangelog(numId)
        .then(setChangelog)
        .catch(() => {});
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", false);
    }
  }
  async function handleDelete() {
    try {
      await deletePart(numId);
      navigate("/parts");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", false);
      setShowDeleteConfirm(false);
    }
  }
  function handleFieldChange(key: keyof Part, value: string | number | boolean | null) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }
  function handleSelectDevice(device: AnyDevice) {
    setEditDevice(device);
    setForm((prev) => (prev ? { ...prev, containedIn: device.id } : prev));
    setDevicePickerOpen(false);
  }
  function handleRemoveDevice() {
    setEditDevice(null);
    setForm((prev) => (prev ? { ...prev, containedIn: null } : prev));
  }
  function handleSelectParty(party: PartySummary) {
    setEditParty(party);
    setForm((prev) => (prev ? { ...prev, donorId: party.id } : prev));
    setPartyPickerOpen(false);
  }
  function handleRemoveDonor() {
    setEditParty(null);
    setForm((prev) => (prev ? { ...prev, donorId: null } : prev));
  }

  const canDelete = writableChapters.some((c) => c.id === part.chapterId);
  const deleteBlocked = part.containedIn != null;

  const isDirty =
    editing &&
    !!form &&
    (JSON.stringify(form) !== JSON.stringify(part) ||
      (editDevice?.id ?? null) !== (linkedDevice?.id ?? null) ||
      (editParty?.id ?? null) !== (linkedParty?.id ?? null));

  return (
    <PartDetailView
      part={part}
      editing={editing}
      form={form}
      saved={saved}
      isDirty={isDirty}
      canDelete={canDelete}
      deleteBlocked={deleteBlocked}
      canPrint={canPrintLabels()}
      printId={printId}
      showDeleteConfirm={showDeleteConfirm}
      linkedDevice={linkedDevice}
      editDevice={editDevice}
      devicePickerOpen={devicePickerOpen}
      linkedParty={linkedParty}
      editParty={editParty}
      partyPickerOpen={partyPickerOpen}
      changelog={changelog}
      chapterName={chapterName}
      chapters={chapters}
      partTypes={lookups.partTypes}
      onStartEdit={startEdit}
      onCancelEdit={cancelEdit}
      onSaveEdit={saveEdit}
      onDelete={handleDelete}
      onFieldChange={handleFieldChange}
      onOpenPrint={setPrintId}
      onClosePrint={() => setPrintId(null)}
      onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
      onCancelDelete={() => setShowDeleteConfirm(false)}
      onOpenPartyPicker={() => setPartyPickerOpen(true)}
      onSelectParty={handleSelectParty}
      onCancelPartyPicker={() => setPartyPickerOpen(false)}
      onRemoveDonor={handleRemoveDonor}
      onOpenDevicePicker={() => setDevicePickerOpen(true)}
      onSelectDevice={handleSelectDevice}
      onCancelDevicePicker={() => setDevicePickerOpen(false)}
      onRemoveDevice={handleRemoveDevice}
      onNavigateToDevice={(deviceId) => navigate(`/devices/${deviceId}`)}
    />
  );
}
