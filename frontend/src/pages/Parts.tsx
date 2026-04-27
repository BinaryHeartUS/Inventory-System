import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getParts } from '../services/partService'
import { useVisibleChapters } from '../context/ChapterContext'
import PageHeading from '../components/PageHeading'

export default function Parts() {
  const navigate = useNavigate()
  const [chapterFilter, setChapterFilter] = useState('All')
  const [typeFilter,    setTypeFilter]    = useState('All')
  const [sourceFilter,  setSourceFilter]  = useState<'All' | 'Donated' | 'Purchased'>('All')

  const [allParts,  setAllParts]  = useState<import('../types/inventory').Part[]>([])
  const chapters = useVisibleChapters().map(c => c.name)

  useEffect(() => {
    getParts().then(setAllParts)
  }, [])

  const partTypes = useMemo(
    () => Array.from(new Set(allParts.map(p => p.type))).sort(),
    [allParts],
  )

  const filtered = useMemo(() => {
    return allParts.filter(p => {
      if (chapterFilter !== 'All' && p.chapter !== chapterFilter) return false
      if (typeFilter    !== 'All' && p.type    !== typeFilter)    return false
      if (sourceFilter  === 'Donated'   && p.wasPurchased)  return false
      if (sourceFilter  === 'Purchased' && !p.wasPurchased) return false
      return true
    })
  }, [chapterFilter, typeFilter, sourceFilter, allParts])

  const hasFilters = chapterFilter !== 'All' || typeFilter !== 'All' || sourceFilter !== 'All'

  function clearFilters() {
    setChapterFilter('All')
    setTypeFilter('All')
    setSourceFilter('All')
  }

  return (
    <div className="space-y-6">

      <PageHeading
        title="Parts"
        subtitle={filtered.length === allParts.length ? `All ${allParts.length} parts` : `${filtered.length} of ${allParts.length} parts`}
      />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all cursor-pointer"
          >
            <option value="All">All Types</option>
            {partTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={chapterFilter}
            onChange={e => setChapterFilter(e.target.value)}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all cursor-pointer"
          >
            <option value="All">All Chapters</option>
            {chapters.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value as typeof sourceFilter)}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all cursor-pointer"
          >
            <option value="All">All Sources</option>
            <option value="Donated">Donated</option>
            <option value="Purchased">Purchased</option>
          </select>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-brand-red hover:text-brand-red-dark underline underline-offset-2 transition-colors"
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
                {['ID', 'Type', 'Description', 'Chapter', 'Source', 'Contained In', 'Acquired'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">
                    No parts match the current filters.{' '}
                    {hasFilters && (
                      <button onClick={clearFilters} className="text-brand-red hover:underline">
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : filtered.map(p => (
                <tr key={p.id} onClick={() => navigate(`/parts/${p.id}`)} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-5 py-5 font-mono text-xs text-slate-400">{p.id}</td>
                  <td className="px-5 py-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                      {p.type}
                    </span>
                  </td>
                  <td className="px-5 py-5 text-slate-700">{p.description}</td>
                  <td className="px-5 py-5 text-slate-500">{p.chapter}</td>
                  <td className="px-5 py-5">
                    <span className={`text-sm font-medium ${p.wasPurchased ? 'text-slate-500' : 'text-green-600'}`}>
                      {p.wasPurchased ? 'Purchased' : 'Donated'}
                    </span>
                  </td>
                  <td className="px-5 py-5">
                    {p.containedIn != null
                      ? <span className="font-mono text-xs text-heart-blue">#{p.containedIn}</span>
                      : <span className="text-slate-300 text-xs">Loose</span>}
                  </td>
                  <td className="px-5 py-5 text-slate-400 whitespace-nowrap">{p.acquisitionDate ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
