import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getTools } from '../services/toolService'
import { useVisibleChapters } from '../context/ChapterContext'
import { useChapters } from '../context/ChapterContext'
import PageHeading from '../components/PageHeading'

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Tools() {
  const navigate = useNavigate()
  const [chapterFilter, setChapterFilter] = useState('All')

  const [allTools, setAllTools] = useState<import('../types/inventory').Tool[]>([])
  const allChapters = useVisibleChapters()
  const chapters = allChapters.map(c => c.name)
  const { chapterName } = useChapters()

  useEffect(() => {
    getTools().then(setAllTools)
  }, [])

  const filtered = useMemo(() => {
    return allTools.filter(t => {
      if (chapterFilter !== 'All') {
        const ch = allChapters.find(c => c.name === chapterFilter)
        if (!ch || t.chapterId !== ch.id) return false
      }
      return true
    })
  }, [chapterFilter, allTools, allChapters])

  const hasFilters = chapterFilter !== 'All'

  function clearFilters() {
    setChapterFilter('All')
  }

  return (
    <div className="space-y-6">

      <PageHeading
        title="Tools"
        subtitle={filtered.length === allTools.length ? `All ${allTools.length} tools` : `${filtered.length} of ${allTools.length} tools`}
      />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={chapterFilter}
            onChange={e => setChapterFilter(e.target.value)}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all cursor-pointer"
          >
            <option value="All">All Chapters</option>
            {chapters.map(c => <option key={c} value={c}>{c}</option>)}
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
                {['ID', 'Description', 'Chapter', 'Value', 'Acquired'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
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
                      <button onClick={clearFilters} className="text-brand-red hover:underline">
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
                  <td className="px-5 py-5 font-mono text-xs text-slate-400">{t.id}</td>
                  <td className="px-5 py-5 text-slate-600 max-w-xs truncate">{t.description}</td>
                  <td className="px-5 py-5 text-slate-500">{chapterName(t.chapterId)}</td>
                  <td className="px-5 py-5 text-slate-700">
                    {t.value != null ? `$${t.value.toFixed(2)}` : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-5 py-5 text-slate-400 whitespace-nowrap">{formatDate(t.acquisitionDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
