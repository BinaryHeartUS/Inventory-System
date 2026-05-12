import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getParty } from '../services/partyService'
import { getDevices } from '../services/deviceService'
import { getParts } from '../services/partService'
import { getTools } from '../services/toolService'
import type { PartyDetail, PersonDetail, OrgDetail, AnyDevice, Part, Tool } from '../types/inventory'
import StatusBadge from '../components/StatusBadge'
import type { DeviceStatus } from '../types/inventory'

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

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ title, icon, count, children }: {
  title: string
  icon: React.ReactNode
  count?: number
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2.5">
        <span className="text-slate-500">{icon}</span>
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        {count !== undefined && (
          <span className="ml-1 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── Asset table ─────────────────────────────────────────────────────────────
type AssetRow = { id: number; label: string; detail: string; status?: string; chapter?: string; acquired: string | null }

function AssetTable({ rows, basePath, emptyMessage }: {
  rows: AssetRow[]
  basePath: string
  emptyMessage: string
}) {
  if (rows.length === 0) {
    return <p className="px-6 py-10 text-center text-sm text-slate-400">{emptyMessage}</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {['ID', 'Asset', ...(rows[0].status !== undefined ? ['Status'] : []), ...(rows[0].chapter !== undefined ? ['Chapter'] : []), 'Acquired', ''].map(h => (
              <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(row => (
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3 font-mono text-xs text-slate-400">#{row.id}</td>
              <td className="px-5 py-3 text-slate-800">{row.label}
                {row.detail && <span className="ml-1.5 text-slate-400 text-xs">{row.detail}</span>}
              </td>
              {row.status !== undefined && (
                <td className="px-5 py-3">
                  <StatusBadge status={row.status as DeviceStatus} />
                </td>
              )}
              {row.chapter !== undefined && (
                <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{row.chapter ?? '—'}</td>
              )}
              <td className="px-5 py-3 text-slate-500 whitespace-nowrap">{formatDate(row.acquired) ?? '—'}</td>
              <td className="px-5 py-3 text-right">
                <Link to={`${basePath}/${row.id}`}
                  className="text-xs font-medium text-heart-blue hover:underline whitespace-nowrap">
                  View →
                </Link>
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

  useEffect(() => {
    if (!numId) return
    Promise.all([
      getParty(numId),
      getDevices(),
      getParts(),
      getTools(),
    ]).then(([p, devices, parts, tools]) => {
      setParty(p)
      setAllDevices(devices)
      setAllParts(parts)
      setAllTools(tools)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [numId])

  if (!isAdmin) return <Navigate to="/" replace />

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!party) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-sm font-semibold text-slate-900">Party not found</p>
        <Link to="/admin/parties" className="text-sm font-medium text-slate-600 hover:text-slate-800">
          ← Back to Manage Parties
        </Link>
      </div>
    )
  }

  const isPerson = party.type === 'Person'
  const person   = isPerson ? (party as PersonDetail) : null
  const org      = !isPerson ? (party as OrgDetail) : null
  const loc      = party.type === 'Person' ? person?.location : org?.location

  // Filter assets by role for this party
  const donatedDevices  = allDevices.filter(d => d.donorId    === numId)
  const receivedDevices = allDevices.filter(d => d.recipientId === numId)
  const donatedParts    = allParts.filter(p => p.donorId === numId)
  const donatedTools    = allTools.filter(t => t.donorId === numId)

  const deviceToRow = (d: AnyDevice, role: 'donor' | 'recipient'): AssetRow => ({
    id: d.id,
    label: `${d.manufacturer} ${d.model}`,
    detail: `${d.type} · ${d.year}`,
    status: d.status,
    ...(role === 'recipient' ? { chapter: d.chapter } : {}),
    acquired: d.acquisitionDate ?? null,
  })

  return (
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
          <button onClick={() => navigate(-1)}
            className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
            ← Back
          </button>
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

      {/* Donated devices */}
      <Section
        title="Donated Devices"
        count={donatedDevices.length}
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>}
      >
        <AssetTable
          rows={donatedDevices.map(d => deviceToRow(d, 'donor'))}
          basePath="/devices"
          emptyMessage="No donated devices."
        />
      </Section>

      {/* Received devices */}
      <Section
        title="Received Devices"
        count={receivedDevices.length}
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>}
      >
        <AssetTable
          rows={receivedDevices.map(d => deviceToRow(d, 'recipient'))}
          basePath="/devices"
          emptyMessage="No received devices."
        />
      </Section>

      {/* Donated parts */}
      <Section
        title="Donated Parts"
        count={donatedParts.length}
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/><line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="14" x2="22" y2="14"/><line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="14" x2="4" y2="14"/></svg>}
      >
        <AssetTable
          rows={donatedParts.map(p => ({ id: p.id, label: p.type, detail: p.description, acquired: p.acquisitionDate }))}
          basePath="/parts"
          emptyMessage="No donated parts."
        />
      </Section>

      {/* Donated tools */}
      <Section
        title="Donated Tools"
        count={donatedTools.length}
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>}
      >
        <AssetTable
          rows={donatedTools.map(t => ({ id: t.id, label: t.description, detail: '', acquired: t.acquisitionDate }))}
          basePath="/tools"
          emptyMessage="No donated tools."
        />
      </Section>
    </div>
  )
}
