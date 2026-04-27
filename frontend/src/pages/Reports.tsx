import { useState, useEffect } from 'react'
import { getDevices } from '../services/deviceService'
import { getParts } from '../services/partService'
import { getTools } from '../services/toolService'
import { getChapters } from '../services/lookupService'
import type { AnyDevice, Part, Tool } from '../types/inventory'

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function escapeCsvCell(value: string | number | null | undefined): string {
  const s = String(value ?? '')
  return `"${s.replace(/"/g, '""')}"`
}

function downloadCsv(filename: string, header: string[], rows: (string | number | null | undefined)[][]) {
  const lines = [
    header.map(escapeCsvCell).join(','),
    ...rows.map(r => r.map(escapeCsvCell).join(',')),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, '-')
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ExportCard({
  title, icon, description, count, colorText, colorBg, onExport,
}: {
  title: string
  icon: React.ReactNode
  description: string
  count: number
  colorText: string
  colorBg: string
  onExport: () => void
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
      <div className={`w-9 h-9 ${colorBg} ${colorText} rounded-lg flex items-center justify-center mb-3 shrink-0`}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-800">{title} Export</p>
      <p className="text-xs text-slate-400 mt-1 flex-1">{description}</p>
      <button
        onClick={onExport}
        disabled={count === 0}
        className={`mt-4 w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
          count > 0
            ? `${colorBg} ${colorText} hover:opacity-80`
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        {count > 0 ? `Download CSV (${count} rows)` : 'No data to export'}
      </button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Reports() {
  const [allDevices, setAllDevices] = useState<AnyDevice[]>([])
  const [allParts,   setAllParts]   = useState<Part[]>([])
  const [allTools,   setAllTools]   = useState<Tool[]>([])
  const [chapters,   setChapters]   = useState<string[]>([])
  const [chapter,    setChapter]    = useState('All')

  useEffect(() => {
    Promise.all([getDevices(), getParts(), getTools(), getChapters()])
      .then(([d, p, t, c]) => { setAllDevices(d); setAllParts(p); setAllTools(t); setChapters(c) })
  }, [])

  const devices = chapter === 'All' ? allDevices : allDevices.filter(d => d.chapter === chapter)
  const parts   = chapter === 'All' ? allParts   : allParts.filter(p => p.chapter === chapter)
  const tools   = chapter === 'All' ? allTools   : allTools.filter(t => t.chapter === chapter)

  const donated     = devices.filter(d => d.status === 'Donated').length
  const inProgress  = devices.filter(d => d.status === 'Not Started' || d.status === 'In Progress').length
  const ready       = devices.filter(d => d.status === 'Ready To Donate').length
  const scrapped    = devices.filter(d => d.status === 'Scrapped').length
  const nonScrapped = devices.filter(d => d.status !== 'Scrapped' && d.status !== 'Unknown').length
  const completion  = nonScrapped > 0 ? Math.round((donated / nonScrapped) * 100) : 0

  const chapterSlug = slugify(chapter === 'All' ? 'all-chapters' : chapter)

  function exportDevices() {
    downloadCsv(`devices-${chapterSlug}-${today()}.csv`,
      ['ID', 'Type', 'Manufacturer', 'Model', 'Year', 'CPU', 'RAM (GB)', 'RAM Generation',
       'Storage (GB)', 'Storage Type', 'Status', 'Chapter', 'Acquisition Date', 'Value ($)'],
      devices.map(d => [
        d.id, d.type, d.manufacturer, d.model, d.year, d.cpu,
        d.ram, d.ramGeneration, d.storage, d.storageType,
        d.status, d.chapter, d.acquisitionDate, d.value,
      ])
    )
  }

  function exportParts() {
    downloadCsv(`parts-${chapterSlug}-${today()}.csv`,
      ['ID', 'Type', 'Description', 'Chapter', 'Source', 'Contained In Device', 'Acquisition Date', 'Value ($)'],
      parts.map(p => [
        p.id, p.type, p.description, p.chapter,
        p.wasPurchased ? 'Purchased' : 'Donated',
        p.containedIn, p.acquisitionDate, p.value,
      ])
    )
  }

  function exportTools() {
    downloadCsv(`tools-${chapterSlug}-${today()}.csv`,
      ['ID', 'Type', 'Description', 'Chapter', 'Acquisition Date', 'Value ($)'],
      tools.map(t => [t.id, t.type, t.description, t.chapter, t.acquisitionDate, t.value])
    )
  }

  function exportDonated() {
    const donated = devices.filter(d => d.status === 'Donated')
    downloadCsv(`donated-devices-${chapterSlug}-${today()}.csv`,
      ['ID', 'Type', 'Manufacturer', 'Model', 'Year', 'CPU', 'RAM (GB)', 'Storage (GB)', 'Storage Type', 'Chapter', 'Acquisition Date'],
      donated.map(d => [d.id, d.type, d.manufacturer, d.model, d.year, d.cpu, d.ram, d.storage, d.storageType, d.chapter, d.acquisitionDate])
    )
  }

  return (
    <div className="space-y-6">

      <div className="border-l-4 border-brand-red pl-3">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
        <p className="text-base text-slate-400 mt-1">Export inventory data and view summary statistics</p>
      </div>

      {/* Chapter filter */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {(['All', ...chapters]).map(ch => (
          <button
            key={ch}
            onClick={() => setChapter(ch)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              chapter === ch
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {ch === 'All' ? 'All Chapters' : ch}
          </button>
        ))}
      </div>

      {/* Summary stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Summary — {chapter === 'All' ? 'All Chapters' : chapter}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Devices', value: devices.length,  color: 'text-heart-blue'  },
            { label: 'In Pipeline',   value: inProgress,      color: 'text-amber-600'   },
            { label: 'Ready',         value: ready,           color: 'text-green-600'   },
            { label: 'Donated',       value: donated,         color: 'text-sky-600'     },
            { label: 'Scrapped',      value: scrapped,        color: 'text-red-500'     },
            { label: 'Completion',    value: `${completion}%`,color: 'text-slate-700'   },
          ].map(({ label, value, color }) => (
            <div key={label} className="border-l-2 border-slate-100 pl-3 first:border-0 first:pl-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
              <p className={`text-2xl font-extrabold leading-none ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export cards */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">CSV Exports</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <ExportCard
            title="All Devices"
            description="Every device including type, specs, status, chapter, and acquisition info."
            count={devices.length}
            colorText="text-indigo-600"
            colorBg="bg-indigo-50"
            onExport={exportDevices}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
              </svg>
            }
          />

          <ExportCard
            title="Donated Devices"
            description="Devices with Donated status only — useful for grant and impact reporting."
            count={devices.filter(d => d.status === 'Donated').length}
            colorText="text-sky-600"
            colorBg="bg-sky-50"
            onExport={exportDonated}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/>
                <line x1="12" y1="22" x2="12" y2="7"/>
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
              </svg>
            }
          />

          <ExportCard
            title="Parts"
            description="All parts — type, description, source, and which device each belongs to."
            count={parts.length}
            colorText="text-emerald-600"
            colorBg="bg-emerald-50"
            onExport={exportParts}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
              </svg>
            }
          />

          <ExportCard
            title="Tools"
            description="All tools in inventory with type, description, and acquisition info."
            count={tools.length}
            colorText="text-orange-600"
            colorBg="bg-orange-50"
            onExport={exportTools}
            icon={
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
            }
          />

        </div>
      </div>

    </div>
  )
}
