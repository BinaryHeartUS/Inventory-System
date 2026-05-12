import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import type { Tool } from '../types/inventory'
import NotesPane from '../components/NotesPane'
import { getTool, updateTool, deleteTool } from '../services/toolService'
import { useChapters, useVisibleChapters, useWritableChapters } from '../context/ChapterContext'
import { useToast } from '../context/ToastContext'
import { PrintLabelModal } from '../components/PrintLabelModal'
import { PartyPickerModal } from '../components/PartyPickerModal'
import type { PartySummary } from '../types/inventory'
import { getParty } from '../services/partyService'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
      <p className="text-sm text-slate-800">{value ?? <span className="text-slate-300">—</span>}</p>
    </div>
  )
}

const inputCls = 'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white'
const labelCls = 'text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block'

function EditText({ label, value, onChange, type = 'text', placeholder, maxLength }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; maxLength?: number
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} maxLength={maxLength}
        onChange={e => onChange(e.target.value)} className={inputCls} />
    </div>
  )
}

function EditSelect<T extends string>({ label, value, options, onChange }: {
  label: string; value: T; options: T[]; onChange: (v: T) => void
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value as T)}
        className={`${inputCls} cursor-pointer`}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      </div>
      <div className="px-6 py-6 grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-8">
        {children}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ToolDetail() {
  const { id } = useParams<{ id: string }>()
  const numId = Number(id)
  const navigate = useNavigate()

  const { chapterName } = useChapters()
  const visibleChapters = useVisibleChapters()
  const writableChapters = useWritableChapters()

  const [tool, setTool] = useState<Tool | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Tool | null>(null)
  const [saved, setSaved] = useState(false)
  const [printId, setPrintId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const { showToast } = useToast()
  const [linkedParty, setLinkedParty] = useState<PartySummary | null>(null)
  const [editParty, setEditParty] = useState<PartySummary | null>(null)
  const [partyPickerOpen, setPartyPickerOpen] = useState(false)

  useEffect(() => {
    getTool(numId)
      .then(t => { setTool(t); setLoading(false) })
      .catch(() => setLoading(false))
  }, [numId])

  useEffect(() => {
    if (tool?.donorId != null) {
      getParty(tool.donorId).then(setLinkedParty).catch(() => setLinkedParty(null))
    } else {
      setLinkedParty(null)
    }
  }, [tool?.donorId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!tool) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">Tool not found</p>
          <p className="text-xs text-slate-400 mt-1">
            No tool with ID <span className="font-mono">{id}</span> exists in inventory.
          </p>
        </div>
        <Link to="/tools" className="mt-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
          ← Back to Tools
        </Link>
      </div>
    )
  }

  function startEdit() { setForm({ ...tool } as Tool); setEditParty(linkedParty); setEditing(true) }
  function cancelEdit() { setEditing(false); setEditParty(null) }
  async function saveEdit() {
    if (!form) return
    try {
      const updated = await updateTool(numId, form)
      setTool(updated); setEditing(false); setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Save failed', false)
    }
  }
  async function handleDelete() {
    try {
      await deleteTool(numId)
      navigate('/tools')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Delete failed', false)
      setShowDeleteConfirm(false)
    }
  }
  function set(key: keyof Tool) {
    return (value: string | number | null) =>
      setForm(prev => prev ? { ...prev, [key]: value } : prev)
  }

  const canDelete = writableChapters.some(c => c.id === tool.chapterId)

  const t = editing && form ? form : tool

  return (
    <>
    {printId !== null && <PrintLabelModal assetId={printId} onClose={() => setPrintId(null)} />}
    {partyPickerOpen && (
      <PartyPickerModal
        onSelect={party => {
          setEditParty(party)
          setForm(prev => prev ? { ...prev, donorId: party.id } : prev)
          setPartyPickerOpen(false)
        }}
        onCancel={() => setPartyPickerOpen(false)}
      />
    )}
    <div className="space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/tools" className="hover:text-slate-600 transition-colors">Tools</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">{tool.description}</span>
      </div>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl px-8 py-6">
        <div className="flex items-stretch justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-500 uppercase tracking-wide">
                Tool
              </span>
              <span className="font-mono text-xs text-slate-400">#{t.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{t.description}</h1>
            <p className="text-sm text-slate-400 mt-1">{chapterName(t.chapterId)}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!editing && (
              <button onClick={() => setPrintId(t.id)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-lg transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print Label
              </button>
            )}
            {!editing && canDelete && (
              showDeleteConfirm ? (
                <>
                  <span className="text-xs text-slate-500">Delete this tool?</span>
                  <button onClick={handleDelete}
                    className="text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-lg transition-colors">
                    Confirm
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)}
                    className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                </>
              ) : (
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-lg transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Delete
                </button>
              )
            )}
            {!editing ? (
              <button onClick={startEdit}
                className="flex items-center gap-2 text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue-dark px-4 py-2.5 rounded-lg transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
            ) : (
              <>
                <button onClick={cancelEdit}
                  className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={saveEdit}
                  className="text-sm font-medium text-white bg-brand-red hover:bg-brand-red-dark px-4 py-2.5 rounded-lg transition-colors">
                  Save changes
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Two-column body */}
      <div className="flex gap-5 items-start">

        <div className="flex-[3] min-w-0 space-y-5">
          <Section title="Details">
            {editing && form ? (
              <>
                <EditSelect label="Chapter" value={chapterName(form.chapterId)} options={visibleChapters.map(c => c.name)}
                  onChange={(v: string) => setForm(prev => prev ? { ...prev, chapterId: visibleChapters.find(c => c.name === v)?.id ?? prev.chapterId } : prev)} />
                <EditText label="Description" value={form.description}
                  onChange={v => set('description')(v)}
                  placeholder="e.g. Arctic MX-4 4g tube" maxLength={500} />
                <EditText label="Value ($)" type="number"
                  value={String(form.value ?? '')}
                  onChange={v => set('value')(v ? Number(v) : null)}
                  placeholder="e.g. 12.00" />
                <div>
                  <label className={labelCls}>Acquisition Date</label>
                  <input type="date" value={form.acquisitionDate ?? ''}
                    onChange={e => set('acquisitionDate')(e.target.value || null)}
                    className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Donor</label>
                  {editParty ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                      <span className="text-sm text-slate-800">{editParty.name}</span>
                      <span className="text-xs text-slate-400">· {editParty.type}</span>
                      <button type="button"
                        onClick={() => { setEditParty(null); setForm(prev => prev ? { ...prev, donorId: null } : prev) }}
                        className="ml-auto text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
                        title="Remove donor">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setPartyPickerOpen(true)}
                      className="flex items-center gap-2 w-full text-sm text-slate-500 border border-slate-200 border-dashed rounded-lg px-3 py-2 hover:border-heart-blue hover:text-heart-blue hover:bg-heart-blue/5 transition-all">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                      Select donor (optional)
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <Field label="Chapter" value={chapterName(t.chapterId)} />
                <Field label="Description" value={t.description} />
                <Field label="Value" value={t.value != null && t.value !== 0 ? `$${t.value.toFixed(2)}` : null} />
                <Field label="Acquired" value={formatDate(t.acquisitionDate)} />
                <Field label="Donor" value={linkedParty?.name ?? null} />
              </>
            )}
          </Section>
        </div>

        <div className="flex-[1] min-w-64 sticky top-20">
          <NotesPane assetId={tool.id} />
        </div>

      </div>

      {saved && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 bg-green-600 text-white rounded-xl shadow-lg text-sm font-medium z-50">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Changes saved
        </div>
      )}

    </div>
    </>
  )
}
