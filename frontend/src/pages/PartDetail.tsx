import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { Part } from '../types/inventory'
import NotesPane from '../components/NotesPane'
import { getPart, updatePart } from '../services/partService'
import { useLookups } from '../hooks/useLookups'
import { PrintLabelModal } from '../components/PrintLabelModal'

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

function EditCombo({ label, value, options, onChange, placeholder, maxLength }: {
  label: string; value: string | null; options: string[]
  onChange: (v: string | null) => void; placeholder?: string; maxLength?: number
}) {
  const startsCustom = value !== null && value !== '' && !options.includes(value)
  const [customMode, setCustomMode] = useState(startsCustom)
  const [customText, setCustomText] = useState(startsCustom ? (value ?? '') : '')
  const selectVal = customMode ? '__custom__' : (value ?? '')

  function handleSelect(v: string) {
    if (v === '__custom__') { setCustomMode(true) }
    else if (v === '') { setCustomMode(false); onChange(null) }
    else { setCustomMode(false); onChange(v) }
  }
  function handleCustom(v: string) { setCustomText(v); onChange(v || null) }

  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select value={selectVal} onChange={e => handleSelect(e.target.value)}
        className={`${inputCls} cursor-pointer`}>
        <option value="">—</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        <option value="__custom__">Custom…</option>
      </select>
      {customMode && (
        <input autoFocus type="text" value={customText}
          placeholder={placeholder ?? 'Enter value'} maxLength={maxLength}
          onChange={e => handleCustom(e.target.value)}
          className={`${inputCls} mt-2`} />
      )}
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

export default function PartDetail() {
  const { id } = useParams<{ id: string }>()
  const numId = Number(id)

  const lookups = useLookups()

  const [part, setPart] = useState<Part | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Part | null>(null)
  const [saved, setSaved] = useState(false)
  const [printId, setPrintId] = useState<number | null>(null)

  useEffect(() => {
    getPart(numId)
      .then(p => { setPart(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [numId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!part) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">Part not found</p>
          <p className="text-xs text-slate-400 mt-1">
            No part with ID <span className="font-mono">{id}</span> exists in inventory.
          </p>
        </div>
        <Link to="/parts" className="mt-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
          ← Back to Parts
        </Link>
      </div>
    )
  }

  function startEdit() { setForm({ ...part } as Part); setEditing(true) }
  function cancelEdit() { setEditing(false) }
  async function saveEdit() {
    if (!form) return
    const updated = await updatePart(numId, form)
    setPart(updated); setEditing(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }
  function set(key: keyof Part) {
    return (value: string | number | boolean | null) =>
      setForm(prev => prev ? { ...prev, [key]: value } : prev)
  }

  const p = editing && form ? form : part

  return (
    <>
    {printId !== null && <PrintLabelModal assetId={printId} onClose={() => setPrintId(null)} />}
    <div className="space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/parts" className="hover:text-slate-600 transition-colors">Parts</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">{part.type}</span>
      </div>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl px-8 py-6">
        <div className="flex items-stretch justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-500 uppercase tracking-wide">
                Part
              </span>
              <span className="font-mono text-xs text-slate-400">#{p.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{p.type}</h1>
            <p className="text-sm text-slate-400 mt-1">{p.chapter} · {p.wasPurchased ? 'Purchased' : 'Donated'}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {!editing && (
              <button onClick={() => setPrintId(p.id)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-lg transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print Label
              </button>
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
                <EditCombo label="Part Type" value={form.type} options={lookups.partTypes}
                  onChange={v => set('type')(v ?? '')} placeholder="e.g. Display" maxLength={50} />
                <EditSelect label="Chapter" value={form.chapter} options={lookups.chapters}
                  onChange={set('chapter')} />
                <EditSelect label="Source"
                  value={form.wasPurchased ? 'Purchased' : 'Donated'}
                  options={['Donated', 'Purchased']}
                  onChange={v => set('wasPurchased')(v === 'Purchased')} />
                <EditText label="Description" value={form.description}
                  onChange={set('description')} placeholder="e.g. DDR4 8GB stick" maxLength={500} />
                <div>
                  <label className={labelCls}>Contained In (Device ID)</label>
                  <input
                    type="number" min="0" step="1"
                    value={form.containedIn ?? ''}
                    placeholder="Device ID or leave blank"
                    onKeyDown={e => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                    onChange={e => set('containedIn')(e.target.value ? Number(e.target.value) : null)}
                    className={inputCls}
                  />
                </div>
                <EditText label="Value ($)" type="number"
                  value={String(form.value ?? '')}
                  onChange={v => set('value')(v ? Number(v) : null)}
                  placeholder="e.g. 39.99" />
                <div>
                  <label className={labelCls}>Acquisition Date</label>
                  <input type="date" value={form.acquisitionDate ?? ''}
                    onChange={e => set('acquisitionDate')(e.target.value || null)}
                    className={inputCls} />
                </div>
              </>
            ) : (
              <>
                <Field label="Part Type" value={p.type} />
                <Field label="Chapter" value={p.chapter} />
                <Field label="Source" value={p.wasPurchased ? 'Purchased' : 'Donated'} />
                <Field label="Description" value={p.description} />
                <Field label="Contained In" value={p.containedIn != null ? `#${p.containedIn}` : 'Loose'} />
                <Field label="Value" value={p.value != null && p.value !== 0 ? `$${p.value.toFixed(2)}` : null} />
                <Field label="Acquired" value={formatDate(p.acquisitionDate)} />
              </>
            )}
          </Section>
        </div>

        <div className="flex-[1] min-w-64 sticky top-20">
          <NotesPane assetId={part.id} />
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
