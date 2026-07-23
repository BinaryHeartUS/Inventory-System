import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Tool, PartySummary } from "../types/inventory";
import { getTool, updateTool, deleteTool, getToolChangelog } from "../services/toolService";
import { useChapters, useVisibleChapters, useWritableChapters } from "../context/ChapterContext";
import { useToast } from "../context/ToastContext";
import { canPrintLabels } from "../utils/canPrintLabels";
import { useLinkedParty } from "../hooks/useLinkedParty";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { NotFound } from "../components/NotFound";
import type { ToolChangelogEntry } from "../types/changelog";
import ToolDetailView from "../components/toolDetail/ToolDetailView";

export interface ToolDetailContainerProps {
  id: string | undefined;
}

/**
 * ToolDetailContainer — loads a single tool + its changelog, owns the edit form
 * and dirty detection, and wires save/delete/print/donor actions.
 */
export default function ToolDetailContainer({ id }: ToolDetailContainerProps) {
  const numId = Number(id);
  const navigate = useNavigate();

  const { chapterName } = useChapters();
  const visibleChapters = useVisibleChapters();
  const writableChapters = useWritableChapters();

  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Tool | null>(null);
  const [saved, setSaved] = useState(false);
  const [printId, setPrintId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToast();
  const [linkedParty] = useLinkedParty(tool?.donorId);
  const [editParty, setEditParty] = useState<PartySummary | null>(null);
  const [partyPickerOpen, setPartyPickerOpen] = useState(false);
  const [changelog, setChangelog] = useState<ToolChangelogEntry[]>([]);

  useEffect(() => {
    getTool(numId)
      .then((t) => {
        setTool(t);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [numId]);

  useEffect(() => {
    getToolChangelog(numId)
      .then(setChangelog)
      .catch(() => setChangelog([]));
  }, [numId]);

  if (loading) return <LoadingSpinner />;

  if (!tool) {
    return <NotFound entity="Tool" id={id} backTo="/tools" backLabel="Back to Tools" />;
  }

  function startEdit() {
    setForm({ ...tool } as Tool);
    setEditParty(linkedParty);
    setEditing(true);
  }
  function cancelEdit() {
    setEditing(false);
    setEditParty(null);
  }
  async function saveEdit() {
    if (!form) return;
    try {
      const updated = await updateTool(numId, form);
      setTool(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      getToolChangelog(numId)
        .then(setChangelog)
        .catch(() => {});
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Save failed", false);
    }
  }
  async function handleDelete() {
    try {
      await deleteTool(numId);
      navigate("/tools");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Delete failed", false);
      setShowDeleteConfirm(false);
    }
  }
  function handleFieldChange(key: keyof Tool, value: string | number | null) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
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

  const canDelete = writableChapters.some((c) => c.id === tool.chapterId);

  const isDirty =
    editing &&
    !!form &&
    (JSON.stringify(form) !== JSON.stringify(tool) ||
      (editParty?.id ?? null) !== (linkedParty?.id ?? null));

  return (
    <ToolDetailView
      tool={tool}
      editing={editing}
      form={form}
      saved={saved}
      isDirty={isDirty}
      canDelete={canDelete}
      canPrint={canPrintLabels()}
      printId={printId}
      showDeleteConfirm={showDeleteConfirm}
      editParty={editParty}
      partyPickerOpen={partyPickerOpen}
      linkedParty={linkedParty}
      changelog={changelog}
      chapterName={chapterName}
      visibleChapters={visibleChapters}
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
    />
  );
}
