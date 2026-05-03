import { useState, useMemo } from 'react'
import type { AnyDevice } from '../types/inventory'
import { renderDeviceRow, DEVICE_TABLE_HEADERS } from '../utils/deviceUtils'

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = 'id' | 'type' | 'manufacturer' | 'model' | 'year' | 'cpu' |
               'ram' | 'storage' | 'status' | 'chapter' | 'acquisitionDate'
type SortDir = 'asc' | 'desc'

const HEADER_SORT: Partial<Record<string, SortKey>> = {
  'ID':       'id',
  'Type':     'type',
  'Brand':    'manufacturer',
  'Model':    'model',
  'Year':     'year',
  'CPU':      'cpu',
  'RAM':      'ram',
  'Storage':  'storage',
  'Status':   'status',
  'Chapter':  'chapter',
  'Acquired': 'acquisitionDate',
}

const STATUS_ORDER: Record<string, number> = {
  'Not Started': 0, 'In Progress': 1, 'Ready To Donate': 2,
  'Donated': 3, 'Scrapped': 4, 'Unknown': 5,
}

function getValue(d: AnyDevice, key: SortKey): string | number | null {
  return (d as unknown as Record<string, unknown>)[key] as string | number | null
}

function compare(a: AnyDevice, b: AnyDevice, key: SortKey, dir: SortDir): number {
  const av = getValue(a, key)
  const bv = getValue(b, key)
  let cmp: number
  if (av == null && bv == null) cmp = 0
  else if (av == null) cmp = 1
  else if (bv == null) cmp = -1
  else if (key === 'status') cmp = (STATUS_ORDER[av as string] ?? 99) - (STATUS_ORDER[bv as string] ?? 99)
  else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
  else cmp = String(av).localeCompare(String(bv))
  return dir === 'asc' ? cmp : -cmp
}

// ─── Sort icon ────────────────────────────────────────────────────────────────

function SortIcon({ col, sortKey, sortDir }: { col: string; sortKey: SortKey | null; sortDir: SortDir }) {
  const key = HEADER_SORT[col]
  if (!key) return null
  const active = sortKey === key
  return (
    <span className={`ml-1 inline-flex flex-col leading-none ${active ? 'text-heart-blue' : 'text-slate-300'}`}>
      <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor"
        className={active && sortDir === 'asc' ? 'text-heart-blue' : 'text-slate-300'}>
        <path d="M4 0L8 5H0L4 0Z"/>
      </svg>
      <svg width="8" height="5" viewBox="0 0 8 5" fill="currentColor" className="mt-0.5"
        style={{ opacity: active && sortDir === 'desc' ? 1 : 0.3 }}>
        <path d="M4 5L0 0H8L4 5Z"/>
      </svg>
    </span>
  )
}

// ─── DeviceList ───────────────────────────────────────────────────────────────

/**
 * Renders a sortable table of devices.
 *
 * - `exclude`: column header names to hide (e.g. `['CPU', 'RAM', 'Storage', 'Details']`)
 * - `onSelect`: if provided, clicking a row calls this instead of navigating to the detail page
 * - `emptyMessage`: content shown when `devices` is empty
 */
export function DeviceList({
  devices,
  exclude = [],
  onSelect,
  emptyMessage = 'No devices found.',
}: {
  devices: AnyDevice[]
  exclude?: string[]
  onSelect?: (id: number) => void
  emptyMessage?: React.ReactNode
}) {
  const [sortKey, setSortKey] = useState<SortKey | null>('id')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const visibleHeaders = DEVICE_TABLE_HEADERS.filter(h => !exclude.includes(h))

  function handleHeaderClick(col: string) {
    const key = HEADER_SORT[col]
    if (!key) return
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    if (!sortKey) return devices
    return [...devices].sort((a, b) => compare(a, b, sortKey, sortDir))
  }, [devices, sortKey, sortDir])

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {visibleHeaders.map(h => {
              const sortable = !!HEADER_SORT[h]
              return (
                <th
                  key={h}
                  onClick={() => handleHeaderClick(h)}
                  className={`px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap select-none ${
                    sortable
                      ? 'text-slate-500 hover:text-slate-800 cursor-pointer'
                      : 'text-slate-400'
                  } ${sortKey === HEADER_SORT[h] ? 'text-heart-blue' : ''}`}
                >
                  <span className="inline-flex items-center">
                    {h}
                    <SortIcon col={h} sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={visibleHeaders.length} className="px-5 py-12 text-center text-sm text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : sorted.map(d => renderDeviceRow(d, exclude, onSelect))}
        </tbody>
      </table>
    </div>
  )
}
