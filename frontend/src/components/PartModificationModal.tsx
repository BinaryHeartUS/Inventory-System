import type { PartChangelogEntry } from '../types/changelog'
import { formatDate } from '../utils/dateUtils'

function fmtText(v: string | null | undefined): string | null {
  return v ?? null
}
function fmtDate(v: string | null | undefined): string | null {
  return formatDate(v ?? null)
}
function fmtMoney(v: number | null | undefined): string | null {
  return v != null ? `$${v.toFixed(2)}` : null
}
function fmtBool(v: boolean | null | undefined): string | null {
  return v != null ? (v ? 'Yes' : 'No') : null
}
function fmtId(v: number | null | undefined): string | null {
  return v != null ? `#${v}` : null
}

interface FieldDef {
  label: string
  old: string | null
  new: string | null
}

function buildFields(entry: PartChangelogEntry): FieldDef[] {
  return [
    { label: 'Type',             old: fmtText(entry.oldType),                 new: fmtText(entry.newType) },
    { label: 'Description',      old: fmtText(entry.oldDescription),          new: fmtText(entry.newDescription) },
    { label: 'Was Purchased',    old: fmtBool(entry.oldWasPurchased),         new: fmtBool(entry.newWasPurchased) },
    { label: 'Contained In',     old: fmtId(entry.oldContainedIn),            new: fmtId(entry.newContainedIn) },
    { label: 'Acquisition Date', old: fmtDate(entry.oldAcquisitionDate),      new: fmtDate(entry.newAcquisitionDate) },
    { label: 'Value',            old: fmtMoney(entry.oldValue),               new: fmtMoney(entry.newValue) },
    { label: 'Chapter ID',       old: fmtId(entry.oldChapterID ?? undefined), new: fmtId(entry.newChapterID ?? undefined) },
    { label: 'Donor ID',         old: fmtId(entry.oldDonorID ?? undefined),   new: fmtId(entry.newDonorID ?? undefined) },
  ]
}

function SnapshotView({ fields, valueKey }: { fields: FieldDef[]; valueKey: 'old' | 'new' }) {
  const visible = fields.filter(f => f[valueKey] != null)
  if (visible.length === 0) return <p className="text-sm text-slate-400">No field data recorded.</p>
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {visible.map(f => (
        <div key={f.label}>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{f.label}</p>
          <p className="text-sm text-slate-800">{f[valueKey]}</p>
        </div>
      ))}
    </div>
  )
}

function DiffView({ fields }: { fields: FieldDef[] }) {
  const changed = fields.filter(f => f.old !== f.new)
  if (changed.length === 0) return <p className="text-sm text-slate-400">No tracked field changes recorded.</p>
  return (
    <div className="divide-y divide-slate-100">
      {changed.map(f => (
        <div key={f.label} className="grid grid-cols-2 gap-4 py-3">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{f.label} (before)</p>
            <p className="text-sm text-slate-700">{f.old ?? <span className="text-slate-300">&#8212;</span>}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{f.label} (after)</p>
            <p className="text-sm text-slate-700">{f.new ?? <span className="text-slate-300">&#8212;</span>}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PartModificationModal({
  entry,
  onClose,
}: {
  entry: PartChangelogEntry
  onClose: () => void
}) {
  const fields = buildFields(entry)
  const changeType = entry.changeType ?? ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">

        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Change Details</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Asset <span className="font-mono">#{entry.assetId}</span>
              {' · '}{changeType}
              {' · '}{formatDate(entry.modifiedAt ?? null) ?? '—'}
              {' · '}{entry.modifiedBy ?? '—'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 shrink-0 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          {changeType === 'Insert' && <SnapshotView fields={fields} valueKey="new" />}
          {changeType === 'Delete' && <SnapshotView fields={fields} valueKey="old" />}
          {changeType === 'Update' && <DiffView fields={fields} />}
          {changeType !== 'Insert' && changeType !== 'Delete' && changeType !== 'Update' && (
            <DiffView fields={fields} />
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
