import { useState, useEffect } from 'react'
import { getDevices } from '../services/deviceService'
import { useVisibleChapters } from '../context/ChapterContext'
import ActivityChart from '../components/ActivityChart'
import DeviceValueChart from '../components/DeviceValueChart'
import PageHeading from '../components/PageHeading'
import ChapterTabs from '../components/ChapterTabs'
import AddAssetButton from '../components/AddAssetButton'

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [selectedChapter, setSelectedChapter] = useState<string>('All')
  const [allDevices, setAllDevices] = useState<import('../types/inventory').AnyDevice[]>([])
  const chapters = useVisibleChapters().map(c => c.name)

  useEffect(() => {
    getDevices().then(setAllDevices)
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

  // ── Chapter-level stats (always network-wide, ignores chapter filter) ──────
  const chapterStats = chapters.map(ch => ({
    name:    ch,
    donated: allDevices.filter(d => d.chapter === ch && d.status === 'Donated').length,
    ready:   allDevices.filter(d => d.chapter === ch && d.status === 'Ready To Donate').length,
    working: allDevices.filter(d => d.chapter === ch && (d.status === 'Not Started' || d.status === 'In Progress')).length,
    total:   allDevices.filter(d => d.chapter === ch).length,
  }))
  const activeChapters    = chapterStats.filter(c => c.total > 0)
  const chaptersWithReady = chapterStats.filter(c => c.ready > 0)


  // ── Completion rate (uses filtered devices) ────────────────────────────────
  const nonScrapped    = devices.filter(d => d.status !== 'Scrapped' && d.status !== 'Unknown')
  const completionRate = nonScrapped.length > 0 ? Math.round((donated.length / nonScrapped.length) * 100) : 0

  // ── Avg time in inventory (donated devices with both dates) ───────────────
  const timedDevices = devices.filter(d => d.donatedDate && d.acquisitionDate)
  const avgDays = timedDevices.length > 0
    ? Math.round(
        timedDevices.reduce((sum, d) => {
          const ms = new Date(d.donatedDate!).getTime() - new Date(d.acquisitionDate!).getTime()
          return sum + ms / (1000 * 60 * 60 * 24)
        }, 0) / timedDevices.length
      )
    : null

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeading title="Dashboard" subtitle="Inventory overview by chapter" />
        <div className="flex justify-end">
          <AddAssetButton />
        </div>
      </div>

      {/* Chapter tabs */}
      <ChapterTabs chapters={chapters} selected={selectedChapter} onChange={setSelectedChapter} />

      {/* Pipeline card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">Pipeline</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Not Started',     count: notStarted.length,    bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-400' },
            { label: 'In Progress',     count: inProgress.length,    bg: 'bg-amber-50',  text: 'text-amber-700', dot: 'bg-amber-400' },
            { label: 'Ready to Donate', count: readyToDonate.length, bg: 'bg-green-50',  text: 'text-green-700', dot: 'bg-green-500' },
            { label: 'Donated',         count: donated.length,       bg: 'bg-sky-50',    text: 'text-sky-700',   dot: 'bg-sky-500'   },
          ].map(({ label, count, bg, text, dot }) => (
            <div key={label} className={`rounded-lg p-4 ${bg}`}>
              <div className={`w-2 h-2 rounded-full ${dot} mb-3`} />
              <p className={`text-3xl font-extrabold leading-none ${text}`}>{count}</p>
              <p className={`text-[11px] font-medium mt-2 ${text} opacity-75`}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Device types + Chapter breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Device type breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Device Types</p>
            <span className="text-lg font-extrabold text-heart-blue">{devices.length} total</span>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            {[
              { label: 'Desktops', count: desktops.length, color: 'bg-blue-500'   },
              { label: 'Laptops',  count: laptops.length,  color: 'bg-indigo-500' },
              { label: 'Tablets',  count: tablets.length,  color: 'bg-violet-500' },
            ].map(({ label, count, color }) => (
              <div key={label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">{label}</span>
                  <span className="text-slate-700 font-semibold">
                    {count} <span className="text-slate-400 font-normal">{devices.length ? `${Math.round((count / devices.length) * 100)}%` : '—'}</span>
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all`}
                    style={{ width: devices.length ? `${(count / devices.length) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Avg time in inventory */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Avg Time in Inventory</p>
            <p className="text-[11px] text-slate-400 mt-1">acquisition → donated</p>
          </div>
          <div className="mt-4 flex-1 flex flex-col justify-center">
            {avgDays !== null ? (
              <>
                <p className="text-4xl font-extrabold text-heart-blue leading-none">{avgDays}</p>
                <p className="text-sm text-slate-400 mt-1">days</p>
              </>
            ) : (
              <p className="text-sm text-slate-300 italic">No data yet</p>
            )}
          </div>
          <p className="text-[11px] text-slate-300 mt-4">
            Based on {timedDevices.length} donated device{timedDevices.length !== 1 ? 's' : ''} with both dates recorded
          </p>
        </div>

        {/* Network health */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
          {/* Completion rate */}
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Completion Rate</p>
          <div className="flex-1 flex flex-col justify-center py-3">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-extrabold text-heart-blue leading-none">{completionRate}%</span>
              <span className="text-xs text-slate-400 mb-0.5">{donated.length} of {nonScrapped.length} devices</span>
            </div>
            <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-heart-blue rounded-full transition-all" style={{ width: `${completionRate}%` }} />
            </div>
          </div>

          <div className="border-t border-slate-100 mb-4" />

          {/* Chapter activity */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">Chapters</p>
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Active chapters</span>
                <span className="font-semibold text-slate-800">{activeChapters.length} of {chapters.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Chapters working on devices</span>
                <span className="font-semibold text-amber-600">{chapterStats.filter(c => c.working > 0).length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Chapters with pickups ready</span>
                <span className={`font-semibold ${chaptersWithReady.length > 0 ? 'text-green-600' : 'text-slate-300'}`}>{chaptersWithReady.length}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Activity over time */}
      <ActivityChart devices={devices} />

      {/* Value of donated devices */}
      <DeviceValueChart devices={devices} />

    </div>
  )
}
