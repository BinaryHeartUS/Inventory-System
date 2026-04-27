import { useState, useMemo, useEffect } from 'react'
import { getDevices } from '../services/deviceService'
import { getChapters } from '../services/lookupService'
import { renderDeviceRow, DEVICE_TABLE_HEADERS } from '../utils/deviceUtils'
import PageHeading from '../components/PageHeading'

export default function Donations() {
  const [chapterFilter, setChapterFilter] = useState('All')
  const [allDevices, setAllDevices] = useState<import('../types/inventory').AnyDevice[]>([])
  const [chapters,   setChapters]   = useState<string[]>([])

  useEffect(() => {
    getDevices().then(setAllDevices)
    getChapters().then(setChapters)
  }, [])

  const donated = useMemo(() => {
    const base = allDevices.filter(d => d.status === 'Donated')
    return chapterFilter === 'All' ? base : base.filter(d => d.chapter === chapterFilter)
  }, [chapterFilter, allDevices])

  const totalDonated = allDevices.filter(d => d.status === 'Donated').length

  return (
    <div className="space-y-6">

      <PageHeading
        title="Donations"
        subtitle={donated.length === totalDonated
          ? `${totalDonated} devices donated all time`
          : `${donated.length} of ${totalDonated} donated devices`}
        compact
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {chapters.map(ch => {
          const count = allDevices.filter(d => d.status === 'Donated' && d.chapter === ch).length
          return (
            <div key={ch} className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{ch}</p>
              <p className="text-3xl font-extrabold mt-2 text-slate-900">{count}</p>
              <p className="text-xs text-slate-400 mt-2">donated</p>
            </div>
          )
        })}
      </div>

      {/* Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <select
          value={chapterFilter}
          onChange={e => setChapterFilter(e.target.value)}
          className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all cursor-pointer"
        >
          <option value="All">All Chapters</option>
          {chapters.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {DEVICE_TABLE_HEADERS.map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {donated.length === 0
                ? <tr>
                    <td colSpan={DEVICE_TABLE_HEADERS.length} className="px-5 py-12 text-center text-sm text-slate-400">
                      No donations recorded{chapterFilter !== 'All' ? ` for ${chapterFilter}` : ''}.
                    </td>
                  </tr>
                : donated.map(renderDeviceRow)}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
