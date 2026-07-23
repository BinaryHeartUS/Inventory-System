import { useState, useEffect } from "react";
import type { AnyDevice, DeviceStatus, Part, PartySummary } from "../types/inventory";
import type { DeviceChangelogEntry } from "../types/changelog";
import { getDevice, updateDevice, getDeviceChangelog } from "../services/deviceService";
import { getPartsByDevice, updatePart } from "../services/partService";
import { useLookups } from "../hooks/useLookups";
import { canPrintLabels } from "../utils/canPrintLabels";
import { useAuth } from "../context/AuthContext";
import { useWritableChapters } from "../context/ChapterContext";
import { useToast } from "../context/ToastContext";
import { useLinkedParty } from "../hooks/useLinkedParty";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { NotFound } from "../components/NotFound";
import DeviceDetailView from "../components/deviceDetail/DeviceDetailView";

interface DeviceDetailContainerProps {
  id: string | undefined;
}

export default function DeviceDetailContainer({ id }: DeviceDetailContainerProps) {
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
  const [linkedParty, setLinkedParty] = useLinkedParty(device?.donorId);
  const [editParty, setEditParty] = useState<PartySummary | null>(null);
  const [partyPickerOpen, setPartyPickerOpen] = useState(false);
  const [linkedRecipient, setLinkedRecipient] = useLinkedParty(device?.recipientId);
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

  if (loading) return <LoadingSpinner />;

  if (!device) {
    return <NotFound entity="Device" id={id} backTo="/devices" backLabel="Back to Devices" />;
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

  function handleFieldChange(key: string, value: string | number | boolean | null) {
    set(key)(value);
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

  // Determine write access for this specific chapter, not just the global role.
  // A National Viewer + IU Chapter Admin cannot write to a Rose-Hulman device.
  const canWriteThisChapter = writableChapters.some((c) => c.name === device.chapter);
  const viewerLock = !canWriteThisChapter;
  const donatedLock =
    canWriteThisChapter && auth?.role?.toLowerCase() === "editor" && device.status === "Donated";
  const editLock = viewerLock || donatedLock;

  const isDirty =
    editing &&
    !!form &&
    (JSON.stringify(form) !== JSON.stringify(device) ||
      (editParty?.id ?? null) !== (linkedParty?.id ?? null) ||
      (editRecipient?.id ?? null) !== (linkedRecipient?.id ?? null));

  return (
    <DeviceDetailView
      device={device}
      editing={editing}
      form={form}
      saved={saved}
      saveError={saveError}
      isDirty={isDirty}
      canPrint={canPrintLabels()}
      editLock={editLock}
      viewerLock={viewerLock}
      donatedLock={donatedLock}
      printId={printId}
      partyPickerOpen={partyPickerOpen}
      recipientPickerOpen={recipientPickerOpen}
      showDonateModal={showDonateModal}
      linkedParty={linkedParty}
      editParty={editParty}
      linkedRecipient={linkedRecipient}
      editRecipient={editRecipient}
      linkedParts={linkedParts}
      changelog={changelog}
      lookups={lookups}
      onStartEdit={startEdit}
      onCancelEdit={cancelEdit}
      onSaveEdit={saveEdit}
      onFieldChange={handleFieldChange}
      onStatusChange={handleStatusChange}
      onOpenPrint={(pid) => setPrintId(pid)}
      onClosePrint={() => setPrintId(null)}
      onOpenPartyPicker={() => setPartyPickerOpen(true)}
      onSelectParty={(party) => {
        setEditParty(party);
        setForm((prev) => (prev ? ({ ...prev, donorId: party.id } as AnyDevice) : prev));
        setPartyPickerOpen(false);
      }}
      onCancelPartyPicker={() => setPartyPickerOpen(false)}
      onRemoveDonor={() => {
        setEditParty(null);
        setForm((prev) => (prev ? ({ ...prev, donorId: null } as AnyDevice) : prev));
      }}
      onOpenRecipientPicker={() => setRecipientPickerOpen(true)}
      onSelectRecipient={(party) => {
        setEditRecipient(party);
        setForm((prev) => (prev ? ({ ...prev, recipientId: party.id } as AnyDevice) : prev));
        setRecipientPickerOpen(false);
      }}
      onCancelRecipientPicker={() => setRecipientPickerOpen(false)}
      onRemoveRecipient={() => {
        setEditRecipient(null);
        setForm((prev) => (prev ? ({ ...prev, recipientId: null } as AnyDevice) : prev));
      }}
      onConfirmDonate={() => {
        set("status")("Ready To Donate");
        setShowDonateModal(false);
      }}
      onCancelDonate={() => setShowDonateModal(false)}
      onUnlinkPart={handleUnlink}
    />
  );
}
