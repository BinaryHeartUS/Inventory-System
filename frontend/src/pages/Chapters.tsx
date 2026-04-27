import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { AnyDevice, Part, Tool } from '../types/inventory'
import { getDevices } from '../services/deviceService'
import { getParts } from '../services/partService'
import { getTools } from '../services/toolService'
import { getChapters } from '../services/lookupService'

export default function Chapters() {
  const [chapters,   setChapters]   = useState<string[]>([])
  const [allDevices, setAllDevices] = useState<AnyDevice[]>([])
  const [allParts,   setAllParts]   = useState<Part[]>([])
  const [allTools,   setAllTools]   = useState<Tool[]>([])

  useEffect(() => {
    Promise.all([getChapters(), getDevices(), getParts(), getTools()])
      .then(([chs, devs, pts, tls]) => {
        setChapters(chs); setAllDevices(devs); setAllParts(pts); setAllTools(tls)
      })
  }, [])

  return (
    <div className="space-y-6">

      <div className="border-l-4 border-brand-red pl-3">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chapters</h1>
        <p className="text-base text-slate-400 mt-1">Inventory summary across all {chapters.length} chapters</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Chapter</th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Total</th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Pipeline</th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Ready</th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Donated</th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Scrapped</th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Parts</th>
              <th className="text-right px-4 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Tools</th>
              <th className="px-4 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {chapters.map(ch => {
              const devices  = allDevices.filter(d => d.chapter === ch)
              const parts    = allParts.filter(p => p.chapter === ch)
              const tools    = allTools.filter(t => t.chapter === ch)
              const pipeline = devices.filter(d => d.status === 'Not Started' || d.status === 'In Progress').length
              const ready    = devices.filter(d => d.status === 'Ready To Donate').length
              const donated  = devices.filter(d => d.status === 'Donated').length
              const scrapped = devices.filter(d => d.status === 'Scrapped').length
              return (
                <tr key={ch} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-900 text-base">{ch}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {devices.filter(d => d.type === 'Desktop').length}D ·{' '}
                      {devices.filter(d => d.type === 'Laptop').length}L ·{' '}
                      {devices.filter(d => d.type === 'Tablet').length}T
                    </p>
                  </td>
                  <td className="px-4 py-5 text-right">
                    <span className="text-base font-bold text-slate-900">{devices.length}</span>
                  </td>
                  <td className="px-4 py-5 text-right">
                    <span className={`text-base font-semibold ${pipeline > 0 ? 'text-amber-600' : 'text-slate-300'}`}>{pipeline}</span>
                  </td>
                  <td className="px-4 py-5 text-right">
                    <span className={`text-base font-semibold ${ready > 0 ? 'text-green-600' : 'text-slate-300'}`}>{ready}</span>
                  </td>
                  <td className="px-4 py-5 text-right">
                    <span className={`text-base font-semibold ${donated > 0 ? 'text-sky-600' : 'text-slate-300'}`}>{donated}</span>
                  </td>
                  <td className="px-4 py-5 text-right">
                    <span className={`text-base font-semibold ${scrapped > 0 ? 'text-red-500' : 'text-slate-300'}`}>{scrapped}</span>
                  </td>
                  <td className="px-4 py-5 text-right text-slate-500 font-medium">{parts.length}</td>
                  <td className="px-4 py-5 text-right text-slate-500 font-medium">{tools.length}</td>
                  <td className="px-4 py-5 text-right">
                    <Link to="/devices" className="text-sm font-semibold text-brand-red hover:text-brand-red-dark transition-colors">
                      View →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}
