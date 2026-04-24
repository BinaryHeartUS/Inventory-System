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

      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Chapters</h1>
        <p className="text-sm text-slate-400 mt-1">{chapters.length} active chapters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {chapters.map(ch => {
          const devices  = allDevices.filter(d => d.chapter === ch)
          const parts    = allParts.filter(p => p.chapter === ch)
          const tools    = allTools.filter(t => t.chapter === ch)
          const pipeline = devices.filter(d => d.status === 'Not Started' || d.status === 'In Progress')
          const ready    = devices.filter(d => d.status === 'Ready To Donate')
          const donated  = devices.filter(d => d.status === 'Donated')
          const scrapped = devices.filter(d => d.status === 'Scrapped')

          return (
            <div key={ch} className="bg-white border border-slate-200 rounded-xl p-6">

              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h2 className="text-base font-bold text-slate-900">{ch}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Texas</p>
                </div>
                <span className="px-2.5 py-1 bg-violet-50 text-violet-700 text-xs font-semibold rounded-full">
                  {devices.length} devices
                </span>
              </div>

              {/* Status summary */}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {[
                  { label: 'Pipeline', value: pipeline.length, color: 'text-amber-600', bg: 'bg-amber-50'  },
                  { label: 'Ready',    value: ready.length,    color: 'text-green-700', bg: 'bg-green-50'  },
                  { label: 'Donated',  value: donated.length,  color: 'text-blue-700',  bg: 'bg-blue-50'   },
                  { label: 'Scrapped', value: scrapped.length, color: 'text-red-600',   bg: 'bg-red-50'    },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-lg p-3 text-center`}>
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className={`text-[11px] font-medium mt-0.5 ${color} opacity-75`}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex gap-4 text-xs text-slate-500">
                  <span>
                    {devices.filter(d => d.type === 'Desktop').length}D ·{' '}
                    {devices.filter(d => d.type === 'Laptop').length}L ·{' '}
                    {devices.filter(d => d.type === 'Tablet').length}T
                  </span>
                  <span>{parts.length} parts</span>
                  <span>{tools.length} tools</span>
                </div>
                <Link
                  to={`/devices`}
                  className="text-xs font-medium text-violet-600 hover:text-violet-800 transition-colors"
                >
                  View devices →
                </Link>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
