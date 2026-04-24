import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { DeviceStatus } from '../types/inventory'
import { STATUS_CONFIG } from '../components/StatusBadge'
import { getDevices } from '../services/deviceService'
import { getChapters } from '../services/lookupService'

// ─── Constants ────────────────────────────────────────────────────────────────

// Active workflow stages only — Donated is a lifetime cumulative stat, Scrapped is a dead end
const WORKFLOW_STATUSES: DeviceStatus[] = [
  'Not Started', 'In Progress', 'Ready To Donate',
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, action, actionTo, children }: {
  title: string
  subtitle?: string
  action?: string
  actionTo?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && actionTo && (
          <Link
            to={actionTo}
            className="text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors"
          >
            {action} →
          </Link>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [selectedChapter, setSelectedChapter] = useState<string>('All')
  const [allDevices, setAllDevices] = useState<import('../types/inventory').AnyDevice[]>([])
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
  const scrapped      = devices.filter(d => d.status === 'Scrapped')

  const desktops = devices.filter(d => d.type === 'Desktop')
  const laptops  = devices.filter(d => d.type === 'Laptop')
  const tablets  = devices.filter(d => d.type === 'Tablet')

  const workflowCounts: Record<DeviceStatus, number> = {
    'Not Started':     notStarted.length,
    'In Progress':     inProgress.length,
    'Ready To Donate': readyToDonate.length,
    'Donated':         donated.length,
    'Scrapped':        scrapped.length,
    'Unknown':         devices.filter(d => d.status === 'Unknown').length,
  }

  // Scale bar chart against active states only
  const maxWorkflowCount = Math.max(
    notStarted.length, inProgress.length, readyToDonate.length, 1
  )
  const maxTypeCount = Math.max(desktops.length, laptops.length, tablets.length, 1)

  return (
    <div className="space-y-6">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-1">Inventory overview by chapter</p>
      </div>

      {/* Chapter tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit flex-wrap">
        {(['All', ...chapters] as string[]).map((ch) => (
          <button
            key={ch}
            onClick={() => setSelectedChapter(ch)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              selectedChapter === ch
                ? 'bg-white text-slate-900 shadow-sm'
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
            className={`rounded-xl p-5 ${
              highlight
                ? 'bg-violet-600 shadow-lg shadow-violet-200'
                : 'bg-white border border-slate-200'
            }`}
          >
            <p className={`text-[11px] font-semibold uppercase tracking-wider ${
              highlight ? 'text-violet-200' : 'text-slate-400'
            }`}>
              {label}
            </p>
            <p className={`text-3xl font-extrabold mt-2 leading-none ${
              highlight ? 'text-white' : 'text-slate-900'
            }`}>
              {value}
            </p>
            <p className={`text-xs mt-2 ${
              highlight ? 'text-violet-300' : 'text-slate-400'
            }`}>
              {note}
            </p>
          </div>
        ))}
      </div>

      {/* Analysis row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Status distribution */}
        <div className="lg:col-span-2">
          <SectionCard title="Workflow Status" subtitle="Active devices — excludes donated (lifetime stat)">
            <div className="px-6 py-6 space-y-5">
              {WORKFLOW_STATUSES.map((status) => {
                const count = workflowCounts[status]
                const pct   = Math.round((count / maxWorkflowCount) * 100)
                const dot   = STATUS_CONFIG[status].dot
                return (
                  <div key={status} className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5 w-40 shrink-0">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
                      <span className="text-sm text-slate-700">{status}</span>
                    </div>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all ${dot}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-800 w-6 text-right shrink-0">
                      {count}
                    </span>
                  </div>
                )
              })}
            </div>
          </SectionCard>
        </div>

        {/* Device type mix */}
        <SectionCard title="Device Types" subtitle="Breakdown by form factor">
          <div className="px-6 py-6 space-y-6">
            {([
              { label: 'Desktops', count: desktops.length, bar: 'bg-violet-500' },
              { label: 'Laptops',  count: laptops.length,  bar: 'bg-blue-500'   },
              { label: 'Tablets',  count: tablets.length,  bar: 'bg-teal-500'   },
            ] as const).map(({ label, count, bar }) => {
              const pct = devices.length > 0 ? Math.round((count / devices.length) * 100) : 0
              return (
                <div key={label}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                    <span className="text-sm font-bold text-slate-800">
                      {count} <span className="text-slate-400 font-normal text-xs">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all ${bar}`}
                      style={{ width: `${Math.round((count / maxTypeCount) * 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>

      </div>

      {/* Chapter breakdown — only in All Chapters view */}
      {selectedChapter === 'All' && (
        <SectionCard title="Chapter Summary" subtitle="Device counts by status for each chapter">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Chapter', 'Total', 'Not Started', 'In Progress', 'Ready to Donate', 'Donated', 'Scrapped'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chapters.map((ch) => {
                  const chDevices    = allDevices.filter(d => d.chapter === ch)
                  const chNotStarted = chDevices.filter(d => d.status === 'Not Started')
                  const chInProgress = chDevices.filter(d => d.status === 'In Progress')
                  const chReady      = chDevices.filter(d => d.status === 'Ready To Donate')
                  const chDonated    = chDevices.filter(d => d.status === 'Donated')
                  const chScrapped   = chDevices.filter(d => d.status === 'Scrapped')
                  return (
                    <tr key={ch} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900">{ch}</td>
                      <td className="px-5 py-3.5 text-slate-700">{chDevices.length}</td>
                      <td className="px-5 py-3.5">
                        {chNotStarted.length > 0
                          ? <span className="text-slate-600 font-medium">{chNotStarted.length}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {chInProgress.length > 0
                          ? <span className="text-amber-600 font-medium">{chInProgress.length}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {chReady.length > 0
                          ? <span className="text-green-600 font-medium">{chReady.length}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {chDonated.length > 0
                          ? <span className="text-blue-600 font-medium">{chDonated.length}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {chScrapped.length > 0
                          ? <span className="text-red-500 font-medium">{chScrapped.length}</span>
                          : <span className="text-slate-300">—</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

    </div>
  )
}
