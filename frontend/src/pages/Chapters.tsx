import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { AnyDevice, Part, Tool } from '../types/inventory'
import { getDevices } from '../services/deviceService'
import { getParts } from '../services/partService'
import { getTools } from '../services/toolService'
import { useVisibleChapters, useIsNationalAdmin, useChapters } from '../context/ChapterContext'
import { createChapter } from '../services/chapterService'
import PageHeading from '../components/PageHeading'

export default function Chapters() {
  const visibleChapters = useVisibleChapters()
  const { refreshChapters } = useChapters()
  const isNationalAdmin = useIsNationalAdmin()
  const [allDevices, setAllDevices] = useState<AnyDevice[]>([])
  const [allParts,   setAllParts]   = useState<Part[]>([])
  const [allTools,   setAllTools]   = useState<Tool[]>([])

  const [showModal,   setShowModal]   = useState(false)
  const [newName,     setNewName]     = useState('')
  const [creating,    setCreating]    = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getDevices(), getParts(), getTools()])
      .then(([devs, pts, tls]) => {
        setAllDevices(devs); setAllParts(pts); setAllTools(tls)
      })
  }, [])

  function openModal() {
    setNewName('')
    setCreateError(null)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setNewName('')
    setCreateError(null)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) {
      setCreateError('Chapter name must not be blank.')
      return
    }
    setCreating(true)
    setCreateError(null)
    try {
      await createChapter(trimmed)
      refreshChapters()
      closeModal()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setCreateError(msg || 'Failed to create chapter. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">

      <div className="flex items-start justify-between">
        <PageHeading title="Chapters" subtitle={`Inventory summary across all ${visibleChapters.length} chapters`} />
        {isNationalAdmin && (
          <button
            onClick={openModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-red text-white text-sm font-semibold hover:bg-brand-red-dark transition-colors"
          >
            <span className="text-lg leading-none">+</span> New Chapter
          </button>
        )}
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
            {visibleChapters.map(ch => {
              const devices  = allDevices.filter(d => d.chapter === ch.name)
              const parts    = allParts.filter(p => p.chapterId === ch.id)
              const tools    = allTools.filter(t => t.chapterId === ch.id)
              const pipeline = devices.filter(d => d.status === 'Not Started' || d.status === 'In Progress').length
              const ready    = devices.filter(d => d.status === 'Ready To Donate').length
              const donated  = devices.filter(d => d.status === 'Donated').length
              const scrapped = devices.filter(d => d.status === 'Scrapped').length
              return (
                <tr key={ch.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-semibold text-slate-900 text-base">{ch.name}</p>
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
                    <Link to={`/devices?chapter=${encodeURIComponent(ch.name)}`} className="text-sm font-semibold text-brand-red hover:text-brand-red-dark transition-colors">
                      View →
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-1">New Chapter</h2>
            <p className="text-sm text-slate-400 mb-5">Enter the name for the new chapter.</p>
            <form onSubmit={handleCreate} noValidate>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                Chapter Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="e.g. Purdue University"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                autoFocus
              />
              {createError && (
                <p className="mt-2 text-sm text-red-600">{createError}</p>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-lg bg-brand-red text-white text-sm font-semibold hover:bg-brand-red-dark transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating…' : 'Create Chapter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
