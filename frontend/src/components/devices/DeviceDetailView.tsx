import type {
  AnyDevice,
  DeviceStatus,
  ChargerStatus,
  WorkingBattery,
  Part,
  PartySummary,
} from "../../types/inventory";
import type { DeviceChangelogEntry } from "../../types/changelog";
import type { LookupData } from "../../hooks/useLookups";
import StatusBadge from "../StatusBadge";
import NotesPaneContainer from "../../containers/NotesPaneContainer";
import { PrintLabelModalContainer } from "../../containers/PrintLabelModalContainer";
import { ReadyToDonateFormModal } from "./ReadyToDonateFormModal";
import { PartRowContainer } from "../../containers/PartRowContainer";
import { PartyPickerModalContainer } from "../../containers/PartyPickerModalContainer";
import UnsavedChangesGuard from "../../containers/UnsavedChangesGuard";
import AddAssetButtonContainer from "../../containers/AddAssetButtonContainer";
import { Field } from "../Field";
import { EditText, EditSelect, EditCombo } from "../EditField";
import { Section } from "../Section";
import { Breadcrumb } from "../Breadcrumb";
import { formatDate } from "../../utils/dateUtils";
import { labelCls, inputCls } from "../../utils/formStyles";
import { ModificationLog } from "../ModificationLog";
import { ModificationModal } from "../ModificationModal";
import { buildDeviceFields } from "../../utils/changelogFields";
import { BatteryBar } from "./BatteryBar";

export interface DeviceDetailViewProps {
  device: AnyDevice;
  editing: boolean;
  form: AnyDevice | null;
  saved: boolean;
  saveError: string | null;
  isDirty: boolean;
  canPrint: boolean;
  editLock: boolean;
  viewerLock: boolean;
  donatedLock: boolean;
  printId: number | null;
  partyPickerOpen: boolean;
  recipientPickerOpen: boolean;
  showDonateModal: boolean;
  linkedParty: PartySummary | null;
  editParty: PartySummary | null;
  linkedRecipient: PartySummary | null;
  editRecipient: PartySummary | null;
  linkedParts: Part[];
  changelog: DeviceChangelogEntry[];
  lookups: LookupData;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onFieldChange: (key: string, value: string | number | boolean | null) => void;
  onStatusChange: (status: DeviceStatus) => void;
  onOpenPrint: (id: number) => void;
  onClosePrint: () => void;
  onOpenPartyPicker: () => void;
  onSelectParty: (party: PartySummary) => void;
  onCancelPartyPicker: () => void;
  onRemoveDonor: () => void;
  onOpenRecipientPicker: () => void;
  onSelectRecipient: (party: PartySummary) => void;
  onCancelRecipientPicker: () => void;
  onRemoveRecipient: () => void;
  onConfirmDonate: () => void;
  onCancelDonate: () => void;
  onUnlinkPart: (part: Part) => void;
}

export default function DeviceDetailView({
  device,
  editing,
  form,
  saved,
  saveError,
  isDirty,
  canPrint,
  editLock,
  viewerLock,
  donatedLock,
  printId,
  partyPickerOpen,
  recipientPickerOpen,
  showDonateModal,
  linkedParty,
  editParty,
  linkedRecipient,
  editRecipient,
  linkedParts,
  changelog,
  lookups,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onFieldChange,
  onStatusChange,
  onOpenPrint,
  onClosePrint,
  onOpenPartyPicker,
  onSelectParty,
  onCancelPartyPicker,
  onRemoveDonor,
  onOpenRecipientPicker,
  onSelectRecipient,
  onCancelRecipientPicker,
  onRemoveRecipient,
  onConfirmDonate,
  onCancelDonate,
  onUnlinkPart,
}: DeviceDetailViewProps) {
  const d = editing && form ? form : device;

  return (
    <>
      <UnsavedChangesGuard when={isDirty} />
      {printId !== null && <PrintLabelModalContainer assetId={printId} onClose={onClosePrint} />}
      {partyPickerOpen && (
        <PartyPickerModalContainer onSelect={onSelectParty} onCancel={onCancelPartyPicker} />
      )}
      {recipientPickerOpen && (
        <PartyPickerModalContainer
          onSelect={onSelectRecipient}
          onCancel={onCancelRecipientPicker}
        />
      )}
      {showDonateModal && (
        <ReadyToDonateFormModal onConfirm={onConfirmDonate} onCancel={onCancelDonate} />
      )}
      <div className="space-y-5">
        {/* Breadcrumb + Add Asset */}
        <div className="flex items-center justify-between">
          <Breadcrumb
            backHref="/devices"
            backLabel="Devices"
            current={`${device.manufacturer} ${device.model}`}
          />
          <AddAssetButtonContainer />
        </div>

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">
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
            <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
              <StatusBadge status={d.status as DeviceStatus} size="lg" />
              {!editing && canPrint && (
                <button
                  onClick={() => onOpenPrint(d.id)}
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
                  onClick={onStartEdit}
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
                    onClick={onCancelEdit}
                    className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSaveEdit}
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
          {/* Left: detail sections */}
          <div className="flex-[3] min-w-0 space-y-5">
            <Section title="Specifications">
              {editing && form ? (
                <>
                  <EditCombo
                    label="Manufacturer"
                    value={form.manufacturer ?? null}
                    options={lookups.manufacturers}
                    onChange={(v) => onFieldChange("manufacturer", v ?? "")}
                    placeholder="e.g. Asus"
                    maxLength={50}
                  />
                  <EditCombo
                    label="Operating System"
                    value={form.operatingSystem ?? null}
                    options={lookups.operatingSystems}
                    onChange={(v) => onFieldChange("operatingSystem", v)}
                    placeholder="e.g. Windows 11"
                    maxLength={50}
                  />
                  <EditText
                    label="Model"
                    value={form.model ?? ""}
                    onChange={(v) => onFieldChange("model", v)}
                    placeholder="e.g. ThinkPad X1"
                    maxLength={50}
                  />
                  <EditText
                    label="Year"
                    type="number"
                    value={String(form.year)}
                    onChange={(v) => onFieldChange("year", Number(v))}
                    min={1980}
                    max={new Date().getFullYear()}
                  />
                  <EditText
                    label="CPU"
                    value={form.cpu ?? ""}
                    onChange={(v) => onFieldChange("cpu", v || null)}
                    placeholder="e.g. i5-1135G7"
                    maxLength={50}
                  />
                  <EditText
                    label="RAM (GB)"
                    type="number"
                    value={String(form.ram)}
                    onChange={(v) => onFieldChange("ram", Number(v))}
                    min={0}
                  />
                  <EditCombo
                    label="RAM Generation"
                    value={form.ramGeneration ?? null}
                    options={lookups.ramGenerations}
                    onChange={(v) => onFieldChange("ramGeneration", v)}
                    placeholder="e.g. LPDDR5"
                    maxLength={20}
                  />
                  <EditText
                    label="Storage (GB)"
                    type="number"
                    value={String(form.storage)}
                    onChange={(v) => onFieldChange("storage", Number(v))}
                    min={0}
                  />
                  <EditCombo
                    label="Storage Type"
                    value={form.storageType ?? null}
                    options={lookups.storageTypes}
                    onChange={(v) => onFieldChange("storageType", v)}
                    placeholder="e.g. eMMC"
                    maxLength={30}
                  />
                  <EditSelect
                    label="Status"
                    value={(form.status ?? "Unknown") as DeviceStatus}
                    options={lookups.deviceStatuses}
                    onChange={onStatusChange}
                  />
                  <EditSelect
                    label="Chapter"
                    value={form.chapter ?? ""}
                    options={lookups.chapters}
                    onChange={(v) => onFieldChange("chapter", v)}
                  />
                  <div>
                    <label className={labelCls}>Acquired</label>
                    <input
                      type="date"
                      value={form.acquisitionDate ?? ""}
                      onChange={(e) => onFieldChange("acquisitionDate", e.target.value || null)}
                      className={inputCls}
                    />
                  </div>
                  <EditText
                    label="Value ($)"
                    type="number"
                    value={String(form.value ?? "")}
                    onChange={(v) => onFieldChange("value", v ? Number(v) : null)}
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
                          onClick={onRemoveDonor}
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
                        onClick={onOpenPartyPicker}
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
                            onClick={onRemoveRecipient}
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
                          onClick={onOpenRecipientPicker}
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
                    onChange={(v) =>
                      onFieldChange("hasWifi", v === "Yes" ? true : v === "No" ? false : null)
                    }
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
                          onChange={(v) => onFieldChange("includesCharger", v)}
                        />
                        <EditText
                          label="Design Capacity (mWh)"
                          type="number"
                          value={String(
                            fLaptop.designBatteryCapacity === 0
                              ? ""
                              : (fLaptop.designBatteryCapacity ?? "")
                          )}
                          onChange={(v) =>
                            onFieldChange("designBatteryCapacity", v ? Number(v) : null)
                          }
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
                          onChange={(v) =>
                            onFieldChange("actualBatteryCapacity", v ? Number(v) : null)
                          }
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
                          onChange={(v) => onFieldChange("includesCharger", v)}
                        />
                        <EditSelect
                          label="Working Battery"
                          value={(fTablet.workingBattery ?? "Unknown") as WorkingBattery}
                          options={lookups.workingBatteryOpts}
                          onChange={(v) => onFieldChange("workingBattery", v)}
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
                        <PartRowContainer
                          key={p.id}
                          part={p}
                          onUnlink={(e) => {
                            e.preventDefault();
                            onUnlinkPart(p);
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
                <ModificationModal
                  entry={entry}
                  fields={buildDeviceFields(entry)}
                  onClose={onClose}
                />
              )}
            />
          </div>

          {/* Right: sticky notes pane */}
          <div className="flex-[1] min-w-0 lg:min-w-64 lg:sticky lg:top-20">
            <NotesPaneContainer
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
