import { useState, useEffect, useMemo } from 'react'
import type { AnyDevice } from '../types/inventory'
import { getDevices } from '../services/deviceService'
import { DeviceList } from './DeviceList'
import { useWritableChapters } from '../context/ChapterContext'

const EXCLUDE_COLS = ['Type', 'CPU', 'RAM', 'Storage', 'Status', 'Details', 'Acquired']

/**
 * Modal overlay that lets the user pick a device from their writable chapters.
 * Shows ID, Brand, Model, Year, and Chapter columns only.
 *
 * `onSelect` receives the full device object; `onCancel` closes the modal.
 */
export function DevicePickerModal({
  onSelect,
  onCancel,
  chapterName,
}: {
  onSelect: (device: AnyDevice) => void
  onCancel: () => void
  chapterName?: string
}) {
  const writableChapters = useWritableChapters()
  const [allDevices, setAllDevices] = useState<AnyDevice[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDevices()
      .then(d => { setAllDevices(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const writableChapterNames = useMemo(
    () => new Set(writableChapters.map(c => c.name)),
    [writableChapters],
  )

  const filtered = useMemo(() => {
    const base = allDevices.filter(d => {
      if (d.chapter == null || !writableChapterNames.has(d.chapter)) return false
      if (chapterName !== undefined && d.chapter !== chapterName) return false
      return true
    })
    if (!search.trim()) return base
    const s = search.toLowerCase()
    return base.filter(d =>
      String(d.id).includes(s) ||
      (d.manufacturer ?? '').toLowerCase().includes(s) ||
      (d.model ?? '').toLowerCase().includes(s) ||
      (d.chapter ?? '').toLowerCase().includes(s) ||
      String(d.year).includes(s),
    )
  }, [allDevices, search, writableChapterNames, chapterName])

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Select a Device</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {chapterName
                ? <>Showing devices in <span className="font-medium text-slate-600">{chapterName}</span> — click a row to link this part to that device</>
                : 'Click a row to link this part to that device'}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-slate-100 shrink-0">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              autoFocus
              type="text"
              value={search}
              placeholder="Filter by ID, brand, model, chapter…"
              onChange={e => setSearch(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            </div>
          ) : (
            <DeviceList
              devices={filtered}
              exclude={EXCLUDE_COLS}
              onSelect={id => {
                const device = allDevices.find(d => d.id === id)
                if (device) onSelect(device)
              }}
              emptyMessage={
                search
                  ? 'No devices match your search.'
                  : 'No devices available in your writable chapters.'
              }
            />
          )}
        </div>

      </div>
    </div>
  )
}
