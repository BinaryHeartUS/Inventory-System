import { useState } from 'react'

const CHECKLIST_ITEMS = [
  'Powers on',
  'Display output',
  'SSD Installed',
  'OS Installed',
  'Network connection works',
  'Device Cleaned',
  'Device Information Updated In Inventory',
] as const

export function ReadyToDonateFormModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void
  onCancel: () => void
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(CHECKLIST_ITEMS.map(item => [item, false]))
  )

  const allChecked = CHECKLIST_ITEMS.every(item => checked[item])

  function toggle(item: string) {
    setChecked(prev => ({ ...prev, [item]: !prev[item] }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Ready to Donate Checklist</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              All items must be confirmed before marking this device as Ready to Donate.
            </p>
          </div>
          <button
            onClick={onCancel}
            className="ml-4 shrink-0 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Checklist */}
        <div className="px-6 py-5 space-y-3">
          {CHECKLIST_ITEMS.map(item => (
            <label key={item} className="flex items-center gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={checked[item]}
                onChange={() => toggle(item)}
                className="w-4 h-4 rounded border-slate-300 text-heart-blue accent-heart-blue cursor-pointer"
              />
              <span className={`relative text-sm transition-colors ${checked[item] ? 'text-slate-500' : 'text-slate-700'}`}>
                {item}
                {checked[item] && (
                  <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-px bg-slate-400 pointer-events-none" />
                )}
              </span>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onCancel}
            className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!allChecked}
            className="text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue-dark disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}
