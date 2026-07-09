import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import type {
  AnyDevice,
  DeviceStatus,
  ChargerStatus,
  WorkingBattery,
  Part,
} from "../types/inventory";
import StatusBadge from "../components/StatusBadge";
import NotesPane from "../components/NotesPane";
import { getDevice, updateDevice, getDeviceChangelog } from "../services/deviceService";
import { getPartsByDevice, updatePart } from "../services/partService";
import { useLookups } from "../hooks/useLookups";
import { PrintLabelModal } from "../components/PrintLabelModal";
import { ReadyToDonateFormModal } from "../components/ReadyToDonateFormModal";
import { useAuth } from "../context/AuthContext";
import { useWritableChapters } from "../context/ChapterContext";
import { useToast } from "../context/ToastContext";
import { PartRow } from "../components/PartRow";
import { PartyPickerModal } from "../components/PartyPickerModal";
import type { PartySummary } from "../types/inventory";
import { getParty } from "../services/partyService";
import { Field } from "../components/Field";
import { EditText, EditSelect, EditCombo } from "../components/EditField";
import { Section } from "../components/Section";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { Breadcrumb } from "../components/Breadcrumb";

import { formatDate } from "../utils/dateUtils";
import { labelCls, inputCls } from "../utils/formStyles";
import { ModificationLog } from "../components/ModificationLog";
import { DeviceModificationModal } from "../components/DeviceModificationModal";
import type { DeviceChangelogEntry } from "../types/changelog";

function BatteryBar({ health }: { health: number | null }) {
  if (health == null) return <span className="text-slate-300 text-sm">—</span>;
  const pct = Math.round(health * 100);
  const color = pct >= 80 ? "bg-slate-500" : pct >= 50 ? "bg-slate-400" : "bg-slate-300";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-slate-700 tabular-nums w-9 shrink-0">{pct}%</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const { auth } = useAuth();
  const writableChapters = useWritableChapters();
  const { showToast } = useToast();
  const lookups = useLookups();

  const [device, setDevice] = useState<AnyDevice | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<AnyDevice | null>(null);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [printId, setPrintId] = useState<number | null>(null);
  const [linkedParts, setLinkedParts] = useState<Part[]>([]);
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [linkedParty, setLinkedParty] = useState<PartySummary | null>(null);
  const [editParty, setEditParty] = useState<PartySummary | null>(null);
  const [partyPickerOpen, setPartyPickerOpen] = useState(false);
  const [linkedRecipient, setLinkedRecipient] = useState<PartySummary | null>(null);
  const [editRecipient, setEditRecipient] = useState<PartySummary | null>(null);
  const [recipientPickerOpen, setRecipientPickerOpen] = useState(false);
  const [changelog, setChangelog] = useState<DeviceChangelogEntry[]>([]);

  useEffect(() => {
    getDevice(numId)
      .then((d) => {
        setDevice(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [numId]);

  useEffect(() => {
    getPartsByDevice(numId)
      .then(setLinkedParts)
      .catch(() => setLinkedParts([]));
  }, [numId]);

  useEffect(() => {
    getDeviceChangelog(numId)
      .then(setChangelog)
      .catch(() => setChangelog([]));
  }, [numId]);

  useEffect(() => {
    if (device?.donorId != null) {
      getParty(device.donorId)
        .then(setLinkedParty)
        .catch(() => setLinkedParty(null));
    } else {
      Promise.resolve().then(() => setLinkedParty(null));
    }
  }, [device?.donorId]);

  useEffect(() => {
    if (device?.recipientId != null) {
      getParty(device.recipientId)
        .then(setLinkedRecipient)
        .catch(() => setLinkedRecipient(null));
    } else {
      Promise.resolve().then(() => setLinkedRecipient(null));
    }
  }, [device?.recipientId]);

  if (loading) return <LoadingSpinner />;

  if (!device) {
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
          <p className="text-sm font-semibold text-slate-900">Device not found</p>
          <p className="text-xs text-slate-400 mt-1">
            No device with ID <span className="font-mono">{id}</span> exists in inventory.
          </p>
        </div>
        <Link
          to="/devices"
          className="mt-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
        >
          ← Back to Devices
        </Link>
      </div>
    );
  }

  function startEdit() {
    setForm({ ...device } as AnyDevice);
    setEditParty(linkedParty);
    setEditRecipient(linkedRecipient);
    setEditing(true);
  }
  function cancelEdit() {
    setEditing(false);
    setEditParty(null);
    setEditRecipient(null);
  }
  async function saveEdit() {
    if (!form) return;
    if (form.status === "Donated" && !editRecipient) {
      setSaveError("A recipient must be selected when status is Donated.");
      setTimeout(() => setSaveError(null), 5000);
      return;
    }
    setSaveError(null);
    try {
      const updated = await updateDevice(numId, {
        ...form,
        recipientId: editRecipient?.id ?? null,
      });
      setDevice(updated);
      setLinkedParty(editParty);
      setLinkedRecipient(editRecipient);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      getDeviceChangelog(numId)
        .then(setChangelog)
        .catch(() => {});
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
      setTimeout(() => setSaveError(null), 5000);
    }
  }
  function set(key: string) {
    return (value: string | number | boolean | null) =>
      setForm((prev) => (prev ? ({ ...prev, [key]: value } as AnyDevice) : prev));
  }

  function handleStatusChange(newStatus: DeviceStatus) {
    if (newStatus === "Ready To Donate") {
      setShowDonateModal(true);
    } else if (newStatus === "Donated") {
      set("status")(newStatus);
      setRecipientPickerOpen(true);
    } else {
      set("status")(newStatus);
      setEditRecipient(null);
      setForm((prev) => (prev ? ({ ...prev, recipientId: null } as AnyDevice) : prev));
    }
  }

  async function handleUnlink(part: Part) {
    try {
      const updated = await updatePart(part.id, { ...part, containedIn: null });
      setLinkedParts((prev) => prev.filter((p) => p.id !== updated.id));
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to unlink part", false);
    }
  }

  const d = editing && form ? form : device;

  // Determine write access for this specific chapter, not just the global role.
  // A National Viewer + IU Chapter Admin cannot write to a Rose-Hulman device.
  const canWriteThisChapter = writableChapters.some((c) => c.name === device.chapter);
  const viewerLock = !canWriteThisChapter;
  const donatedLock =
    canWriteThisChapter && auth?.role?.toLowerCase() === "editor" && device.status === "Donated";
  const editLock = viewerLock || donatedLock;

  return (
    <>
      {printId !== null && <PrintLabelModal assetId={printId} onClose={() => setPrintId(null)} />}
      {partyPickerOpen && (
        <PartyPickerModal
          onSelect={(party) => {
            setEditParty(party);
            setForm((prev) => (prev ? ({ ...prev, donorId: party.id } as AnyDevice) : prev));
            setPartyPickerOpen(false);
          }}
          onCancel={() => setPartyPickerOpen(false)}
        />
      )}
      {recipientPickerOpen && (
        <PartyPickerModal
          onSelect={(party) => {
            setEditRecipient(party);
            setForm((prev) => (prev ? ({ ...prev, recipientId: party.id } as AnyDevice) : prev));
            setRecipientPickerOpen(false);
          }}
          onCancel={() => setRecipientPickerOpen(false)}
        />
      )}
      {showDonateModal && (
        <ReadyToDonateFormModal
          onConfirm={() => {
            set("status")("Ready To Donate");
            setShowDonateModal(false);
          }}
          onCancel={() => setShowDonateModal(false)}
        />
      )}
      <div className="space-y-5">
        {/* Breadcrumb */}
        <Breadcrumb
          backHref="/devices"
          backLabel="Devices"
          current={`${device.manufacturer} ${device.model}`}
        />

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-xl px-8 py-6">
          <div className="flex items-stretch justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-500 uppercase tracking-wide">
                  {d.type}
                </span>
                <span className="font-mono text-xs text-slate-400">#{d.id}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">
                {d.manufacturer} {d.model}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {d.year} · {d.chapter}
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge status={d.status as DeviceStatus} size="lg" />
              {!editing && (
                <button
                  onClick={() => setPrintId(d.id)}
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
              {!editing ? (
                <button
                  onClick={startEdit}
                  disabled={editLock}
                  title={
                    viewerLock
                      ? "Viewers cannot edit devices"
                      : donatedLock
                        ? "Donated devices cannot be edited"
                        : undefined
                  }
                  className="flex items-center gap-2 text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue-dark disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg transition-colors"
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
        <div className="flex gap-5 items-start">
          {/* Left: detail sections */}
          <div className="flex-[3] min-w-0 space-y-5">
            <Section title="Specifications">
              {editing && form ? (
                <>
                  <EditCombo
                    label="Manufacturer"
                    value={form.manufacturer ?? null}
                    options={lookups.manufacturers}
                    onChange={(v) => set("manufacturer")(v ?? "")}
                    placeholder="e.g. Asus"
                    maxLength={50}
                  />
                  <EditCombo
                    label="Operating System"
                    value={form.operatingSystem ?? null}
                    options={lookups.operatingSystems}
                    onChange={set("operatingSystem")}
                    placeholder="e.g. Windows 11"
                    maxLength={50}
                  />
                  <EditText
                    label="Model"
                    value={form.model ?? ""}
                    onChange={(v) => set("model")(v)}
                    placeholder="e.g. ThinkPad X1"
                    maxLength={50}
                  />
                  <EditText
                    label="Year"
                    type="number"
                    value={String(form.year)}
                    onChange={(v) => set("year")(Number(v))}
                    min={1980}
                    max={new Date().getFullYear()}
                  />
                  <EditText
                    label="CPU"
                    value={form.cpu ?? ""}
                    onChange={(v) => set("cpu")(v || null)}
                    placeholder="e.g. i5-1135G7"
                    maxLength={50}
                  />
                  <EditText
                    label="RAM (GB)"
                    type="number"
                    value={String(form.ram)}
                    onChange={(v) => set("ram")(Number(v))}
                    min={0}
                  />
                  <EditCombo
                    label="RAM Generation"
                    value={form.ramGeneration ?? null}
                    options={lookups.ramGenerations}
                    onChange={set("ramGeneration")}
                    placeholder="e.g. LPDDR5"
                    maxLength={20}
                  />
                  <EditText
                    label="Storage (GB)"
                    type="number"
                    value={String(form.storage)}
                    onChange={(v) => set("storage")(Number(v))}
                    min={0}
                  />
                  <EditCombo
                    label="Storage Type"
                    value={form.storageType ?? null}
                    options={lookups.storageTypes}
                    onChange={set("storageType")}
                    placeholder="e.g. eMMC"
                    maxLength={30}
                  />
                  <EditSelect
                    label="Status"
                    value={(form.status ?? "Unknown") as DeviceStatus}
                    options={lookups.deviceStatuses}
                    onChange={handleStatusChange}
                  />
                  <EditSelect
                    label="Chapter"
                    value={form.chapter ?? ""}
                    options={lookups.chapters}
                    onChange={set("chapter")}
                  />
                  <div>
                    <label className={labelCls}>Acquired</label>
                    <input
                      type="date"
                      value={form.acquisitionDate ?? ""}
                      onChange={(e) => set("acquisitionDate")(e.target.value || null)}
                      className={inputCls}
                    />
                  </div>
                  <EditText
                    label="Value ($)"
                    type="number"
                    value={String(form.value ?? "")}
                    onChange={(v) => set("value")(v ? Number(v) : null)}
                    placeholder="e.g. 150.00"
                  />
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
                            setForm((prev) =>
                              prev ? ({ ...prev, donorId: null } as AnyDevice) : prev
                            );
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
                  {form?.status === "Donated" && (
                    <div>
                      <label className={labelCls}>
                        Recipient <span className="text-red-500">*</span>
                      </label>
                      {editRecipient ? (
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                          <span className="text-sm text-slate-800">{editRecipient.name}</span>
                          <span className="text-xs text-slate-400">· {editRecipient.type}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditRecipient(null);
                              setForm((prev) =>
                                prev ? ({ ...prev, recipientId: null } as AnyDevice) : prev
                              );
                            }}
                            className="ml-auto text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                            title="Remove recipient"
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
                          onClick={() => setRecipientPickerOpen(true)}
                          className="flex items-center gap-2 w-full text-sm border border-red-300 text-red-500 hover:border-red-400 hover:bg-red-50 border-dashed rounded-lg px-3 py-2 transition-all"
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
                          Select recipient (required)
                        </button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Field label="Manufacturer" value={d.manufacturer} />
                  <Field label="Operating System" value={d.operatingSystem} />
                  <Field label="Model" value={d.model} />
                  <Field label="Year" value={d.year} />
                  <Field label="CPU" value={d.cpu} />
                  <Field
                    label="RAM"
                    value={
                      d.ram != null
                        ? `${d.ram} GB${d.ramGeneration ? ` ${d.ramGeneration}` : ""}`
                        : null
                    }
                  />
                  <Field
                    label="Storage"
                    value={
                      d.storage != null
                        ? `${d.storage} GB${d.storageType ? ` ${d.storageType}` : ""}`
                        : null
                    }
                  />
                  <Field label="Status" value={<StatusBadge status={d.status as DeviceStatus} />} />
                  <Field label="Chapter" value={d.chapter} />
                  <Field label="Acquired" value={formatDate(d.acquisitionDate ?? null)} />
                  <Field
                    label="Value"
                    value={d.value != null && d.value !== 0 ? `$${d.value.toFixed(2)}` : null}
                  />
                  <Field label="Donor" value={linkedParty?.name ?? null} />
                  {d.status === "Donated" && (
                    <Field label="Recipient" value={linkedRecipient?.name ?? null} />
                  )}
                </>
              )}
            </Section>

            {d.type === "Desktop" && (
              <Section title="Desktop Details">
                {editing && form && form.type === "Desktop" ? (
                  <EditSelect
                    label="Wi-Fi"
                    value={form.hasWifi == null ? "Unknown" : form.hasWifi ? "Yes" : "No"}
                    options={["Yes", "No", "Unknown"]}
                    onChange={(v) => set("hasWifi")(v === "Yes" ? true : v === "No" ? false : null)}
                  />
                ) : (
                  <Field
                    label="Wi-Fi"
                    value={d.hasWifi == null ? null : d.hasWifi ? "Yes" : "No"}
                  />
                )}
              </Section>
            )}

            {d.type === "Laptop" &&
              (() => {
                const fLaptop = form?.type === "Laptop" ? form : null;
                return (
                  <Section title="Laptop Details">
                    {editing && fLaptop ? (
                      <>
                        <EditSelect
                          label="Charger"
                          value={(fLaptop.includesCharger ?? "Unknown") as ChargerStatus}
                          options={lookups.chargerStatuses}
                          onChange={set("includesCharger") as (v: ChargerStatus) => void}
                        />
                        <EditText
                          label="Design Capacity (mWh)"
                          type="number"
                          value={String(
                            fLaptop.designBatteryCapacity === 0
                              ? ""
                              : (fLaptop.designBatteryCapacity ?? "")
                          )}
                          onChange={(v) => set("designBatteryCapacity")(v ? Number(v) : null)}
                          min={1}
                        />
                        <EditText
                          label="Actual Capacity (mWh)"
                          type="number"
                          value={String(
                            fLaptop.actualBatteryCapacity === 0
                              ? ""
                              : (fLaptop.actualBatteryCapacity ?? "")
                          )}
                          onChange={(v) => set("actualBatteryCapacity")(v ? Number(v) : null)}
                          min={1}
                        />
                        {fLaptop.actualBatteryCapacity != null &&
                          fLaptop.designBatteryCapacity != null &&
                          fLaptop.actualBatteryCapacity > fLaptop.designBatteryCapacity && (
                            <p className="col-span-full text-xs text-red-500 -mt-3">
                              Actual capacity cannot exceed design capacity.
                            </p>
                          )}
                      </>
                    ) : (
                      <>
                        <Field label="Charger" value={d.includesCharger} />
                        <Field
                          label="Design Capacity"
                          value={
                            d.designBatteryCapacity != null
                              ? `${d.designBatteryCapacity.toLocaleString()} mWh`
                              : null
                          }
                        />
                        <Field
                          label="Actual Capacity"
                          value={
                            d.actualBatteryCapacity != null
                              ? `${d.actualBatteryCapacity.toLocaleString()} mWh`
                              : null
                          }
                        />
                        <div className="col-span-full">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
                            Battery Health
                          </p>
                          <BatteryBar health={d.batteryHealth ?? null} />
                        </div>
                      </>
                    )}
                  </Section>
                );
              })()}

            {d.type === "Tablet" &&
              (() => {
                const fTablet = form?.type === "Tablet" ? form : null;
                return (
                  <Section title="Tablet Details">
                    {editing && fTablet ? (
                      <>
                        <EditSelect
                          label="Charger"
                          value={(fTablet.includesCharger ?? "Unknown") as ChargerStatus}
                          options={lookups.chargerStatuses}
                          onChange={set("includesCharger") as (v: ChargerStatus) => void}
                        />
                        <EditSelect
                          label="Working Battery"
                          value={(fTablet.workingBattery ?? "Unknown") as WorkingBattery}
                          options={lookups.workingBatteryOpts}
                          onChange={set("workingBattery") as (v: WorkingBattery) => void}
                        />
                      </>
                    ) : (
                      <>
                        <Field label="Charger" value={d.includesCharger} />
                        <Field label="Working Battery" value={d.workingBattery} />
                      </>
                    )}
                  </Section>
                );
              })()}

            {/* Linked Parts */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-700">Linked Parts</h2>
                {linkedParts.length > 0 && (
                  <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {linkedParts.length}
                  </span>
                )}
              </div>
              {linkedParts.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-slate-400">
                  No parts are linked to this device.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {[
                          "ID",
                          "Type",
                          "Description",
                          "Chapter",
                          "Source",
                          "Contained In",
                          "Acquired",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {linkedParts.map((p) => (
                        <PartRow
                          key={p.id}
                          part={p}
                          onUnlink={(e) => {
                            e.preventDefault();
                            handleUnlink(p);
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modification History */}
            <ModificationLog
              entries={changelog}
              detailRenderer={(entry, onClose) => (
                <DeviceModificationModal entry={entry} onClose={onClose} />
              )}
            />
          </div>

          {/* Right: sticky notes pane */}
          <div className="flex-[1] min-w-64 sticky top-20">
            <NotesPane
              assetId={device.id}
              readOnly={editLock}
              readOnlyReason={viewerLock ? "viewer" : "donated"}
            />
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
        {saveError && (
          <div className="fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 bg-red-600 text-white rounded-xl shadow-lg text-sm font-medium z-50">
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {saveError}
          </div>
        )}
      </div>
    </>
  );
}
