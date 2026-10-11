import type { Misc, PartySummary } from "../../types/inventory";
import type { MiscChangelogEntry } from "../../types/changelog";
import NotesPaneContainer from "../../containers/NotesPaneContainer";
import { PartyPickerModalContainer } from "../../containers/PartyPickerModalContainer";
import UnsavedChangesGuard from "../../containers/UnsavedChangesGuard";
import AddAssetButtonContainer from "../../containers/AddAssetButtonContainer";
import { Breadcrumb } from "../Breadcrumb";
import { DeleteConfirmButton } from "../DeleteConfirmButton";
import { EditText } from "../EditField";
import { Field } from "../Field";
import { ModificationLog } from "../ModificationLog";
import { ModificationModal } from "../ModificationModal";
import { Section } from "../Section";
import { buildMiscFields } from "../../utils/changelogFields";
import { formatDate } from "../../utils/dateUtils";
import { inputCls, labelCls } from "../../utils/formStyles";

export default function MiscDetailView({
  asset,
  editing,
  form,
  saved,
  isDirty,
  canEdit,
  canDelete,
  linkedParty,
  editParty,
  partyPickerOpen,
  showDeleteConfirm,
  changelog,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onFieldChange,
  onOpenPartyPicker,
  onSelectParty,
  onCancelPartyPicker,
  onShowDeleteConfirm,
  onCancelDelete,
}: {
  asset: Misc;
  editing: boolean;
  form: Misc | null;
  saved: boolean;
  isDirty: boolean;
  canEdit: boolean;
  canDelete: boolean;
  linkedParty: PartySummary | null;
  editParty: PartySummary | null;
  partyPickerOpen: boolean;
  showDeleteConfirm: boolean;
  changelog: MiscChangelogEntry[];
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onFieldChange: (key: keyof Misc, value: string | number | null) => void;
  onOpenPartyPicker: () => void;
  onSelectParty: (party: PartySummary) => void;
  onCancelPartyPicker: () => void;
  onShowDeleteConfirm: () => void;
  onCancelDelete: () => void;
}) {
  const current = editing && form ? form : asset;

  return (
    <>
      <UnsavedChangesGuard when={isDirty} />
      {partyPickerOpen && (
        <PartyPickerModalContainer onSelect={onSelectParty} onCancel={onCancelPartyPicker} />
      )}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Breadcrumb backHref="/search" backLabel="Search" current={asset.description} />
          <AddAssetButtonContainer />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 uppercase tracking-wide">
                  Misc
                </span>
                <span className="font-mono text-xs text-slate-400">#{current.id}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{current.description}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-3 sm:shrink-0">
              {!editing && canDelete && (
                <DeleteConfirmButton
                  noun="misc asset"
                  showing={showDeleteConfirm}
                  onShowConfirm={onShowDeleteConfirm}
                  onConfirm={onDelete}
                  onCancel={onCancelDelete}
                />
              )}
              {!editing && canEdit && (
                <button
                  onClick={onStartEdit}
                  className="text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue-dark px-4 py-2.5 rounded-lg transition-colors"
                >
                  Edit
                </button>
              )}
              {editing && (
                <>
                  <button
                    onClick={onCancelEdit}
                    className="text-sm font-medium text-slate-600 px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onSaveEdit}
                    className="text-sm font-medium text-white bg-brand-red hover:bg-brand-red-dark px-4 py-2.5 rounded-lg"
                  >
                    Save changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="flex-[3] min-w-0 space-y-5">
            <Section title="Details">
              {editing && form ? (
                <>
                  <EditText
                    label="Description"
                    value={form.description}
                    onChange={(value) => onFieldChange("description", value)}
                    maxLength={500}
                  />
                  <EditText
                    label="Value ($)"
                    type="number"
                    value={String(form.value)}
                    onChange={(value) =>
                      onFieldChange("value", value === "" ? null : Number(value))
                    }
                  />
                  <div>
                    <label className={labelCls}>Acquisition Date</label>
                    <input
                      type="date"
                      value={form.acquisitionDate ?? ""}
                      onChange={(event) =>
                        onFieldChange("acquisitionDate", event.target.value || null)
                      }
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Donor *</label>
                    {editParty ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-sm text-slate-800">{editParty.name}</span>
                        <button
                          type="button"
                          onClick={onOpenPartyPicker}
                          className="ml-auto text-xs font-medium text-heart-blue hover:underline"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenPartyPicker}
                        className="w-full text-left text-sm text-slate-500 border border-slate-200 border-dashed rounded-lg px-3 py-2 hover:border-heart-blue hover:text-heart-blue"
                      >
                        Select donor
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Field label="Description" value={current.description} />
                  <Field label="Value" value={`$${current.value.toFixed(2)}`} />
                  <Field label="Acquired" value={formatDate(current.acquisitionDate)} />
                  <Field label="Donor" value={linkedParty?.name ?? null} />
                </>
              )}
            </Section>

            <ModificationLog
              entries={changelog}
              detailRenderer={(entry, onClose) => (
                <ModificationModal
                  entry={entry}
                  fields={buildMiscFields(entry)}
                  onClose={onClose}
                />
              )}
            />
          </div>
          <div className="flex-[1] min-w-0 lg:min-w-64 lg:sticky lg:top-20">
            <NotesPaneContainer assetId={asset.id} />
          </div>
        </div>

        {saved && (
          <div className="fixed bottom-6 right-6 px-4 py-3 bg-green-600 text-white rounded-xl shadow-lg text-sm font-medium z-50">
            Changes saved
          </div>
        )}
      </div>
    </>
  );
}
