import { useState, useEffect } from 'react'
import { getDevices } from '../services/deviceService'
import { getChapters } from '../services/lookupService'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [selectedChapter, setSelectedChapter] = useState<string>('All')
  const [allDevices, setAllDevices] = useState<AnyDevice[]>([])
  const [chapters,   setChapters]   = useState<string[]>([])

  useEffect(() => {
    getDevices().then(setAllDevices)
    getChapters().then(setChapters)
  }, [])

  // ── Filtered data ──────────────────────────────────────────────────────────
  const devices = selectedChapter === 'All'
    ? allDevices
    : allDevices.filter(d => d.chapter === selectedChapter)

  // ── Derived counts ─────────────────────────────────────────────────────────
  const notStarted    = devices.filter(d => d.status === 'Not Started')
  const inProgress    = devices.filter(d => d.status === 'In Progress')
  const readyToDonate = devices.filter(d => d.status === 'Ready To Donate')
  const donated       = devices.filter(d => d.status === 'Donated')

  const desktops = devices.filter(d => d.type === 'Desktop')
  const laptops  = devices.filter(d => d.type === 'Laptop')
  const tablets  = devices.filter(d => d.type === 'Tablet')


  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-base text-slate-400 mt-1">Inventory overview by chapter</p>
      </div>

      {/* Chapter tabs */}
      <div className="flex gap-1.5 bg-slate-100 p-1.5 rounded-2xl w-fit flex-wrap">
        {(['All', ...chapters] as string[]).map((ch) => (
          <button
            key={ch}
            onClick={() => setSelectedChapter(ch)}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              selectedChapter === ch
                ? 'bg-white text-brand-red shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {ch === 'All' ? 'All Chapters' : ch}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {[
          { label: 'Total Devices',   value: devices.length,         note: `${desktops.length}D · ${laptops.length}L · ${tablets.length}T`, highlight: true },
          { label: 'Not Started',     value: notStarted.length,      note: 'awaiting triage'   },
          { label: 'In Progress',     value: inProgress.length,      note: 'being refurbished' },
          { label: 'Ready to Donate', value: readyToDonate.length,   note: 'awaiting pickup'   },
          { label: 'Donated',         value: donated.length,         note: 'all time'          },
        ].map(({ label, value, note, highlight }) => (
          <div
            key={label}
            className={`rounded-2xl p-6 ${
              highlight
                ? 'bg-heart-blue shadow-lg shadow-blue-200'
                : 'bg-white border border-slate-200'
            }`}
          >
            <p className={`text-xs font-semibold uppercase tracking-wider ${
              highlight ? 'text-blue-200' : 'text-slate-400'
            }`}>
              {label}
            </p>
            <p className={`text-4xl font-extrabold mt-3 leading-none ${
              highlight ? 'text-white' : 'text-slate-900'
            }`}>
              {value}
            </p>
            <p className={`text-sm mt-3 ${
              highlight ? 'text-blue-200' : 'text-slate-400'
            }`}>
              {note}
            </p>
          </div>
        ))}
      </div>

      {/* Analysis row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

      </div>

    </div>
  )
}
