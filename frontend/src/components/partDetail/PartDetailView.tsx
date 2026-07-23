import type { AnyDevice, Part, PartySummary, ChapterSummary } from "../../types/inventory";
import type { PartChangelogEntry } from "../../types/changelog";
import NotesPaneContainer from "../../containers/NotesPaneContainer";
import { PrintLabelModalContainer } from "../../containers/PrintLabelModalContainer";
import { DevicePickerModalContainer } from "../../containers/DevicePickerModalContainer";
import { PartyPickerModalContainer } from "../../containers/PartyPickerModalContainer";
import UnsavedChangesGuard from "../../containers/UnsavedChangesGuard";
import AddAssetButtonContainer from "../../containers/AddAssetButtonContainer";
import { Field } from "../Field";
import { EditText, EditSelect, EditCombo } from "../EditField";
import { Section } from "../Section";
import { Breadcrumb } from "../Breadcrumb";
import { DeleteConfirmButton } from "../DeleteConfirmButton";
import { formatDate } from "../../utils/dateUtils";
import { labelCls, inputCls } from "../../utils/formStyles";
import { ModificationLog } from "../ModificationLog";
import { ModificationModal } from "../ModificationModal";
import { buildPartFields } from "../../utils/changelogFields";

export interface PartDetailViewProps {
  part: Part;
  editing: boolean;
  form: Part | null;
  saved: boolean;
  isDirty: boolean;
  canDelete: boolean;
  deleteBlocked: boolean;
  canPrint: boolean;
  printId: number | null;
  showDeleteConfirm: boolean;
  linkedDevice: AnyDevice | null;
  editDevice: AnyDevice | null;
  devicePickerOpen: boolean;
  linkedParty: PartySummary | null;
  editParty: PartySummary | null;
  partyPickerOpen: boolean;
  changelog: PartChangelogEntry[];
  chapterName: (id: number) => string;
  chapters: ChapterSummary[];
  partTypes: string[];
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onFieldChange: (key: keyof Part, value: string | number | boolean | null) => void;
  onOpenPrint: (id: number) => void;
  onClosePrint: () => void;
  onShowDeleteConfirm: () => void;
  onCancelDelete: () => void;
  onOpenPartyPicker: () => void;
  onSelectParty: (party: PartySummary) => void;
  onCancelPartyPicker: () => void;
  onRemoveDonor: () => void;
  onOpenDevicePicker: () => void;
  onSelectDevice: (device: AnyDevice) => void;
  onCancelDevicePicker: () => void;
  onRemoveDevice: () => void;
  onNavigateToDevice: (id: number) => void;
}

/**
 * PartDetailView — presentational part detail: header actions, the details
 * section (view + edit forms including device/donor pickers), modification
 * history, notes pane, and the print/device/party modals.
 */
export default function PartDetailView({
  part,
  editing,
  form,
  saved,
  isDirty,
  canDelete,
  deleteBlocked,
  canPrint,
  printId,
  showDeleteConfirm,
  linkedDevice,
  editDevice,
  devicePickerOpen,
  linkedParty,
  editParty,
  partyPickerOpen,
  changelog,
  chapterName,
  chapters,
  partTypes,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onFieldChange,
  onOpenPrint,
  onClosePrint,
  onShowDeleteConfirm,
  onCancelDelete,
  onOpenPartyPicker,
  onSelectParty,
  onCancelPartyPicker,
  onRemoveDonor,
  onOpenDevicePicker,
  onSelectDevice,
  onCancelDevicePicker,
  onRemoveDevice,
  onNavigateToDevice,
}: PartDetailViewProps) {
  const p = editing && form ? form : part;

  return (
    <>
      <UnsavedChangesGuard when={isDirty} />
      {printId !== null && <PrintLabelModalContainer assetId={printId} onClose={onClosePrint} />}
      {partyPickerOpen && (
        <PartyPickerModalContainer onSelect={onSelectParty} onCancel={onCancelPartyPicker} />
      )}
      {devicePickerOpen && (
        <DevicePickerModalContainer onSelect={onSelectDevice} onCancel={onCancelDevicePicker} />
      )}
      <div className="space-y-5">
        {/* Breadcrumb + Add Asset */}
        <div className="flex items-center justify-between">
          <Breadcrumb backHref="/parts" backLabel="Parts" current={part.type} />
          <AddAssetButtonContainer />
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
              {!editing && canPrint && (
                <button
                  onClick={() => onOpenPrint(p.id)}
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
                  onShowConfirm={onShowDeleteConfirm}
                  onConfirm={onDelete}
                  onCancel={onCancelDelete}
                  disabled={deleteBlocked}
                  disabledTitle={
                    deleteBlocked ? "Unlink this part from its device before deleting" : undefined
                  }
                />
              )}
              {!editing ? (
                <button
                  onClick={onStartEdit}
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
          <div className="flex-[3] min-w-0 space-y-5">
            <Section title="Details">
              {editing && form ? (
                <>
                  <EditCombo
                    label="Part Type"
                    value={form.type}
                    options={partTypes}
                    onChange={(v) => onFieldChange("type", v ?? "")}
                    placeholder="e.g. Display"
                    maxLength={50}
                  />
                  <div>
                    <label className={labelCls}>Chapter</label>
                    <select
                      value={form.chapterId}
                      onChange={(e) => onFieldChange("chapterId", Number(e.target.value))}
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
                    onChange={(v) => onFieldChange("wasPurchased", v === "Purchased")}
                  />
                  <EditText
                    label="Description"
                    value={form.description}
                    onChange={(v) => onFieldChange("description", v)}
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
                          onClick={onRemoveDevice}
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
                        onClick={onOpenDevicePicker}
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
                    onChange={(v) => onFieldChange("value", v ? Number(v) : null)}
                    placeholder="e.g. 39.99"
                  />
                  <div>
                    <label className={labelCls}>Acquisition Date</label>
                    <input
                      type="date"
                      value={form.acquisitionDate ?? ""}
                      onChange={(e) => onFieldChange("acquisitionDate", e.target.value || null)}
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
                            onClick={() => onNavigateToDevice(p.containedIn!)}
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
                <ModificationModal
                  entry={entry}
                  fields={buildPartFields(entry)}
                  onClose={onClose}
                />
              )}
            />
          </div>

          <div className="flex-[1] min-w-0 lg:min-w-64 lg:sticky lg:top-20">
            <NotesPaneContainer assetId={part.id} />
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
