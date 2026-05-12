import { useState, useEffect, useMemo } from 'react'
import type { PartySummary, CreatePersonRequest, CreateOrgRequest } from '../types/inventory'
import { formatLocation } from '../types/inventory'
import { getParties, createPerson, createOrg } from '../services/partyService'

// ─── Shared style constants ───────────────────────────────────────────────────
const inputCls =
  'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none ' +
  'focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white'
const labelCls = 'text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block'

type CreateMode = 'Person' | 'Organization' | null

interface AddressFields {
  street:  string
  city:    string
  state:   string
  zipCode: string
  country: string
}

const EMPTY_ADDRESS: AddressFields = { street: '', city: '', state: '', zipCode: '', country: '' }

function hasAddress(a: AddressFields): boolean {
  return Object.values(a).some(v => v.trim() !== '')
}

// ─── Create sub-form ─────────────────────────────────────────────────────────

function CreatePartyForm({
  mode,
  onCreated,
  onCancel,
}: {
  mode: 'Person' | 'Organization'
  onCreated: (name: string) => void
  onCancel: () => void
}) {
  const [name, setName]               = useState('')
  const [email, setEmail]             = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [address, setAddress]         = useState<AddressFields>({ ...EMPTY_ADDRESS })
  const [showAddr, setShowAddr]       = useState(false)
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const setAddr = (field: keyof AddressFields) => (val: string) =>
    setAddress(prev => ({ ...prev, [field]: val }))

  async function handleSubmit() {
    if (!name.trim()) return
    setSaving(true)
    setError(null)
    try {
      const location = hasAddress(address)
        ? formatLocation(address)
        : undefined

      if (mode === 'Person') {
        const req: CreatePersonRequest = {
          name: name.trim(),
          ...(email.trim() ? { email: email.trim() } : {}),
          ...(location ? { location } : {}),
        }
        await createPerson(req)
      } else {
        const req: CreateOrgRequest = {
          name: name.trim(),
          ...(contactName.trim()  ? { contactName:  contactName.trim()  } : {}),
          ...(contactEmail.trim() ? { contactEmail: contactEmail.trim() } : {}),
          ...(location ? { location } : {}),
        }
        await createOrg(req)
      }
      onCreated(name.trim())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-slate-900">
            {mode === 'Person' ? 'New Individual' : 'New Organization'}
          </h2>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto space-y-4">
          {/* Name */}
          <div>
            <label className={labelCls}>Name <span className="text-red-400">*</span></label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={50}
              placeholder={mode === 'Person' ? 'Full name' : 'Organization name'}
              className={inputCls}
            />
          </div>

          {mode === 'Person' ? (
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@example.com"
                className={inputCls}
              />
            </div>
          ) : (
            <>
              <div>
                <label className={labelCls}>Contact Name</label>
                <input
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  maxLength={50}
                  placeholder="Primary contact"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  placeholder="contact@example.com"
                  className={inputCls}
                />
              </div>
            </>
          )}

          {/* Address toggle */}
          <button
            type="button"
            onClick={() => setShowAddr(v => !v)}
            className="flex items-center gap-1.5 text-xs text-heart-blue hover:underline"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {showAddr
                ? <><line x1="5" y1="12" x2="19" y2="12"/></>
                : <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>}
            </svg>
            {showAddr ? 'Hide address' : 'Add address (optional)'}
          </button>

          {showAddr && (
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelCls}>Street</label>
                <input value={address.street} onChange={e => setAddr('street')(e.target.value)} maxLength={100} placeholder="123 Main St" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>City</label>
                <input value={address.city} onChange={e => setAddr('city')(e.target.value)} maxLength={50} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>State</label>
                <input value={address.state} onChange={e => setAddr('state')(e.target.value)} maxLength={50} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>ZIP</label>
                <input value={address.zipCode} onChange={e => setAddr('zipCode')(e.target.value.replace(/\D/g, ''))} maxLength={20} inputMode="numeric" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Country</label>
                <input value={address.country} onChange={e => setAddr('country')(e.target.value)} maxLength={50} className={inputCls} />
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!name.trim() || saving}
            className="px-4 py-2 text-sm font-medium text-white bg-heart-blue rounded-lg hover:bg-heart-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── PartyPickerModal ─────────────────────────────────────────────────────────

export function PartyPickerModal({
  onSelect,
  onCancel,
}: {
  onSelect: (party: PartySummary) => void
  onCancel: () => void
}) {
  const [parties, setParties]       = useState<PartySummary[]>([])
  const [search, setSearch]         = useState('')
  const [loading, setLoading]       = useState(true)
  const [createMode, setCreateMode] = useState<CreateMode>(null)

  useEffect(() => {
    getParties()
      .then(p => { setParties(p); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return parties
    const s = search.toLowerCase()
    return parties.filter(p =>
      p.name.toLowerCase().includes(s) ||
      (p.type ?? '').toLowerCase().includes(s),
    )
  }, [parties, search])

  async function handleCreated(createdName: string) {
    setCreateMode(null)
    // Re-fetch the list so the new party (returned as void by the API) appears
    try {
      const updated = await getParties()
      setParties(updated)
      // Find the newly created entry by name (last match wins in case of duplicates)
      const match = [...updated].reverse().find(
        p => p.name.toLowerCase() === createdName.toLowerCase()
      )
      if (match) onSelect(match)
    } catch {
      // List refresh failed — just close the create form; party won't auto-select
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

        {/* Dialog */}
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">

          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 shrink-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Select a Donor</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pick an existing party or create a new one.
                </p>
              </div>
              <button
                onClick={onCancel}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            {/* Create buttons */}
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={() => setCreateMode('Person')}
                className="flex items-center gap-1.5 text-xs font-medium text-heart-blue border border-heart-blue/30 bg-heart-blue/5 px-3 py-1.5 rounded-lg hover:bg-heart-blue/10 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Individual
              </button>
              <button
                type="button"
                onClick={() => setCreateMode('Organization')}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Organization
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-slate-100 shrink-0">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                autoFocus
                type="text"
                value={search}
                placeholder="Filter by name or type…"
                onChange={e => setSearch(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white"
              />
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400 text-sm">Loading…</div>
            ) : filtered.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
                {parties.length === 0 ? 'No parties found. Create one above.' : 'No matches.'}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-normal">Name</th>
                    <th className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-normal">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => onSelect(p)}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-3 font-medium text-slate-800">{p.name}</td>
                      <td className="px-4 py-3">
                        <PartyTypeBadge type={p.type} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create sub-form — renders on top */}
      {createMode && (
        <CreatePartyForm
          mode={createMode}
          onCreated={handleCreated}
          onCancel={() => setCreateMode(null)}
        />
      )}
    </>
  )
}

// ─── Reusable badge ───────────────────────────────────────────────────────────

export function PartyTypeBadge({ type }: { type: 'Person' | 'Organization' }) {
  return type === 'Person' ? (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 whitespace-nowrap">
      Individual
    </span>
  ) : (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 whitespace-nowrap">
      Organization
    </span>
  )
}
