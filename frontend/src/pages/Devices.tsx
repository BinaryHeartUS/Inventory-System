import { useState, useMemo, useEffect } from 'react'
import type { AnyDevice, DeviceStatus } from '../types/inventory'
import { renderDeviceRow, DEVICE_TABLE_HEADERS } from '../utils/deviceUtils'
import { getDevices } from '../services/deviceService'
import { useVisibleChapters } from '../context/ChapterContext'
import PageHeading from '../components/PageHeading'

// ─── Types ────────────────────────────────────────────────────────────────────

const DEVICE_TYPES = ['All', 'Desktop', 'Laptop', 'Tablet'] as const
type DeviceTypeFilter = typeof DEVICE_TYPES[number]

const STATUS_OPTIONS: Array<DeviceStatus | 'All'> = [
  'All', 'Not Started', 'In Progress', 'Ready To Donate', 'Donated', 'Scrapped',
]

type SortKey = 'id' | 'type' | 'manufacturer' | 'model' | 'year' | 'cpu' |
               'ram' | 'storage' | 'status' | 'chapter' | 'acquisitionDate'
type SortDir = 'asc' | 'desc'

/** Maps column header labels to their sort key. Absent entries are not sortable. */
const HEADER_SORT: Partial<Record<string, SortKey>> = {
  'ID':           'id',
  'Type':         'type',
  'Manufacturer': 'manufacturer',
  'Model':        'model',
  'Year':         'year',
  'CPU':          'cpu',
  'RAM':          'ram',
  'Storage':      'storage',
  'Status':       'status',
  'Chapter':      'chapter',
  'Acquired':     'acquisitionDate',
}

// ─── Sort helpers ─────────────────────────────────────────────────────────────

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
  else if (typeof av === 'number' && typeof bv === 'number') cmp = av - bv
  else cmp = String(av).localeCompare(String(bv))
  return dir === 'asc' ? cmp : -cmp
}

// ─── Sort indicator icon ──────────────────────────────────────────────────────

function SortIcon({ col, sortKey, sortDir }: {
  col: string; sortKey: SortKey | null; sortDir: SortDir
}) {
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Devices() {
  const [search,        setSearch]        = useState('')
  const [typeFilter,    setTypeFilter]    = useState<DeviceTypeFilter>('All')
  const [statusFilter,  setStatusFilter]  = useState<DeviceStatus | 'All'>('All')
  const [chapterFilter, setChapterFilter] = useState<string>('All')
  const [sortKey,       setSortKey]       = useState<SortKey | null>('id')
  const [sortDir,       setSortDir]       = useState<SortDir>('asc')

  const [allDevices, setAllDevices] = useState<AnyDevice[]>([])
  const chapters = useVisibleChapters().map(c => c.name)

  useEffect(() => {
    getDevices().then(setAllDevices)
  }, [])

  function handleHeaderClick(col: string) {
    const key = HEADER_SORT[col]
    if (!key) return
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    return allDevices.filter(d => {
      if (typeFilter    !== 'All' && d.type    !== typeFilter)    return false
      if (statusFilter  !== 'All' && d.status  !== statusFilter)  return false
      if (chapterFilter !== 'All' && d.chapter !== chapterFilter) return false
      if (search.trim()) {
        const s = search.trim().toLowerCase()
        return (
          String(d.id).includes(s)                     ||
          d.manufacturer.toLowerCase().includes(s)     ||
          d.model.toLowerCase().includes(s)            ||
          (d.cpu?.toLowerCase().includes(s) ?? false)  ||
          d.chapter.toLowerCase().includes(s)
        )
      }
      return true
    })
  }, [search, typeFilter, statusFilter, chapterFilter, allDevices])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => compare(a, b, sortKey, sortDir))
  }, [filtered, sortKey, sortDir])

  const total = allDevices.length
  const hasFilters =
    search !== '' || typeFilter !== 'All' ||
    statusFilter !== 'All' || chapterFilter !== 'All'

  function clearFilters() {
    setSearch('')
    setTypeFilter('All')
    setStatusFilter('All')
    setChapterFilter('All')
  }

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <PageHeading
        title="Devices"
        subtitle={sorted.length === total ? `All ${total} devices` : `${sorted.length} of ${total} devices`}
      />

      {/* Filter bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">

          {/* Search — matches ID, manufacturer, model, CPU, chapter */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="ID, manufacturer, model, CPU…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue w-72 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as DeviceStatus | 'All')}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all cursor-pointer"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>

          <select
            value={chapterFilter}
            onChange={e => setChapterFilter(e.target.value)}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all cursor-pointer"
          >
            <option value="All">All Chapters</option>
            {chapters.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-brand-red hover:text-brand-red-dark underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Type pills */}
        <div className="flex gap-1.5">
          {DEVICE_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                typeFilter === t
                  ? 'bg-brand-red text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
              }`}
            >
              {t === 'All' ? 'All Types' : t}
            </button>
          ))}
        </div>
      </div>

      {/* Device table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {DEVICE_TABLE_HEADERS.map(h => {
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
                  <td colSpan={DEVICE_TABLE_HEADERS.length}
                    className="px-5 py-12 text-center text-sm text-slate-400">
                    No devices match the current filters.{' '}
                    {hasFilters && (
                      <button onClick={clearFilters} className="text-brand-red hover:underline">
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : sorted.map(renderDeviceRow)}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
