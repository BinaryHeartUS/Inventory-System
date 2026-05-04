import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { AnyDevice, DeviceStatus, ChargerStatus, WorkingBattery } from '../types/inventory'
import StatusBadge from '../components/StatusBadge'
import NotesPane from '../components/NotesPane'
import { getDevice, updateDevice } from '../services/deviceService'
import { useLookups } from '../hooks/useLookups'
import { PrintLabelModal } from '../components/PrintLabelModal'
import { useAuth } from '../context/AuthContext'
import { useWritableChapters } from '../context/ChapterContext'


// ─── Field / form helpers ─────────────────────────────────────────────────────

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

function EditText({ label, value, onChange, type = 'text', placeholder, min, max, maxLength }: {
  label: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; min?: string | number; max?: string | number; maxLength?: number
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input type={type} value={value} placeholder={placeholder}
        min={min} max={max} maxLength={maxLength}
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

/**
 * Combo field: dropdown of known values + a "Custom…" option that reveals a free-text input.
 * `options` should come from a lookup API endpoint (see TODO above); the dropdown always shows
 * whatever the server considers canonical, and "Custom…" lets users enter a new value that will
 * be persisted as a new lookup row on save.
 */
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

function BatteryBar({ health }: { health: number | null }) {
  if (health == null) return <span className="text-slate-300 text-sm">—</span>
  const pct = Math.round(health * 100)
  const color = pct >= 80 ? 'bg-slate-500' : pct >= 50 ? 'bg-slate-400' : 'bg-slate-300'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-slate-700 tabular-nums w-9 shrink-0">{pct}%</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>()
  const numId   = Number(id)

  const { auth } = useAuth()
  const writableChapters = useWritableChapters()
  const lookups = useLookups()

  const [device, setDevice] = useState<AnyDevice | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm]       = useState<AnyDevice | null>(null)
  const [saved, setSaved]         = useState(false)
  const [saveError, setSaveError]  = useState<string | null>(null)
  const [printId, setPrintId]      = useState<number | null>(null)

  useEffect(() => {
    getDevice(numId)
      .then(d => { setDevice(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [numId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900">Device not found</p>
          <p className="text-xs text-slate-400 mt-1">
            No device with ID <span className="font-mono">{id}</span> exists in inventory.
          </p>
        </div>
        <Link to="/devices" className="mt-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
          ← Back to Devices
        </Link>
      </div>
    )
  }

  function startEdit() { setForm({ ...device } as AnyDevice); setEditing(true) }
  function cancelEdit() { setEditing(false) }
  async function saveEdit() {
    if (!form) return
    setSaveError(null)
    try {
      const updated = await updateDevice(numId, form)
      setDevice(updated); setEditing(false); setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Save failed')
      setTimeout(() => setSaveError(null), 5000)
    }
  }
  function set(key: string) {
    return (value: string | number | boolean | null) =>
      setForm(prev => prev ? ({ ...prev, [key]: value }) as AnyDevice : prev)
  }

  const d = editing && form ? form : device

  // Determine write access for this specific chapter, not just the global role.
  // A National Viewer + IU Chapter Admin cannot write to a Rose-Hulman device.
  const canWriteThisChapter = writableChapters.some(c => c.name === device.chapter)
  const isEditor = canWriteThisChapter && auth?.role?.toLowerCase() === 'editor'
  const viewerLock = !canWriteThisChapter
  const donatedLock = canWriteThisChapter && auth?.role?.toLowerCase() === 'editor' && device.status === 'Donated'
  const editLock = viewerLock || donatedLock

  return (
    <>
    {printId !== null && <PrintLabelModal assetId={printId} onClose={() => setPrintId(null)} />}
    <div className="space-y-5">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/devices" className="hover:text-slate-600 transition-colors">Devices</Link>
        <span>/</span>
        <span className="text-slate-600 font-medium">{device.manufacturer} {device.model}</span>
      </div>

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl px-8 py-6">
        <div className="flex items-stretch justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-500 uppercase tracking-wide">
                {d.type}
              </span>
              <span className="font-mono text-xs text-slate-400">#{d.id}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{d.manufacturer} {d.model}</h1>
            <p className="text-sm text-slate-400 mt-1">{d.year} · {d.chapter}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={d.status as DeviceStatus} size="lg" />
            {!editing && (
              <button onClick={() => setPrintId(d.id)}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-lg transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
                </svg>
                Print Label
              </button>
            )}
            {!editing ? (
              <button onClick={startEdit}
                disabled={editLock}
                title={viewerLock ? 'Viewers cannot edit devices' : donatedLock ? 'Donated devices cannot be edited' : undefined}
                className="flex items-center gap-2 text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue-dark disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2.5 rounded-lg transition-colors">
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

        {/* Left: detail sections */}
        <div className="flex-[3] min-w-0 space-y-5">

          <Section title="Specifications">
            {editing && form ? (
              <>
                <EditCombo label="Manufacturer" value={form.manufacturer ?? null} options={lookups.manufacturers} onChange={v => set('manufacturer')(v ?? '')} placeholder="e.g. Asus" maxLength={50} />
                <EditText label="Model" value={form.model ?? ''} onChange={v => set('model')(v)} placeholder="e.g. ThinkPad X1" maxLength={50} />
                <EditText label="Year" type="number" value={String(form.year)} onChange={v => set('year')(Number(v))} min={1980} max={new Date().getFullYear()} />
                <EditText label="CPU" value={form.cpu ?? ''} onChange={v => set('cpu')(v || null)} placeholder="e.g. i5-1135G7" maxLength={50} />
                <EditText label="RAM (GB)" type="number" value={String(form.ram)} onChange={v => set('ram')(Number(v))} min={0} />
                <EditCombo label="RAM Generation" value={form.ramGeneration ?? null} options={lookups.ramGenerations} onChange={set('ramGeneration')} placeholder="e.g. LPDDR5" maxLength={20} />
                <EditText label="Storage (GB)" type="number" value={String(form.storage)} onChange={v => set('storage')(Number(v))} min={0} />
                <EditCombo label="Storage Type" value={form.storageType ?? null} options={lookups.storageTypes} onChange={set('storageType')} placeholder="e.g. eMMC" maxLength={30} />
                <EditSelect label="Status" value={(form.status ?? 'Unknown') as DeviceStatus} options={lookups.deviceStatuses} onChange={set('status') as (v: DeviceStatus) => void} />
                <EditSelect label="Chapter" value={form.chapter ?? ''} options={lookups.chapters} onChange={set('chapter')} />
                <div>
                  <label className={labelCls}>Acquired</label>
                  <input type="date" value={form.acquisitionDate ?? ''} onChange={e => set('acquisitionDate')(e.target.value || null)} className={inputCls} />
                </div>
                <EditText label="Value ($)" type="number" value={String(form.value ?? '')} onChange={v => set('value')(v ? Number(v) : null)} placeholder="e.g. 150.00" />
              </>
            ) : (
              <>
                <Field label="Manufacturer" value={d.manufacturer} />
                <Field label="Model" value={d.model} />
                <Field label="Year" value={d.year} />
                <Field label="CPU" value={d.cpu} />
                <Field label="RAM" value={d.ram != null ? `${d.ram} GB${d.ramGeneration ? ` ${d.ramGeneration}` : ''}` : null} />
                <Field label="Storage" value={d.storage != null ? `${d.storage} GB${d.storageType ? ` ${d.storageType}` : ''}` : null} />
                <Field label="Status" value={<StatusBadge status={d.status as DeviceStatus} />} />
                <Field label="Chapter" value={d.chapter} />
                <Field label="Acquired" value={formatDate(d.acquisitionDate ?? null)} />
                <Field label="Value" value={d.value != null && d.value !== 0 ? `$${d.value.toFixed(2)}` : null} />
              </>
            )}
          </Section>

          {d.type === 'Desktop' && (
            <Section title="Desktop Details">
              {editing && form && form.type === 'Desktop' ? (
                <EditSelect label="Wi-Fi"
                  value={form.hasWifi == null ? 'Unknown' : form.hasWifi ? 'Yes' : 'No'}
                  options={['Yes', 'No', 'Unknown']}
                  onChange={v => set('hasWifi')(v === 'Yes' ? true : v === 'No' ? false : null)} />
              ) : (
                <Field label="Wi-Fi" value={d.hasWifi == null ? null : d.hasWifi ? 'Yes' : 'No'} />
              )}
            </Section>
          )}

          {d.type === 'Laptop' && (() => {
            const fLaptop = form?.type === 'Laptop' ? form : null
            return (
              <Section title="Laptop Details">
                {editing && fLaptop ? (
                  <>
                    <EditSelect label="Charger" value={(fLaptop.includesCharger ?? 'Unknown') as ChargerStatus} options={lookups.chargerStatuses} onChange={set('includesCharger') as (v: ChargerStatus) => void} />
                    <EditText label="Design Capacity (mWh)" type="number" value={String(fLaptop.designBatteryCapacity === 0 ? '' : (fLaptop.designBatteryCapacity ?? ''))} onChange={v => set('designBatteryCapacity')(v ? Number(v) : null)} min={1} />
                    <EditText label="Actual Capacity (mWh)" type="number" value={String(fLaptop.actualBatteryCapacity === 0 ? '' : (fLaptop.actualBatteryCapacity ?? ''))} onChange={v => set('actualBatteryCapacity')(v ? Number(v) : null)} min={1} />
                    {fLaptop.actualBatteryCapacity != null && fLaptop.designBatteryCapacity != null &&
                      fLaptop.actualBatteryCapacity > fLaptop.designBatteryCapacity && (
                      <p className="col-span-full text-xs text-red-500 -mt-3">
                        Actual capacity cannot exceed design capacity.
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <Field label="Charger" value={d.includesCharger} />
                    <Field label="Design Capacity" value={d.designBatteryCapacity != null ? `${d.designBatteryCapacity.toLocaleString()} mWh` : null} />
                    <Field label="Actual Capacity" value={d.actualBatteryCapacity != null ? `${d.actualBatteryCapacity.toLocaleString()} mWh` : null} />
                    <div className="col-span-full">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Battery Health</p>
                      <BatteryBar health={d.batteryHealth ?? null} />
                    </div>
                  </>
                )}
              </Section>
            )
          })()}

          {d.type === 'Tablet' && (() => {
            const fTablet = form?.type === 'Tablet' ? form : null
            return (
              <Section title="Tablet Details">
                {editing && fTablet ? (
                  <>
                    <EditSelect label="Charger" value={(fTablet.includesCharger ?? 'Unknown') as ChargerStatus} options={lookups.chargerStatuses} onChange={set('includesCharger') as (v: ChargerStatus) => void} />
                    <EditSelect label="Working Battery" value={(fTablet.workingBattery ?? 'Unknown') as WorkingBattery} options={lookups.workingBatteryOpts} onChange={set('workingBattery') as (v: WorkingBattery) => void} />
                  </>
                ) : (
                  <>
                    <Field label="Charger" value={d.includesCharger} />
                    <Field label="Working Battery" value={d.workingBattery} />
                  </>
                )}
              </Section>
            )
          })()}

        </div>

        {/* Right: sticky notes pane */}
        <div className="flex-[1] min-w-64 sticky top-20">
          <NotesPane assetId={device.id} readOnly={editLock} readOnlyReason={viewerLock ? 'viewer' : 'donated'} />
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
      {saveError && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2.5 px-4 py-3 bg-red-600 text-white rounded-xl shadow-lg text-sm font-medium z-50">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {saveError}
        </div>
      )}

    </div>
    </>
  )
}
