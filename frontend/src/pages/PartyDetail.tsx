import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getParty } from '../services/partyService'
import { getDevices } from '../services/deviceService'
import { getParts } from '../services/partService'
import { getTools } from '../services/toolService'
import type { PartyDetail, PersonDetail, OrgDetail, AnyDevice, Part, Tool } from '../types/inventory'
import StatusBadge from '../components/StatusBadge'
import type { DeviceStatus } from '../types/inventory'
import { generateDonationReceipt, buildDescription } from '../utils/generateDonationReceipt'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string | null | undefined): string | null {
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

// ─── Receipt item type ────────────────────────────────────────────────────────
interface ReceiptItem { id: number; label: string; year?: number | string | null; value: number | null }

// ─── Donation Receipt Modal ───────────────────────────────────────────────────
function DonationReceiptModal({ donorName, items, onClose }: {
  donorName: string; items: ReceiptItem[]; onClose: () => void
}) {
  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
  const autoValue = items.reduce((sum, i) => sum + (i.value ?? 0), 0)
  const [donationDate, setDonationDate] = useState('')
  const [value, setValue]               = useState(autoValue > 0 ? `$${autoValue}` : '')
  const [repName, setRepName]           = useState('')
  const [repTitle, setRepTitle]         = useState('')
  const [generating, setGenerating]     = useState(false)

  async function handleGenerate() {
    setGenerating(true)
    const description = buildDescription(items.map(i => ({ label: i.label, year: i.year })))
    await generateDonationReceipt({ donorName, donationDate: donationDate || today, value: value || '—', description, repName, repTitle })
    setGenerating(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Generate Donation Receipt</h2>
            <p className="text-xs text-slate-400 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} selected · donor: {donorName}</p>
          </div>
          <button onClick={onClose} className="ml-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[70vh]">
          <div>
            <p className={labelCls}>Donation Description (auto-generated)</p>
            <p className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 leading-relaxed">
              {buildDescription(items.map(i => ({ label: i.label, year: i.year })))}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Donation Date</label>
              <input type="text" value={donationDate} onChange={e => setDonationDate(e.target.value)} placeholder={today} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Donation Value</label>
              <input type="text" value={value} onChange={e => setValue(e.target.value)} placeholder="e.g. $7800" className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Representative Name <span className="text-red-400">*</span></label>
            <input value={repName} onChange={e => setRepName(e.target.value)} placeholder="Full name" maxLength={80} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Representative Title <span className="text-red-400">*</span></label>
            <input value={repTitle} onChange={e => setRepTitle(e.target.value)} placeholder="e.g. Director of Technology" maxLength={80} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Date of Receipt</label>
            <p className="text-sm text-slate-600 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">{today} (today)</p>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
          <button onClick={onClose} className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
          <button onClick={handleGenerate} disabled={!repName.trim() || !repTitle.trim() || generating}
            className="flex items-center gap-2 text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue/90 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 rounded-lg transition-colors">
            {generating ? (
              <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            )}
            {generating ? 'Generating…' : 'Download PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, icon, count, children }: {
  title: string; icon: React.ReactNode; count?: number; children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <span className="text-slate-500">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        {count !== undefined && <span className="ml-1 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>}
      </div>
      {children}
    </div>
  )
}

// ─── Selectable donated asset table ──────────────────────────────────────────
type DonatedRow = { id: number; label: string; year?: number | string | null; detail: string; value: number | null; acquired: string | null }

function DonatedTable({ rows, basePath, emptyMessage, selectMode, selected, onToggle, onToggleAll }: {
  rows: DonatedRow[]; basePath: string; emptyMessage: string; selectMode: boolean
  selected: Set<number>; onToggle: (id: number) => void; onToggleAll: (ids: number[]) => void
}) {
  if (rows.length === 0) return <p className="px-6 py-10 text-center text-sm text-slate-400">{emptyMessage}</p>
  const allChecked = rows.length > 0 && rows.every(r => selected.has(r.id))
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {selectMode && (
              <th className="px-5 py-3 w-10">
                <input type="checkbox" checked={allChecked} onChange={() => onToggleAll(rows.map(r => r.id))}
                  className="rounded border-slate-300 text-heart-blue cursor-pointer" />
              </th>
            )}
            {['ID', 'Asset', 'Acquired', ''].map(h => (
              <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(row => (
            <tr key={row.id} className={`transition-colors ${selectMode && selected.has(row.id) ? 'bg-blue-50/40' : 'hover:bg-slate-50'}`}>
              {selectMode && (
              <td className="px-5 py-3">
                <input type="checkbox" checked={selected.has(row.id)} onChange={() => onToggle(row.id)}
                  className="rounded border-slate-300 text-heart-blue cursor-pointer" />
              </td>
              )}
              <td className="px-5 py-3 font-mono text-xs text-slate-400">#{row.id}</td>
              <td className="px-5 py-3 text-slate-800">
                {row.label}{row.detail && <span className="ml-1.5 text-slate-400 text-xs">{row.detail}</span>}
              </td>
              <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDate(row.acquired) ?? '—'}</td>
              <td className="px-5 py-3 text-right">
                <Link to={`${basePath}/${row.id}`} className="text-xs font-medium text-heart-blue hover:underline whitespace-nowrap">View →</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Read-only asset table (received devices) ─────────────────────────────────
type AssetRow = { id: number; label: string; detail: string; status?: string; chapter?: string; acquired: string | null }

function AssetTable({ rows, basePath, emptyMessage }: { rows: AssetRow[]; basePath: string; emptyMessage: string }) {
  if (rows.length === 0) return <p className="px-6 py-10 text-center text-sm text-slate-400">{emptyMessage}</p>
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {['ID', 'Asset', ...(rows[0].status !== undefined ? ['Status'] : []), ...(rows[0].chapter !== undefined ? ['Chapter'] : []), 'Acquired', ''].map(h => (
              <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3 font-mono text-xs text-slate-400">#{row.id}</td>
              <td className="px-5 py-3 text-slate-800">{row.label}{row.detail && <span className="ml-1.5 text-slate-400 text-xs">{row.detail}</span>}</td>
              {row.status !== undefined && <td className="px-5 py-3"><StatusBadge status={row.status as DeviceStatus} /></td>}
              {row.chapter !== undefined && <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{row.chapter ?? '—'}</td>}
              <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDate(row.acquired) ?? '—'}</td>
              <td className="px-5 py-3 text-right">
                <Link to={`${basePath}/${row.id}`} className="text-xs font-medium text-heart-blue hover:underline whitespace-nowrap">View →</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PartyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const numId = Number(id)
  const navigate = useNavigate()
  const { auth } = useAuth()
  const isAdmin = auth?.role === 'Admin' || auth?.role === 'Chapter Admin'

  const [party, setParty]           = useState<PartyDetail | null>(null)
  const [loading, setLoading]       = useState(true)
  const [allDevices, setAllDevices] = useState<AnyDevice[]>([])
  const [allParts, setAllParts]     = useState<Part[]>([])
  const [allTools, setAllTools]     = useState<Tool[]>([])
  const [selectMode, setSelectMode]  = useState(false)
  const [selected, setSelected]       = useState<Set<number>>(new Set())
  const [showReceipt, setShowReceipt] = useState(false)

  useEffect(() => {
    if (!numId) return
    Promise.all([getParty(numId), getDevices(), getParts(), getTools()])
      .then(([p, devices, parts, tools]) => {
        setParty(p); setAllDevices(devices); setAllParts(parts); setAllTools(tools); setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [numId])

  if (!isAdmin) return <Navigate to="/" replace />

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
    </div>
  )

  if (!party) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-sm font-semibold text-slate-900">Party not found</p>
      <Link to="/admin/parties" className="text-sm font-medium text-slate-600 hover:text-slate-800">← Back to Manage Parties</Link>
    </div>
  )

  const isPerson = party.type === 'Person'
  const person   = isPerson ? (party as PersonDetail) : null
  const org      = !isPerson ? (party as OrgDetail) : null
  const loc      = isPerson ? person?.location : org?.location

  const donatedDevices  = allDevices.filter(d => d.donorId     === numId)
  const receivedDevices = allDevices.filter(d => d.recipientId === numId)
  const donatedParts    = allParts.filter(p  => p.donorId === numId)
  const donatedTools    = allTools.filter(t  => t.donorId === numId)

  // Map all donatable ids → ReceiptItem for the modal
  const allDonatedById = new Map<number, ReceiptItem>([
    ...donatedDevices.map(d => [d.id, { id: d.id, label: `${d.manufacturer} ${d.model}`, year: d.year, value: d.value }] as [number, ReceiptItem]),
    ...donatedParts.map(p   => [p.id, { id: p.id, label: p.type, year: null, value: p.value }] as [number, ReceiptItem]),
    ...donatedTools.map(t   => [t.id, { id: t.id, label: t.description, year: null, value: t.value }] as [number, ReceiptItem]),
  ])
  const selectedItems: ReceiptItem[] = Array.from(selected).map(i => allDonatedById.get(i)!).filter(Boolean)

  function toggle(id: number) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function toggleAll(ids: number[]) {
    const allIn = ids.every(id => selected.has(id))
    setSelected(prev => { const n = new Set(prev); allIn ? ids.forEach(id => n.delete(id)) : ids.forEach(id => n.add(id)); return n })
  }

  const deviceIcon = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
  const receiveIcon = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
  const partIcon   = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="14" x2="22" y2="14"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="14" x2="4" y2="14"/></svg>
  const toolIcon   = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>

  return (
    <>
      {showReceipt && <DonationReceiptModal donorName={party.name} items={selectedItems} onClose={() => { setShowReceipt(false); setSelectMode(false); setSelected(new Set()) }} />}

      <div className="space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/admin/parties" className="hover:text-slate-600 transition-colors">Manage Parties</Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{party.name}</span>
        </div>

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-xl px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${isPerson ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                  {isPerson ? 'Individual' : 'Organization'}
                </span>
                <span className="font-mono text-xs text-slate-400">#{party.id}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{party.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              {!selectMode && (donatedDevices.length > 0 || donatedParts.length > 0 || donatedTools.length > 0) && (
                <button onClick={() => setSelectMode(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Create Donation Receipt
                </button>
              )}
              <button onClick={() => navigate(-1)}
                className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                ← Back
              </button>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white border border-slate-200 rounded-xl px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-8">
          {isPerson ? (
            <>
              <Field label="Email" value={person?.email ?? null} />
              <Field label="Street" value={loc?.street ?? null} />
              <Field label="City" value={loc?.city ?? null} />
              <Field label="State" value={loc?.state ?? null} />
              <Field label="ZIP" value={loc?.zipCode ?? null} />
              <Field label="Country" value={loc?.country ?? null} />
            </>
          ) : (
            <>
              <Field label="Contact Name" value={org?.contactName ?? null} />
              <Field label="Contact Email" value={org?.contactEmail ?? null} />
              <Field label="Street" value={loc?.street ?? null} />
              <Field label="City" value={loc?.city ?? null} />
              <Field label="State" value={loc?.state ?? null} />
              <Field label="ZIP" value={loc?.zipCode ?? null} />
              <Field label="Country" value={loc?.country ?? null} />
            </>
          )}
        </div>

        {/* Selection banner */}
        {selectMode && (
          <div className="flex items-center justify-between bg-heart-blue/5 border border-heart-blue/20 rounded-xl px-5 py-3">
            <p className="text-sm text-heart-blue font-medium">
              {selected.size > 0 ? `${selected.size} item${selected.size !== 1 ? 's' : ''} selected` : 'Select items to include in the receipt'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSelectMode(false); setSelected(new Set()) }}
                className="text-sm font-medium text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <button onClick={() => setShowReceipt(true)} disabled={selected.size === 0}
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue/90 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-1.5 rounded-lg transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                Generate Donor Receipt
              </button>
            </div>
          </div>
        )}

        {/* Donated devices */}
        <Section title="Donated Devices" count={donatedDevices.length} icon={deviceIcon}>
          <DonatedTable
            rows={donatedDevices.map(d => ({ id: d.id, label: `${d.manufacturer} ${d.model}`, year: d.year, detail: `${d.type} · ${d.year}`, value: d.value, acquired: d.acquisitionDate ?? null }))}
            basePath="/devices" emptyMessage="No donated devices." selectMode={selectMode}
            selected={selected} onToggle={toggle} onToggleAll={toggleAll}
          />
        </Section>

        {/* Received devices */}
        <Section title="Received Devices" count={receivedDevices.length} icon={receiveIcon}>
          <AssetTable
            rows={receivedDevices.map(d => ({ id: d.id, label: `${d.manufacturer} ${d.model}`, detail: `${d.type} · ${d.year}`, status: d.status, chapter: d.chapter, acquired: d.acquisitionDate ?? null }))}
            basePath="/devices" emptyMessage="No received devices."
          />
        </Section>

        {/* Donated parts */}
        <Section title="Donated Parts" count={donatedParts.length} icon={partIcon}>
          <DonatedTable
            rows={donatedParts.map(p => ({ id: p.id, label: p.type, year: null, detail: p.description, value: p.value, acquired: p.acquisitionDate }))}
            basePath="/parts" emptyMessage="No donated parts." selectMode={selectMode}
            selected={selected} onToggle={toggle} onToggleAll={toggleAll}
          />
        </Section>

        {/* Donated tools */}
        <Section title="Donated Tools" count={donatedTools.length} icon={toolIcon}>
          <DonatedTable
            rows={donatedTools.map(t => ({ id: t.id, label: t.description, year: null, detail: '', value: t.value, acquired: t.acquisitionDate }))}
            basePath="/tools" emptyMessage="No donated tools." selectMode={selectMode}
            selected={selected} onToggle={toggle} onToggleAll={toggleAll}
          />
        </Section>
      </div>
    </>
  )
}
