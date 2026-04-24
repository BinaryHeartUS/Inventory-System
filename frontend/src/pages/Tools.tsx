import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTools } from '../services/toolService'
import { getChapters } from '../services/lookupService'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Tools() {
  const navigate = useNavigate()
  const [chapterFilter, setChapterFilter] = useState('All')
  const [typeFilter,    setTypeFilter]    = useState('All')

  const [allTools, setAllTools] = useState<import('../types/inventory').Tool[]>([])
  const [chapters, setChapters] = useState<string[]>([])

  useEffect(() => {
    getTools().then(setAllTools)
    getChapters().then(setChapters)
  }, [])

  const toolTypes = useMemo(
    () => Array.from(new Set(allTools.map(t => t.type))).sort(),
    [allTools],
  )

  const filtered = useMemo(() => {
    return allTools.filter(t => {
      if (chapterFilter !== 'All' && t.chapter !== chapterFilter) return false
      if (typeFilter    !== 'All' && t.type    !== typeFilter)    return false
      return true
    })
  }, [chapterFilter, typeFilter, allTools])

  const hasFilters = chapterFilter !== 'All' || typeFilter !== 'All'

  function clearFilters() {
    setChapterFilter('All')
    setTypeFilter('All')
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Tools</h1>
        <p className="text-sm text-slate-400 mt-1">
          {filtered.length === allTools.length
            ? `All ${allTools.length} tools`
            : `${filtered.length} of ${allTools.length} tools`}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all cursor-pointer"
          >
            <option value="All">All Types</option>
            {toolTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={chapterFilter}
            onChange={e => setChapterFilter(e.target.value)}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition-all cursor-pointer"
          >
            <option value="All">All Chapters</option>
            {chapters.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-slate-500 hover:text-slate-700 underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['ID', 'Type', 'Description', 'Chapter', 'Value', 'Acquired'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    No tools match the current filters.{' '}
                    {hasFilters && (
                      <button onClick={clearFilters} className="text-violet-600 hover:underline">
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : filtered.map(t => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/tools/${t.id}`)}
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-400">{t.id}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">
                      {t.type}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate">{t.description}</td>
                  <td className="px-5 py-3.5 text-slate-500">{t.chapter}</td>
                  <td className="px-5 py-3.5 text-slate-700">
                    {t.value != null ? `$${t.value.toFixed(2)}` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">{formatDate(t.acquisitionDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
