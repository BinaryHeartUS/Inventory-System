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
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden h-full flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && actionTo && (
          <Link
            to={actionTo}
            className="text-sm font-medium text-brand-red hover:text-brand-red-dark transition-colors"
          >
            {action} →
          </Link>
        )}
      </div>
      <div className="flex-1 flex flex-col">
        {children}
      </div>
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

        {/* Status distribution */}
        <SectionCard title="Workflow Status" subtitle="Active devices by pipeline stage">
            <div className="px-6 py-6 flex flex-col justify-between flex-1 gap-6">
              {WORKFLOW_STATUSES.map((status) => {
                const count = workflowCounts[status]
                const pct   = Math.round((count / maxWorkflowCount) * 100)
                const dot   = STATUS_CONFIG[status].dot
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full shrink-0 ${dot}`} />
                        <span className="text-base text-slate-700 font-medium">{status}</span>
                      </div>
                      <span className="text-lg font-bold text-slate-800">{count}</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-4 rounded-full transition-all ${dot}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
        </SectionCard>

        {/* Device type mix */}
        <SectionCard title="Device Types" subtitle="Breakdown by form factor">
          <div className="px-6 py-6 flex flex-col justify-between flex-1 gap-6">
            {([
              { label: 'Desktops', count: desktops.length, bar: 'bg-heart-blue' },
              { label: 'Laptops',  count: laptops.length,  bar: 'bg-blue-500'   },
              { label: 'Tablets',  count: tablets.length,  bar: 'bg-teal-500'   },
            ] as const).map(({ label, count, bar }) => {
              const pct = devices.length > 0 ? Math.round((count / devices.length) * 100) : 0
              return (
                <div key={label}>
                  <div className="flex justify-between mb-3">
                    <span className="text-base font-medium text-slate-700">{label}</span>
                    <span className="text-lg font-bold text-slate-800">
                      {count} <span className="text-slate-400 font-normal text-sm">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-4 rounded-full transition-all ${bar}`}
                      style={{ width: `${Math.round((count / maxTypeCount) * 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </SectionCard>

      </div>

    </div>
  )
}
