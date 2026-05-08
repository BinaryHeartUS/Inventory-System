import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageHeading from '../components/PageHeading'
import {
  getParties, getParty, createOrg, updateOrg,
} from '../services/partyService'
import type { PartySummary, OrgDetail } from '../types/inventory'

// ─── Style constants ──────────────────────────────────────────────────────────
const inputCls =
  'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none ' +
  'focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white'
const labelCls = 'text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block'

// ─── Edit / create panel ──────────────────────────────────────────────────────
function OrgPanel({
  partyId,
  onClose,
  onSaved,
}: {
  partyId: number | 'new'
  onClose: () => void
  onSaved: () => void
}) {
  const isNew = partyId === 'new'

  const [loading, setLoading]               = useState(!isNew)
  const [name, setName]                     = useState('')
  const [contactName, setContactName]       = useState('')
  const [contactEmail, setContactEmail]     = useState('')
  const [street, setStreet]                 = useState('')
  const [city, setCity]                     = useState('')
  const [state, setState]                   = useState('')
  const [zipCode, setZipCode]               = useState('')
  const [country, setCountry]               = useState('')
  const [showAddr, setShowAddr]             = useState(false)
  const [saving, setSaving]                 = useState(false)
  const [error, setError]                   = useState<string | null>(null)

  useEffect(() => {
    if (isNew) return
    getParty(partyId as number)
      .then(detail => {
        const o = detail as OrgDetail
        setName(o.name)
        setContactName(o.contactName ?? '')
        setContactEmail(o.contactEmail ?? '')
        const loc = o.location
        if (loc) {
          setStreet(loc.street ?? '')
          setCity(loc.city ?? '')
          setState(loc.state ?? '')
          setZipCode(loc.zipCode ?? '')
          setCountry(loc.country ?? '')
          setShowAddr(true)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [isNew, partyId])

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true); setError(null)
    const loc = (street || city || state || zipCode || country)
      ? { street: street || undefined, city: city || undefined, state: state || undefined, zipCode: zipCode || undefined, country: country || undefined }
      : undefined
    const req = {
      name: name.trim(),
      ...(contactName.trim()  ? { contactName:  contactName.trim()  } : {}),
      ...(contactEmail.trim() ? { contactEmail: contactEmail.trim() } : {}),
      ...(loc ? { location: loc } : {}),
    }
    try {
      if (isNew) {
        await createOrg(req)
      } else {
        await updateOrg(partyId as number, req)
      }
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

      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {/* Name */}
          <div className="col-span-2">
            <label className={labelCls}>Organization Name <span className="text-red-400">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={50} placeholder="e.g. Acme Corp" className={inputCls} />
          </div>

          {/* Contact info */}
          <div>
            <label className={labelCls}>Contact Name</label>
            <input value={contactName} onChange={e => setContactName(e.target.value)} maxLength={50} placeholder="Primary contact" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="contact@example.com" className={inputCls} />
          </div>

          {/* Address toggle */}
          <div className="col-span-2">
            <button
              type="button"
              onClick={() => setShowAddr(v => !v)}
              className="flex items-center gap-1.5 text-xs text-heart-blue hover:underline"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {showAddr
                  ? <line x1="5" y1="12" x2="19" y2="12"/>
                  : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
              </svg>
              {showAddr ? 'Hide address' : 'Address (optional)'}
            </button>
          </div>

          {showAddr && (
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
                <input value={zipCode} onChange={e => setZipCode(e.target.value)} maxLength={20} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <input value={country} onChange={e => setCountry(e.target.value)} maxLength={50} className={inputCls} />
              </div>
            </>
          )}

          {error && <p className="col-span-2 text-xs text-red-500">{error}</p>}

          <div className="col-span-2 flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="px-4 py-2 text-sm font-medium text-white bg-heart-blue rounded-lg hover:bg-heart-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving…' : isNew ? 'Create' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ManageOrganizations() {
  const { auth } = useAuth()
  const [orgs, setOrgs]             = useState<PartySummary[]>([])
  const [loading, setLoading]       = useState(true)
  const [listError, setListError]   = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<number | 'new' | null>(null)
  const [search, setSearch]         = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const isAdmin = auth?.role === 'Admin' || auth?.role === 'Chapter Admin'

  useEffect(() => {
    let cancelled = false
    getParties()
      .then(all => {
        if (cancelled) return
        setOrgs(all.filter(p => p.type === 'Organization'))
        setLoading(false)
      })
      .catch(e => {
        if (cancelled) return
        setListError(e instanceof Error ? e.message : 'Failed to load')
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [refreshKey])

  if (!isAdmin) return <Navigate to="/" replace />

  const filtered = orgs.filter(p =>
    !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleSaved() {
    setExpandedId(null)
    setLoading(true)
    setListError(null)
    setRefreshKey(k => k + 1)
  }

  return (
    <div>
      <PageHeading title="Manage Organizations" subtitle="Create and edit organization donors and recipients." />

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-6 py-6">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white"
          />
        </div>
        <button
          onClick={() => setExpandedId('new')}
          className="flex items-center gap-2 text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue/90 px-4 py-2 rounded-lg transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Organization
        </button>
      </div>

      {/* "New" panel */}
      {expandedId === 'new' && (
        <div className="mb-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <OrgPanel partyId="new" onClose={() => setExpandedId(null)} onSaved={handleSaved} />
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">Loading…</div>
        ) : listError ? (
          <div className="flex items-center justify-center py-16 text-red-500 text-sm">{listError}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
            <p className="text-sm">{orgs.length === 0 ? 'No organizations yet.' : 'No matches.'}</p>
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
              {filtered.map(o => (
                <>
                  <tr key={o.id} className={`transition-colors ${expandedId === o.id ? 'bg-slate-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-3 font-medium text-slate-800">{o.name}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
                        className="text-xs font-medium text-heart-blue hover:underline"
                      >
                        {expandedId === o.id ? 'Close' : 'Edit'}
                      </button>
                    </td>
                  </tr>
                  {expandedId === o.id && (
                    <tr key={`${o.id}-panel`}>
                      <td colSpan={2} className="p-0">
                        <OrgPanel partyId={o.id} onClose={() => setExpandedId(null)} onSaved={handleSaved} />
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
