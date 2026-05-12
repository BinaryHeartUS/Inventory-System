import { useState, useEffect } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeading from '../components/PageHeading'
import {
  getParties, getParty, createPerson, updatePerson, createOrg, updateOrg,
} from '../services/partyService'
import type { PartySummary, PersonDetail, OrgDetail } from '../types/inventory'
import { formatLocation } from '../types/inventory'

// ─── Style constants ──────────────────────────────────────────────────────────
const inputCls =
  'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none ' +
  'focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white'
const labelCls = 'text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block'

// ─── Address sub-form (shared) ────────────────────────────────────────────────
function AddressFields({
  street, city, state, zipCode, country,
  setStreet, setCity, setState, setZipCode, setCountry,
}: {
  street: string; city: string; state: string; zipCode: string; country: string
  setStreet: (v: string) => void; setCity: (v: string) => void
  setState: (v: string) => void; setZipCode: (v: string) => void; setCountry: (v: string) => void
}) {
  return (
    <>
      <div className="col-span-2">
        <label className={labelCls}>Street</label>
        <input value={street} onChange={e => setStreet(e.target.value)} maxLength={100} placeholder="123 Main St" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>City</label>
        <input value={city} onChange={e => setCity(e.target.value)} maxLength={50} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>State</label>
        <input value={state} onChange={e => setState(e.target.value)} maxLength={50} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>ZIP</label>
        <input value={zipCode} onChange={e => setZipCode(e.target.value.replace(/\D/g, ''))} maxLength={20} inputMode="numeric" className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>Country</label>
        <input value={country} onChange={e => setCountry(e.target.value)} maxLength={50} className={inputCls} />
      </div>
    </>
  )
}

// ─── Individual edit / create panel ──────────────────────────────────────────
function PersonPanel({ partyId, onClose, onSaved }: {
  partyId: number | 'new'
  onClose: () => void
  onSaved: () => void
}) {
  const isNew = partyId === 'new'
  const [loading, setLoading]   = useState(!isNew)
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [street, setStreet]     = useState('')
  const [city, setCity]         = useState('')
  const [state, setState]       = useState('')
  const [zipCode, setZipCode]   = useState('')
  const [country, setCountry]   = useState('')
  const [showAddr, setShowAddr] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    if (isNew) return
    getParty(partyId as number)
      .then(detail => {
        const p = detail as PersonDetail
        setName(p.name)
        setEmail(p.email ?? '')
        const loc = p.location
        if (loc) {
          setStreet(loc.street ?? ''); setCity(loc.city ?? '')
          setState(loc.state ?? ''); setZipCode(loc.zipCode ?? '')
          setCountry(loc.country ?? ''); setShowAddr(true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [isNew, partyId])

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true); setError(null)
    const location = (street || city || state || zipCode || country)
      ? formatLocation({ street, city, state, zipCode, country }) : undefined
    const req = {
      name: name.trim(),
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(location ? { location } : {}),
    }
    try {
      if (isNew) { await createPerson(req) } else { await updatePerson(partyId as number, req) }
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {isNew ? 'New Individual' : 'Edit Individual'}
        </p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      {loading ? <p className="text-sm text-slate-400">Loading…</p> : (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Name <span className="text-red-400">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={50} placeholder="Full name" className={inputCls} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" className={inputCls} />
          </div>
          <div className="col-span-2">
            <button type="button" onClick={() => setShowAddr(v => !v)}
              className="flex items-center gap-1.5 text-xs text-heart-blue hover:underline">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {showAddr ? <line x1="5" y1="12" x2="19" y2="12"/> : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
              </svg>
              {showAddr ? 'Hide address' : 'Address (optional)'}
            </button>
          </div>
          {showAddr && <AddressFields street={street} city={city} state={state} zipCode={zipCode} country={country}
            setStreet={setStreet} setCity={setCity} setState={setState} setZipCode={setZipCode} setCountry={setCountry} />}
          {error && <p className="col-span-2 text-xs text-red-500">{error}</p>}
          <div className="col-span-2 flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={!name.trim() || saving}
              className="px-4 py-2 text-sm font-medium text-white bg-heart-blue rounded-lg hover:bg-heart-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {saving ? 'Saving…' : isNew ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Organization edit / create panel ────────────────────────────────────────
function OrgPanel({ partyId, onClose, onSaved }: {
  partyId: number | 'new'
  onClose: () => void
  onSaved: () => void
}) {
  const isNew = partyId === 'new'
  const [loading, setLoading]           = useState(!isNew)
  const [name, setName]                 = useState('')
  const [contactName, setContactName]   = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [street, setStreet]             = useState('')
  const [city, setCity]                 = useState('')
  const [state, setState]               = useState('')
  const [zipCode, setZipCode]           = useState('')
  const [country, setCountry]           = useState('')
  const [showAddr, setShowAddr]         = useState(false)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState<string | null>(null)

  useEffect(() => {
    if (isNew) return
    getParty(partyId as number)
      .then(detail => {
        const o = detail as OrgDetail
        setName(o.name); setContactName(o.contactName ?? ''); setContactEmail(o.contactEmail ?? '')
        const loc = o.location
        if (loc) {
          setStreet(loc.street ?? ''); setCity(loc.city ?? '')
          setState(loc.state ?? ''); setZipCode(loc.zipCode ?? '')
          setCountry(loc.country ?? ''); setShowAddr(true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [isNew, partyId])

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true); setError(null)
    const location = (street || city || state || zipCode || country)
      ? formatLocation({ street, city, state, zipCode, country }) : undefined
    const req = {
      name: name.trim(),
      ...(contactName.trim()  ? { contactName:  contactName.trim()  } : {}),
      ...(contactEmail.trim() ? { contactEmail: contactEmail.trim() } : {}),
      ...(location ? { location } : {}),
    }
    try {
      if (isNew) { await createOrg(req) } else { await updateOrg(partyId as number, req) }
      onSaved()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {isNew ? 'New Organization' : 'Edit Organization'}
        </p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      {loading ? <p className="text-sm text-slate-400">Loading…</p> : (
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className={labelCls}>Organization Name <span className="text-red-400">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={50} placeholder="e.g. Acme Corp" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contact Name</label>
            <input value={contactName} onChange={e => setContactName(e.target.value)} maxLength={50} placeholder="Primary contact" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="contact@example.com" className={inputCls} />
          </div>
          <div className="col-span-2">
            <button type="button" onClick={() => setShowAddr(v => !v)}
              className="flex items-center gap-1.5 text-xs text-heart-blue hover:underline">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {showAddr ? <line x1="5" y1="12" x2="19" y2="12"/> : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
              </svg>
              {showAddr ? 'Hide address' : 'Address (optional)'}
            </button>
          </div>
          {showAddr && <AddressFields street={street} city={city} state={state} zipCode={zipCode} country={country}
            setStreet={setStreet} setCity={setCity} setState={setState} setZipCode={setZipCode} setCountry={setCountry} />}
          {error && <p className="col-span-2 text-xs text-red-500">{error}</p>}
          <div className="col-span-2 flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={!name.trim() || saving}
              className="px-4 py-2 text-sm font-medium text-white bg-heart-blue rounded-lg hover:bg-heart-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {saving ? 'Saving…' : isNew ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Reusable party table section ─────────────────────────────────────────────
type SectionType = 'individuals' | 'organizations'

function PartySection({ kind, refreshKey, onRefresh }: {
  kind: SectionType
  refreshKey: number
  onRefresh: () => void
}) {
  const isPerson = kind === 'individuals'
  const [items, setItems]           = useState<PartySummary[]>([])
  const [loading, setLoading]       = useState(true)
  const [listError, setListError]   = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | 'new' | null>(null)
  const [search, setSearch]         = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true); setListError(null)
    getParties({ type: isPerson ? 'person' : 'organization' })
      .then(all => { if (!cancelled) { setItems(all); setLoading(false) } })
      .catch(e  => { if (!cancelled) { setListError(e instanceof Error ? e.message : 'Failed to load'); setLoading(false) } })
    return () => { cancelled = true }
  }, [isPerson, refreshKey])

  const filtered = items.filter(p =>
    !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleSaved() {
    setExpandedId(null)
    onRefresh()
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          {isPerson ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-heart-blue">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-heart-blue">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/>
            </svg>
          )}
          <h2 className="text-sm font-semibold text-slate-700">
            {isPerson ? 'Individuals' : 'Organizations'}
          </h2>
          {!loading && !listError && (
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          )}
        </div>
        <div className="flex-1" />
        {/* Search */}
        <div className="relative max-w-xs w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full text-sm border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white" />
        </div>
        {/* Add button */}
        <button onClick={() => setExpandedId('new')}
          className="flex items-center gap-1.5 text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue/90 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {isPerson ? 'Add Individual' : 'Add Organization'}
        </button>
      </div>

      {/* "New" panel */}
      {expandedId === 'new' && (
        <div className="mb-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isPerson
            ? <PersonPanel partyId="new" onClose={() => setExpandedId(null)} onSaved={handleSaved} />
            : <OrgPanel    partyId="new" onClose={() => setExpandedId(null)} onSaved={handleSaved} />}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">Loading…</div>
        ) : listError ? (
          <div className="flex items-center justify-center py-12 text-red-500 text-sm">{listError}</div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
            {items.length === 0
              ? `No ${isPerson ? 'individuals' : 'organizations'} yet.`
              : 'No matches.'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="text-left px-6 py-3">Name</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(p => (
                <>
                  <tr key={p.id} className={`transition-colors ${expandedId === p.id ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-3 font-medium text-slate-800">{p.name}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link to={`/admin/parties/${p.id}`}
                          className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline">
                          View
                        </Link>
                        <button onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          className="text-xs font-medium text-heart-blue hover:underline">
                          {expandedId === p.id ? 'Close' : 'Edit'}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === p.id && (
                    <tr key={`${p.id}-panel`}>
                      <td colSpan={2} className="p-0">
                        {isPerson
                          ? <PersonPanel partyId={p.id} onClose={() => setExpandedId(null)} onSaved={handleSaved} />
                          : <OrgPanel    partyId={p.id} onClose={() => setExpandedId(null)} onSaved={handleSaved} />}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ManageParties() {
  const { auth } = useAuth()
  const isAdmin = auth?.role === 'Admin' || auth?.role === 'Chapter Admin'

  // Separate refresh keys so refreshing one section doesn't reload the other
  const [individualsKey, setIndividualsKey] = useState(0)
  const [orgsKey, setOrgsKey]               = useState(0)

  if (!isAdmin) return <Navigate to="/" replace />

  return (
    <div className="space-y-10">
      <PageHeading title="Manage Parties" subtitle="Create and edit individuals and organizations that serve as donors or recipients." />
      <PartySection kind="individuals"  refreshKey={individualsKey} onRefresh={() => setIndividualsKey(k => k + 1)} />
      <PartySection kind="organizations" refreshKey={orgsKey}       onRefresh={() => setOrgsKey(k => k + 1)} />
    </div>
  )
}
