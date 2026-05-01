import { useState, useEffect } from 'react'
import { getAllLookups } from '../services/lookupService'
import PageHeading from '../components/PageHeading'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LookupSection {
  title: string
  description: string
  endpoint: string
  key: 'manufacturers' | 'ramGenerations' | 'storageTypes' | 'partTypes' | 'toolTypes'
}

const LOOKUP_SECTIONS: LookupSection[] = [
  {
    title:       'Manufacturers',
    description: 'Device manufacturer names used across desktops, laptops, and tablets.',
    endpoint:    'POST /api/lookup/manufacturers',
    key:         'manufacturers',
  },
  {
    title:       'RAM Generations',
    description: 'RAM type options (e.g. DDR4, LPDDR5) available when logging device specs.',
    endpoint:    'POST /api/lookup/ram-generations',
    key:         'ramGenerations',
  },
  {
    title:       'Storage Types',
    description: 'Storage media types (e.g. SSD, HDD, NVMe) used in device specs.',
    endpoint:    'POST /api/lookup/storage-types',
    key:         'storageTypes',
  },
  {
    title:       'Part Types',
    description: 'Part category names used when logging spare parts.',
    endpoint:    'POST /api/lookup/part-types',
    key:         'partTypes',
  },
  {
    title:       'Tool Types',
    description: 'Tool category names used when logging tools.',
    endpoint:    'POST /api/lookup/tool-types',
    key:         'toolTypes',
  },
]

// ─── Lookup table editor ──────────────────────────────────────────────────────

function LookupEditor({ section }: { section: LookupSection }) {
  const [values,  setValues]  = useState<string[]>([])
  const [input,   setInput]   = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    getAllLookups()
      .then(data => setValues(data[section.key] ?? []))
      .catch(() => {})
  }, [section.key])

  function add() {
    const trimmed = input.trim()
    if (!trimmed || values.map(v => v.toLowerCase()).includes(trimmed.toLowerCase())) return
    setValues(prev => [...prev, trimmed])
    setInput('')
    setPending(true)
  }

  function remove(value: string) {
    setValues(prev => prev.filter(v => v !== value))
    setPending(true)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 mb-1">
        <div>
          <p className="text-sm font-semibold text-slate-800">{section.title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{section.description}</p>
        </div>
        {pending && (
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
            Unsaved — backend pending
          </span>
        )}
      </div>

      <p className="text-[10px] font-mono text-slate-300 mb-4">{section.endpoint}</p>

      {/* Current values */}
      <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
        {values.map(v => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
          >
            {v}
            <button
              onClick={() => remove(v)}
              className="text-slate-400 hover:text-red-500 transition-colors leading-none"
              aria-label={`Remove ${v}`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </span>
        ))}
        {values.length === 0 && (
          <span className="text-xs text-slate-300 italic">No values — add one below</span>
        )}
      </div>

      {/* Add input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={`Add a ${section.title.toLowerCase().replace(/s$/, '')}…`}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue"
        />
        <button
          onClick={add}
          disabled={!input.trim()}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-heart-blue text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Add
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Settings() {
  return (
    <div className="space-y-8">

      <PageHeading title="Settings" subtitle="Manage lookup values and application configuration" />

      {/* Notice */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <svg className="text-amber-500 shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <div>
          <p className="text-sm font-semibold text-amber-800">Backend endpoints not yet connected</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Changes made here are local and will reset on refresh until the corresponding API endpoints are implemented.
            Values shown are the current application defaults.
          </p>
        </div>
      </div>

      {/* Lookup tables */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Lookup Tables</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            These values populate dropdowns throughout the app. Stored in their own database tables and shared across all chapters.
          </p>
        </div>
        {LOOKUP_SECTIONS.map(section => (
          <LookupEditor key={section.title} section={section} />
        ))}
      </section>

    </div>
  )
}
