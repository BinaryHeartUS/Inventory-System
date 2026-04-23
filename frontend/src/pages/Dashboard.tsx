import { useState } from 'react'
import type { AnyDevice, Part } from '../types/inventory'
import { renderDeviceRow, DEVICE_TABLE_HEADERS } from '../utils/deviceUtils'

// ─── Mock data (reflects real schema) ────────────────────────────────────────

const RECENT_DEVICES: AnyDevice[] = [
  { id: 1000, type: 'Laptop',  manufacturer: 'Dell',   model: 'Latitude 5420',  year: 2021, cpu: 'i5-1135G7',         ram: 16, ramGeneration: 'DDR4', storage: 256,  storageType: 'SSD',           status: 'Ready To Donate', chapter: 'Austin',      acquisitionDate: 'Apr 22, 2026', includesCharger: 'Included',     designBatteryCapacity: 68000, actualBatteryCapacity: 53720, batteryHealth: 0.79 },
  { id: 1001, type: 'Desktop', manufacturer: 'HP',     model: 'ProDesk 400 G6', year: 2020, cpu: 'i7-10700',          ram: 32, ramGeneration: 'DDR4', storage: 512,  storageType: 'SSD',           status: 'In Progress',     chapter: 'Houston',     acquisitionDate: 'Apr 21, 2026', hasWifi: false },
  { id: 1002, type: 'Tablet',  manufacturer: 'Apple',  model: 'iPad 9th Gen',   year: 2021, cpu: null,                ram: 3,  ramGeneration: null,   storage: 64,   storageType: 'Flash Storage', status: 'Donated',         chapter: 'Dallas',      acquisitionDate: 'Apr 20, 2026', includesCharger: 'Included',     workingBattery: 'Yes' },
  { id: 1003, type: 'Laptop',  manufacturer: 'Lenovo', model: 'ThinkPad T14',   year: 2022, cpu: 'Ryzen 5 Pro 5650U', ram: 16, ramGeneration: 'DDR4', storage: 512,  storageType: 'SSD',           status: 'Not Started',     chapter: 'San Antonio', acquisitionDate: 'Apr 19, 2026', includesCharger: 'Not Included', designBatteryCapacity: 57000, actualBatteryCapacity: 50160, batteryHealth: 0.88 },
  { id: 1004, type: 'Desktop', manufacturer: 'Apple',  model: 'iMac 21.5"',     year: 2019, cpu: 'i5-8500',           ram: 8,  ramGeneration: 'DDR4', storage: 1024, storageType: 'HDD',           status: 'Scrapped',        chapter: 'Austin',      acquisitionDate: 'Apr 18, 2026', hasWifi: true },
]

const RECENT_PARTS: Part[] = [
  { id: 2000, type: 'SODIMM', description: 'DDR4 8GB stick',   chapter: 'Austin',  wasPurchased: false, containedIn: null, acquisitionDate: 'Apr 22, 2026' },
  { id: 2001, type: 'M2 SSD', description: '256GB NVMe drive', chapter: 'Houston', wasPurchased: true,  containedIn: null, acquisitionDate: 'Apr 20, 2026' },
  { id: 2002, type: 'HDD',    description: 'SATA 1TB 2.5"',    chapter: 'Dallas',  wasPurchased: false, containedIn: null, acquisitionDate: 'Apr 18, 2026' },
]

const STAT_CARDS = [
  { label: 'Total Devices',   value: '—', note: 'all chapters',   highlight: true },
  { label: 'Desktops',        value: '—', note: 'in inventory'    },
  { label: 'Laptops',         value: '—', note: 'in inventory'    },
  { label: 'Tablets',         value: '—', note: 'in inventory'    },
  { label: 'Ready To Donate', value: '—', note: 'awaiting pickup' },
  { label: 'Donated',         value: '—', note: 'all time'        },
]

const CHAPTERS = ['Austin', 'Houston', 'Dallas', 'San Antonio']

// ─── Dashboard-local components ──────────────────────────────────────────────

function SectionCard({ title, subtitle, action, children }: {
  title: string
  subtitle?: string
  action?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && (
          <button className="text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors">
            {action} →
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [selectedChapter, setSelectedChapter] = useState<string>('All')

  const filteredDevices = selectedChapter === 'All'
    ? RECENT_DEVICES
    : RECENT_DEVICES.filter((d) => d.chapter === selectedChapter)

  const filteredParts = selectedChapter === 'All'
    ? RECENT_PARTS
    : RECENT_PARTS.filter((p) => p.chapter === selectedChapter)

  return (
    <div className="space-y-6">

      {/* Page heading + chapter filter */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Overview of all inventory across chapters</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="chapter-filter" className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Chapter
          </label>
          <select
            id="chapter-filter"
            value={selectedChapter}
            onChange={(e) => setSelectedChapter(e.target.value)}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all cursor-pointer"
          >
            <option value="All">All Chapters</option>
            {CHAPTERS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAT_CARDS.map(({ label, value, note, highlight }) => (
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

      {/* Recent devices */}
      <SectionCard
        title={selectedChapter === 'All' ? 'Recent Devices' : `Devices — ${selectedChapter}`}
        subtitle="Latest assets added to inventory"
        action="View all"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {DEVICE_TABLE_HEADERS.map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDevices.length === 0 ? (
                <tr><td colSpan={DEVICE_TABLE_HEADERS.length} className="px-5 py-8 text-center text-sm text-slate-400">No devices for this chapter</td></tr>
              ) : filteredDevices.map(renderDeviceRow)}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Recent parts */}
      <SectionCard
        title={selectedChapter === 'All' ? 'Recent Parts' : `Parts — ${selectedChapter}`}
        subtitle="Loose components available for repair"
        action="View all"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Type', 'Description', 'Chapter', 'Source', 'Acquired'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParts.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-sm text-slate-400">No parts for this chapter</td></tr>
              ) : filteredParts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{p.id}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                      {p.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">{p.description}</td>
                  <td className="px-5 py-3.5 text-slate-500">{p.chapter}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium ${p.wasPurchased ? 'text-amber-600' : 'text-green-600'}`}>
                      {p.wasPurchased ? 'Purchased' : 'Donated'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{p.acquisitionDate ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

    </div>
  )
}
