import { useState, useEffect } from "react";
import type { AnyDevice, DeviceStatus, Part, PartySummary, Tool } from "../types/inventory";
import { useLookups } from "../hooks/useLookups";
import { useChapters } from "../context/ChapterContext";
import { checkAssetIdExists } from "../services/assetService";
import { inputCls, labelCls } from "../utils/formStyles";
import { DevicePickerModal } from "./DevicePickerModal";
import { PartyPickerModal } from "./PartyPickerModal";
import { CategoryStep } from "./add-asset/CategoryStep";
import { SubtypeStep } from "./add-asset/SubtypeStep";
import { FieldsForm } from "./add-asset/FieldsForm";
import {
  DEFAULT_FORM,
  type AssetCategory,
  type DeviceSubtype,
  type FormState,
} from "./add-asset/types";

// ─── Main modal ───────────────────────────────────────────────────────────────
export function AddAssetModal({
  scanId,
  onAdd,
  onCancel,
}: {
  scanId?: number;
  onAdd?: (asset: AnyDevice | Part | Tool) => void;
  onCancel: () => void;
}) {
  const lookups = useLookups();
  const { chapters: chapterList } = useChapters();

  // Set default chapter once lookup data loads
  const [step, setStep] = useState<"id" | "category" | "subtype" | "fields">(
    scanId !== undefined ? "category" : "id"
  );
  const [idMode, setIdMode] = useState<"input" | "generate">(
    scanId !== undefined ? "input" : "generate"
  );
  const [inputId, setInputId] = useState(scanId !== undefined ? String(scanId) : "");
  const [category, setCategory] = useState<AssetCategory | null>(null);
  const [subtype, setSubtype] = useState<DeviceSubtype | null>(null);
  const [form, setForm] = useState<FormState>({ ...DEFAULT_FORM });
  const [idConflict, setIdConflict] = useState(false);
  const [devicePickerOpen, setDevicePickerOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<AnyDevice | null>(null);
  const [partyPickerOpen, setPartyPickerOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<PartySummary | null>(null);
  const [recipientPickerOpen, setRecipientPickerOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<PartySummary | null>(null);

  // Pre-select first chapter when lookups load
  useEffect(() => {
    if (lookups.chapters.length > 0 && form.chapter === "") {
      const first = lookups.chapters[0];
      Promise.resolve().then(() => setForm((prev) => ({ ...prev, chapter: first })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookups.chapters.length]);

  // Async ID conflict check
  useEffect(() => {
    let cancelled = false;
    const n = Number(inputId);
    if (idMode !== "input" || !inputId || !Number.isInteger(n) || n <= 0) {
      Promise.resolve().then(() => {
        if (!cancelled) setIdConflict(false);
      });
      return () => {
        cancelled = true;
      };
    }
    checkAssetIdExists(n).then((exists) => {
      if (!cancelled) setIdConflict(exists);
    });
    return () => {
      cancelled = true;
    };
  }, [idMode, inputId]);

  function isIdStepValid(): boolean {
    if (idMode === "generate") return true;
    const n = Number(inputId);
    if (!inputId || !Number.isInteger(n) || n <= 0) return false;
    return !idConflict;
  }

  function idError(): string | null {
    if (idMode === "generate" || !inputId) return null;
    const n = Number(inputId);
    if (!Number.isInteger(n) || n <= 0) return "ID must be a positive whole number.";
    if (idConflict) return `ID ${n} is already in use.`;
    return null;
  }

  function handleSelectCategory(cat: AssetCategory) {
    setCategory(cat);
    setStep(cat === "Device" ? "subtype" : "fields");
  }

  function handleSelectSubtype(sub: DeviceSubtype) {
    setSubtype(sub);
    setStep("fields");
  }

  function handleBack() {
    if (step === "fields" && category === "Device") setStep("subtype");
    else if (step === "fields") setStep("category");
    else if (step === "subtype") setStep("category");
    else if (step === "category" && scanId === undefined) setStep("id");
  }

  function handleDeviceStatusChange(newStatus: DeviceStatus) {
    setForm((prev) => ({ ...prev, status: newStatus }));
    if (newStatus === "Donated") {
      setRecipientPickerOpen(true);
    } else {
      setSelectedRecipient(null);
    }
  }

  function isValid(): boolean {
    if (!category) return false;
    const f = form;
    if (category === "Tool") return f.toolDescription.trim() !== "" && f.chapter !== "";
    if (category === "Part") return !!f.partType && f.description.trim() !== "" && f.chapter !== "";
    // Device — RAM and storage default to 0 in the DB, so 0 is valid; only require non-empty strings
    if (!(f.manufacturer?.trim() && f.model.trim() && f.year && f.chapter)) return false;
    // Donated devices require a recipient
    if (f.status === "Donated" && !selectedRecipient) return false;
    // Battery cross-validation: actual ≤ design (DB CHECK constraint)
    if (
      subtype === "Laptop" &&
      f.actualBatteryCapacity &&
      f.designBatteryCapacity &&
      Number(f.actualBatteryCapacity) > Number(f.designBatteryCapacity)
    )
      return false;
    return true;
  }

  function handleSubmit() {
    if (!category || !isValid()) return;

    if (category === "Tool") {
      const tool: Tool = {
        id: idMode === "input" ? Number(inputId) : 0,
        description: form.toolDescription.trim(),
        chapterId: chapterList.find((c) => c.name === form.chapter)?.id ?? 0,
        acquisitionDate: form.acquisitionDate || null,
        value: form.value ? Number(form.value) : null,
        donorId: selectedParty?.id ?? null,
      };
      onAdd?.(tool);
      return;
    }

    if (category === "Part") {
      const chapterId = chapterList.find((c) => c.name === form.chapter)?.id ?? 0;
      const part: Part = {
        id: idMode === "input" ? Number(inputId) : 0,
        type: form.partType ?? "",
        description: form.description.trim(),
        wasPurchased: form.wasPurchased,
        containedIn: form.containedIn ? Number(form.containedIn) : null,
        chapterId,
        acquisitionDate: form.acquisitionDate || null,
        value: form.value ? Number(form.value) : null,
        donorId: selectedParty?.id ?? null,
      };
      onAdd?.(part);
      return;
    }

    // Device
    const base = {
      id: idMode === "input" ? Number(inputId) : 0,
      manufacturer: form.manufacturer?.trim() ?? "",
      model: form.model.trim(),
      year: Number(form.year),
      cpu: form.cpu.trim() || null,
      ram: Number(form.ram),
      ramGeneration: form.ramGeneration,
      storage: Number(form.storage),
      storageType: form.storageType,
      operatingSystem: form.operatingSystem,
      status: form.status,
      chapter: form.chapter,
      acquisitionDate: form.acquisitionDate || null,
      donatedDate: null,
      value: form.value ? Number(form.value) : null,
      donorId: selectedParty?.id ?? null,
      recipientId: selectedRecipient?.id ?? null,
    };

    if (subtype === "Desktop") {
      const device: AnyDevice = {
        ...base,
        type: "Desktop",
        hasWifi: form.hasWifi === "Unknown" ? null : form.hasWifi === "Yes",
      };
      onAdd?.(device);
    } else if (subtype === "Laptop") {
      const device: AnyDevice = {
        ...base,
        type: "Laptop",
        includesCharger: form.includesCharger,
        designBatteryCapacity: form.designBatteryCapacity
          ? Number(form.designBatteryCapacity)
          : null,
        actualBatteryCapacity: form.actualBatteryCapacity
          ? Number(form.actualBatteryCapacity)
          : null,
        batteryHealth: null, // computed by DB
      };
      onAdd?.(device);
    } else if (subtype === "Tablet") {
      const device: AnyDevice = {
        ...base,
        type: "Tablet",
        includesCharger: form.includesCharger,
        workingBattery: form.workingBattery,
      };
      onAdd?.(device);
    }
  }

  // Step indicator
  const steps =
    scanId !== undefined
      ? category === "Device"
        ? ["Category", "Device Type", "Details"]
        : ["Category", "Details"]
      : category === "Device"
        ? ["ID", "Category", "Device Type", "Details"]
        : ["ID", "Category", "Details"];
  const stepIdx =
    scanId !== undefined
      ? step === "category"
        ? 0
        : step === "subtype"
          ? 1
          : category === "Device"
            ? 2
            : 1
      : step === "id"
        ? 0
        : step === "category"
          ? 1
          : step === "subtype"
            ? 2
            : category === "Device"
              ? 3
              : 2;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Add New Asset</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {scanId !== undefined ? (
                <>
                  Barcode <span className="font-mono font-medium text-slate-600">#{scanId}</span>{" "}
                  was not found — fill in the details below to add it.
                </>
              ) : (
                "Fill in the details below to add a new asset."
              )}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="ml-4 shrink-0 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4 pb-2 flex items-center gap-1.5 shrink-0">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5">
              {i > 0 && (
                <div
                  className={`h-px w-8 transition-colors ${i <= stepIdx ? "bg-heart-blue/40" : "bg-slate-200"}`}
                />
              )}
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    i < stepIdx
                      ? "bg-heart-blue text-white"
                      : i === stepIdx
                        ? "bg-brand-red text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {i < stepIdx ? "✓" : i + 1}
                </span>
                <span
                  className={`text-xs font-medium transition-colors ${i === stepIdx ? "text-brand-red" : "text-slate-400"}`}
                >
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Device picker (rendered above the modal layer) */}
        {devicePickerOpen && (
          <DevicePickerModal
            chapterName={form.chapter || undefined}
            onSelect={(device) => {
              setSelectedDevice(device);
              setForm((prev) => ({ ...prev, containedIn: String(device.id) }));
              setDevicePickerOpen(false);
            }}
            onCancel={() => setDevicePickerOpen(false)}
          />
        )}

        {/* Party picker — donor */}
        {partyPickerOpen && (
          <PartyPickerModal
            onSelect={(party) => {
              setSelectedParty(party);
              setPartyPickerOpen(false);
            }}
            onCancel={() => setPartyPickerOpen(false)}
          />
        )}

        {/* Party picker — recipient */}
        {recipientPickerOpen && (
          <PartyPickerModal
            onSelect={(party) => {
              setSelectedRecipient(party);
              setRecipientPickerOpen(false);
            }}
            onCancel={() => setRecipientPickerOpen(false)}
          />
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === "id" && (
            <div>
              <p className="text-sm text-slate-500 mb-5">How should this asset's ID be assigned?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {(
                  [
                    [
                      "generate",
                      "Generate an ID",
                      "The system will assign an ID automatically when saved to the database.",
                    ],
                    [
                      "input",
                      "Input an ID",
                      "Manually enter the ID — useful when the barcode number is already known.",
                    ],
                  ] as const
                ).map(([mode, title, desc]) => (
                  <button
                    key={mode}
                    onClick={() => setIdMode(mode)}
                    className={`flex flex-col items-start gap-2 p-5 rounded-xl border-2 transition-all text-left ${
                      idMode === mode
                        ? "border-heart-blue bg-heart-blue/5 text-heart-blue"
                        : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        idMode === mode ? "border-heart-blue" : "border-slate-300"
                      }`}
                    >
                      {idMode === mode && <span className="w-2 h-2 rounded-full bg-heart-blue" />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="text-xs opacity-70 mt-0.5 leading-snug">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {idMode === "input" && (
                <div>
                  <label className={labelCls}>Asset ID</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={inputId}
                    placeholder="e.g. 1015"
                    onKeyDown={(e) =>
                      ["e", "E", "+", "-", "."].includes(e.key) && e.preventDefault()
                    }
                    onChange={(e) => setInputId(e.target.value)}
                    className={`${inputCls} ${idError() ? "border-red-300 focus:ring-red-300 focus:border-red-300" : ""}`}
                  />
                  {idError() && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
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
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {idError()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          {step === "category" && <CategoryStep onSelect={handleSelectCategory} />}
          {step === "subtype" && <SubtypeStep onSelect={handleSelectSubtype} />}
          {step === "fields" && (
            <FieldsForm
              category={category!}
              subtype={subtype}
              form={form}
              setForm={(updater) => {
                setForm((prev) => {
                  const next = typeof updater === "function" ? updater(prev) : updater;
                  if (next.chapter !== prev.chapter) {
                    setSelectedDevice(null);
                    return { ...next, containedIn: "" };
                  }
                  return next;
                });
              }}
              lookups={lookups}
              selectedDevice={selectedDevice}
              onOpenDevicePicker={() => setDevicePickerOpen(true)}
              onClearDevice={() => {
                setSelectedDevice(null);
                setForm((prev) => ({ ...prev, containedIn: "" }));
              }}
              selectedParty={selectedParty}
              onOpenPartyPicker={() => setPartyPickerOpen(true)}
              onClearParty={() => setSelectedParty(null)}
              selectedRecipient={selectedRecipient}
              onOpenRecipientPicker={() => setRecipientPickerOpen(true)}
              onClearRecipient={() => setSelectedRecipient(null)}
              onDeviceStatusChange={handleDeviceStatusChange}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div>
            {step !== "category" && (
              <button
                onClick={handleBack}
                className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            {step === "id" && (
              <button
                onClick={() => setStep("category")}
                disabled={!isIdStepValid()}
                className="text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue-dark disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 rounded-lg transition-colors"
              >
                Continue
              </button>
            )}
            {step === "fields" && (
              <button
                onClick={handleSubmit}
                disabled={!isValid()}
                className="text-sm font-medium text-white bg-brand-red hover:bg-brand-red-dark disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 rounded-lg transition-colors"
              >
                Add Asset
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
