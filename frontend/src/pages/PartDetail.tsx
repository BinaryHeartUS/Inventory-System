import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { AnyDevice, Part } from "../types/inventory";
import NotesPane from "../components/NotesPane";
import { getPart, updatePart, deletePart, getPartChangelog } from "../services/partService";
import { getDevice } from "../services/deviceService";
import { useLookups } from "../hooks/useLookups";
import { PrintLabelModal } from "../components/PrintLabelModal";
import { canPrintLabels } from "../utils/canPrintLabels";
import { useChapters, useWritableChapters } from "../context/ChapterContext";
import { useToast } from "../context/ToastContext";
import { DevicePickerModal } from "../components/DevicePickerModal";
import { PartyPickerModal } from "../components/PartyPickerModal";
import type { PartySummary } from "../types/inventory";
import { getParty } from "../services/partyService";
import { Field } from "../components/Field";
import { EditText, EditSelect, EditCombo } from "../components/EditField";
import { Section } from "../components/Section";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Breadcrumb } from "../components/Breadcrumb";
import AddAssetButton from "../components/AddAssetButton";
import { DeleteConfirmButton } from "../components/DeleteConfirmButton";
import { formatDate } from "../utils/dateUtils";
import { labelCls, inputCls } from "../utils/formStyles";
import { ModificationLog } from "../components/ModificationLog";
import { PartModificationModal } from "../components/PartModificationModal";
import UnsavedChangesGuard from "../components/UnsavedChangesGuard";
import type { PartChangelogEntry } from "../types/changelog";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PartDetail() {
  const { id } = useParams<{ id: string }>();
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
  const [linkedParty, setLinkedParty] = useState<PartySummary | null>(null);
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

  // Fetch donor info whenever the saved part's donorId changes
  useEffect(() => {
    if (part?.donorId != null) {
      getParty(part.donorId)
        .then(setLinkedParty)
        .catch(() => setLinkedParty(null));
    } else {
      Promise.resolve().then(() => setLinkedParty(null));
    }
  }, [part?.donorId]);

  useEffect(() => {
    getPartChangelog(numId)
      .then(setChangelog)
      .catch(() => setChangelog([]));
  }, [numId]);

  if (loading) return <LoadingSpinner />;

  if (!part) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
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
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">Part not found</p>
          <p className="text-xs text-slate-400 mt-1">
            No part with ID <span className="font-mono">{id}</span> exists in inventory.
          </p>
        </div>
        <Link
          to="/parts"
          className="mt-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
        >
          ← Back to Parts
        </Link>
      </div>
    );
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
  function set(key: keyof Part) {
    return (value: string | number | boolean | null) =>
      setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  const canDelete = writableChapters.some((c) => c.id === part.chapterId);
  const deleteBlocked = part.containedIn != null;

  const p = editing && form ? form : part;

  const isDirty =
    editing &&
    !!form &&
    (JSON.stringify(form) !== JSON.stringify(part) ||
      (editDevice?.id ?? null) !== (linkedDevice?.id ?? null) ||
      (editParty?.id ?? null) !== (linkedParty?.id ?? null));

  return (
    <>
      <UnsavedChangesGuard when={isDirty} />
      {printId !== null && <PrintLabelModal assetId={printId} onClose={() => setPrintId(null)} />}
      {partyPickerOpen && (
        <PartyPickerModal
          onSelect={(party) => {
            setEditParty(party);
            setForm((prev) => (prev ? { ...prev, donorId: party.id } : prev));
            setPartyPickerOpen(false);
          }}
          onCancel={() => setPartyPickerOpen(false)}
        />
      )}
      {devicePickerOpen && (
        <DevicePickerModal
          onSelect={(device) => {
            setEditDevice(device);
            setForm((prev) => (prev ? { ...prev, containedIn: device.id } : prev));
            setDevicePickerOpen(false);
          }}
          onCancel={() => setDevicePickerOpen(false)}
        />
      )}
      <div className="space-y-5">
        {/* Breadcrumb + Add Asset */}
        <div className="flex items-center justify-between">
          <Breadcrumb backHref="/parts" backLabel="Parts" current={part.type} />
          <AddAssetButton />
        </div>

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-500 uppercase tracking-wide">
                  Part
                </span>
                <span className="font-mono text-xs text-slate-400">#{p.id}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{p.type}</h1>
              <p className="text-sm text-slate-400 mt-1">
                {chapterName(p.chapterId)} · {p.wasPurchased ? "Purchased" : "Donated"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
              {!editing && canPrintLabels() && (
                <button
                  onClick={() => setPrintId(p.id)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-lg transition-colors"
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
                    <path d="M6 9V2h12v7" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  Print Label
                </button>
              )}
              {!editing && canDelete && (
                <DeleteConfirmButton
                  noun="part"
                  showing={showDeleteConfirm}
                  onShowConfirm={() => setShowDeleteConfirm(true)}
                  onConfirm={handleDelete}
                  onCancel={() => setShowDeleteConfirm(false)}
                  disabled={deleteBlocked}
                  disabledTitle={
                    deleteBlocked ? "Unlink this part from its device before deleting" : undefined
                  }
                />
              )}
              {!editing ? (
                <button
                  onClick={startEdit}
                  className="flex items-center gap-2 text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue-dark px-4 py-2.5 rounded-lg transition-colors"
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
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={cancelEdit}
                    className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="text-sm font-medium text-white bg-brand-red hover:bg-brand-red-dark px-4 py-2.5 rounded-lg transition-colors"
                  >
                    Save changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Two-column body */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="flex-[3] min-w-0 space-y-5">
            <Section title="Details">
              {editing && form ? (
                <>
                  <EditCombo
                    label="Part Type"
                    value={form.type}
                    options={lookups.partTypes}
                    onChange={(v) => set("type")(v ?? "")}
                    placeholder="e.g. Display"
                    maxLength={50}
                  />
                  <div>
                    <label className={labelCls}>Chapter</label>
                    <select
                      value={form.chapterId}
                      onChange={(e) => set("chapterId")(Number(e.target.value))}
                      className={`${inputCls} cursor-pointer`}
                    >
                      {chapters
                        .filter((c) => c.name !== "National")
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <EditSelect
                    label="Source"
                    value={form.wasPurchased ? "Purchased" : "Donated"}
                    options={["Donated", "Purchased"]}
                    onChange={(v) => set("wasPurchased")(v === "Purchased")}
                  />
                  <EditText
                    label="Description"
                    value={form.description}
                    onChange={set("description")}
                    placeholder="e.g. DDR4 8GB stick"
                    maxLength={500}
                  />
                  <div>
                    <label className={labelCls}>Contained In</label>
                    {editDevice ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="font-mono text-xs text-slate-400">#{editDevice.id}</span>
                        <span className="text-sm text-slate-800">
                          {editDevice.manufacturer} {editDevice.model}
                        </span>
                        <span className="text-slate-300 text-xs">· {editDevice.year}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditDevice(null);
                            set("containedIn")(null);
                          }}
                          className="ml-auto text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                          title="Remove device link"
                        >
                          <svg
                            width="12"
                            height="12"
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
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDevicePickerOpen(true)}
                        className="flex items-center gap-2 w-full text-sm text-slate-500 border border-slate-200 border-dashed rounded-lg px-3 py-2 hover:border-heart-blue hover:text-heart-blue hover:bg-heart-blue/5 transition-all"
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
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        Select device (optional)
                      </button>
                    )}
                  </div>
                  <EditText
                    label="Value ($)"
                    type="number"
                    value={String(form.value ?? "")}
                    onChange={(v) => set("value")(v ? Number(v) : null)}
                    placeholder="e.g. 39.99"
                  />
                  <div>
                    <label className={labelCls}>Acquisition Date</label>
                    <input
                      type="date"
                      value={form.acquisitionDate ?? ""}
                      onChange={(e) => set("acquisitionDate")(e.target.value || null)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Donor</label>
                    {editParty ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-sm text-slate-800">{editParty.name}</span>
                        <span className="text-xs text-slate-400">· {editParty.type}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditParty(null);
                            setForm((prev) => (prev ? { ...prev, donorId: null } : prev));
                          }}
                          className="ml-auto text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                          title="Remove donor"
                        >
                          <svg
                            width="12"
                            height="12"
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
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPartyPickerOpen(true)}
                        className="flex items-center gap-2 w-full text-sm text-slate-500 border border-slate-200 border-dashed rounded-lg px-3 py-2 hover:border-heart-blue hover:text-heart-blue hover:bg-heart-blue/5 transition-all"
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
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        Select donor (optional)
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Field label="Part Type" value={p.type} />
                  <Field label="Chapter" value={chapterName(p.chapterId)} />
                  <Field label="Source" value={p.wasPurchased ? "Purchased" : "Donated"} />
                  <Field label="Description" value={p.description} />
                  <Field
                    label="Contained In"
                    value={
                      p.containedIn != null ? (
                        linkedDevice ? (
                          <button
                            onClick={() => navigate(`/devices/${p.containedIn}`)}
                            className="text-heart-blue hover:underline text-sm text-left"
                          >
                            {linkedDevice.manufacturer} {linkedDevice.model}
                            <span className="font-mono text-xs text-slate-400 ml-1">
                              · #{p.containedIn}
                            </span>
                          </button>
                        ) : (
                          <span className="font-mono text-xs">#{p.containedIn}</span>
                        )
                      ) : (
                        "Loose"
                      )
                    }
                  />
                  <Field
                    label="Value"
                    value={p.value != null && p.value !== 0 ? `$${p.value.toFixed(2)}` : null}
                  />
                  <Field label="Acquired" value={formatDate(p.acquisitionDate)} />
                  <Field label="Donor" value={linkedParty?.name ?? null} />
                </>
              )}
            </Section>

            {/* Modification History */}
            <ModificationLog
              entries={changelog}
              detailRenderer={(entry, onClose) => (
                <PartModificationModal entry={entry} onClose={onClose} />
              )}
            />
          </div>

          <div className="flex-[1] min-w-0 lg:min-w-64 lg:sticky lg:top-20">
            <NotesPane assetId={part.id} />
          </div>
        </div>

        {saved && (
          <div className="fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 bg-green-600 text-white rounded-xl shadow-lg text-sm font-medium z-50">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Changes saved
          </div>
        )}
      </div>
    </>
  );
}
