import { useState, useEffect, type Dispatch, type SetStateAction } from 'react'
import type { AnyDevice, ChargerStatus, DeviceStatus, Part, Tool, WorkingBattery } from '../types/inventory'
import { useLookups } from '../hooks/useLookups'
import { useChapters } from '../context/ChapterContext'
import { checkAssetIdExists } from '../services/assetService'

type AssetCategory = 'Device' | 'Part' | 'Tool'
type DeviceSubtype = 'Desktop' | 'Laptop' | 'Tablet'

// ─── Form state ───────────────────────────────────────────────────────────────
interface FormState {
  // Shared
  chapter: string
  acquisitionDate: string
  // Device (BaseDevice)
  manufacturer: string | null
  model: string
  year: string
  cpu: string
  ram: string
  ramGeneration: string | null
  storage: string
  storageType: string | null
  status: DeviceStatus
  // Desktop
  hasWifi: 'Yes' | 'No' | 'Unknown'
  // Laptop
  includesCharger: ChargerStatus
  designBatteryCapacity: string
  actualBatteryCapacity: string
  // Tablet
  workingBattery: WorkingBattery
  // Part
  partType: string | null   // FCombo — maps to Part_Type.Name
  description: string
  wasPurchased: boolean
  containedIn: string
  // Tool
  toolType: string
  toolDescription: string
  // Shared optional
  value: string             // optional monetary value (Asset.Value)
}

const DEFAULT_FORM: FormState = {
  chapter: '',
  acquisitionDate: '',
  manufacturer: null,
  model: '',
  year: String(new Date().getFullYear()),
  cpu: '',
  ram: '',
  ramGeneration: null,
  storage: '',
  storageType: null,
  status: 'Not Started',
  hasWifi: 'Unknown',
  includesCharger: 'Unknown',
  designBatteryCapacity: '',
  actualBatteryCapacity: '',
  workingBattery: 'Unknown',
  partType: null,
  description: '',
  wasPurchased: false,
  containedIn: '',
  toolType: '',
  toolDescription: '',
  value: '',
}

// ─── Form primitives ──────────────────────────────────────────────────────────
const iCls = 'w-full text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white'
const lCls = 'text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 block'
const Req  = () => <span className="text-red-400 ml-0.5">*</span>

function FText({ label, value, onChange, req, type = 'text', placeholder, colSpan, min, max, maxLength }: {
  label: string; value: string; onChange: (v: string) => void
  req?: boolean; type?: string; placeholder?: string; colSpan?: boolean
  min?: number; max?: number; maxLength?: number
}) {
  return (
    <div className={colSpan ? 'col-span-full' : ''}>
      <label className={lCls}>{label}{req && <Req />}</label>
      <input type={type} value={value} placeholder={placeholder}
        min={min} max={max} maxLength={maxLength}
        onChange={e => onChange(e.target.value)} className={iCls} />
    </div>
  )
}

function FSelect<T extends string>({ label, value, options, onChange, req }: {
  label: string; value: T; options: readonly T[] | T[]; onChange: (v: T) => void; req?: boolean
}) {
  return (
    <div>
      <label className={lCls}>{label}{req && <Req />}</label>
      <select value={value} onChange={e => onChange(e.target.value as T)} className={`${iCls} cursor-pointer`}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function FCombo({ label, value, options, onChange, req, placeholder, maxLength }: {
  label: string; value: string | null; options: string[]
  onChange: (v: string | null) => void; req?: boolean; placeholder?: string; maxLength?: number
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
      <label className={lCls}>{label}{req && <Req />}</label>
      <select value={selectVal} onChange={e => handleSelect(e.target.value)} className={`${iCls} cursor-pointer`}>
        <option value="">—</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        <option value="__custom__">Custom…</option>
      </select>
      {customMode && (
        <input autoFocus type="text" value={customText} placeholder={placeholder ?? 'Enter value'}
          maxLength={maxLength}
          onChange={e => handleCustom(e.target.value)} className={`${iCls} mt-2`} />
      )}
    </div>
  )
}

// ─── Step 1: Category ─────────────────────────────────────────────────────────
const CATEGORY_CARDS: { cat: AssetCategory; color: string; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    cat: 'Device',
    color: 'border-heart-blue/25 bg-heart-blue/5 hover:bg-heart-blue/10 text-heart-blue',
    title: 'Device',
    desc: 'Desktop, laptop, or tablet computer',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    cat: 'Part',
    color: 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600',
    title: 'Part',
    desc: 'RAM, SSD, charger, or other component',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2"/>
        <rect x="9" y="9" width="6" height="6"/>
        <line x1="9" y1="2" x2="9" y2="4"/><line x1="15" y1="2" x2="15" y2="4"/>
        <line x1="9" y1="20" x2="9" y2="22"/><line x1="15" y1="20" x2="15" y2="22"/>
        <line x1="20" y1="9" x2="22" y2="9"/><line x1="20" y1="14" x2="22" y2="14"/>
        <line x1="2" y1="9" x2="4" y2="9"/><line x1="2" y1="14" x2="4" y2="14"/>
      </svg>
    ),
  },
  {
    cat: 'Tool',
    color: 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-600',
    title: 'Tool',
    desc: 'Screwdriver, thermal paste, USB drive, etc.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
]

function CategoryStep({ onSelect }: { onSelect: (cat: AssetCategory) => void }) {
  return (
    <div>
      <p className="text-sm text-slate-500 mb-5">What type of asset is this?</p>
      <div className="grid grid-cols-3 gap-4">
        {CATEGORY_CARDS.map(({ cat, color, title, desc, icon }) => (
          <button key={cat} onClick={() => onSelect(cat)}
            className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all text-center ${color}`}>
            <div className="opacity-75">{icon}</div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs opacity-70 mt-0.5 leading-snug">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 2: Device subtype ───────────────────────────────────────────────────
const SUBTYPE_CARDS: { sub: DeviceSubtype; title: string; desc: string; icon: React.ReactNode }[] = [
  {
    sub: 'Desktop',
    title: 'Desktop',
    desc: 'Tower or all-in-one',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    sub: 'Laptop',
    title: 'Laptop',
    desc: 'Portable laptop computer',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55A1 1 0 0 1 20.37 20H3.62a1 1 0 0 1-.9-1.45L4 16"/>
      </svg>
    ),
  },
  {
    sub: 'Tablet',
    title: 'Tablet',
    desc: 'Touch-screen tablet',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
  },
]

function SubtypeStep({ onSelect }: { onSelect: (sub: DeviceSubtype) => void }) {
  return (
    <div>
      <p className="text-sm text-slate-500 mb-5">What kind of device is this?</p>
      <div className="grid grid-cols-3 gap-4">
        {SUBTYPE_CARDS.map(({ sub, title, desc, icon }) => (
          <button key={sub} onClick={() => onSelect(sub)}
            className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-heart-blue/25 bg-heart-blue/5 hover:bg-heart-blue/10 text-heart-blue transition-all text-center">
            <div className="opacity-75">{icon}</div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-xs opacity-70 mt-0.5">{desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Step 3: Fields form ──────────────────────────────────────────────────────
function FieldsForm({ category, subtype, form, setForm, lookups }: {
  category: AssetCategory
  subtype: DeviceSubtype | null
  form: FormState
  setForm: Dispatch<SetStateAction<FormState>>
  lookups: import('../hooks/useLookups').LookupData
}) {
  function set<K extends keyof FormState>(key: K) {
    return (value: FormState[K]) => setForm(prev => ({ ...prev, [key]: value }))
  }

  if (category === 'Tool') {
    return (
      <div className="grid grid-cols-2 gap-5">
        <FCombo label="Tool Type" value={form.toolType || null} options={lookups.toolTypes} onChange={v => set('toolType')(v ?? '')} req placeholder="e.g. Soldering Iron" maxLength={20} />
        <FSelect label="Chapter" value={form.chapter} options={lookups.chapters} onChange={set('chapter')} req />
        <FText label="Description" value={form.toolDescription} onChange={set('toolDescription')} req colSpan placeholder="e.g. Ventoy bootable 32GB drive" maxLength={500} />
        <FText label="Value ($)" value={form.value} onChange={set('value')} type="number" placeholder="e.g. 12.99" />
        <div>
          <label className={lCls}>Acquisition Date</label>
          <input type="date" value={form.acquisitionDate} onChange={e => set('acquisitionDate')(e.target.value)}
            className={iCls} />
        </div>
      </div>
    )
  }

  if (category === 'Part') {
    return (
      <div className="grid grid-cols-2 gap-5">
        <FCombo label="Part Type" value={form.partType} options={lookups.partTypes} onChange={set('partType')} req placeholder="e.g. SODIMM, Charger" maxLength={50} />
        <FSelect label="Chapter" value={form.chapter} options={lookups.chapters} onChange={set('chapter')} req />
        <FText label="Description" value={form.description} onChange={set('description')} req colSpan placeholder="e.g. DDR4 8 GB stick, 256 GB NVMe drive" />
        <div>
          <label className={lCls}>Acquisition Type <Req /></label>
          <div className="flex gap-3 mt-1">
            {[{ val: false, label: 'Donated' }, { val: true, label: 'Purchased' }].map(opt => (
              <label key={String(opt.val)}
                className={`flex-1 flex items-center gap-2.5 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium
                  ${form.wasPurchased === opt.val
                    ? 'border-heart-blue bg-heart-blue/5 text-heart-blue'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                <input type="radio" className="sr-only" checked={form.wasPurchased === opt.val}
                  onChange={() => setForm(p => ({ ...p, wasPurchased: opt.val }))} />
                <span className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center
                  ${form.wasPurchased === opt.val ? 'border-heart-blue' : 'border-slate-300'}`}>
                  {form.wasPurchased === opt.val && <span className="w-2 h-2 rounded-full bg-heart-blue" />}
                </span>
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className={lCls}>Contained In (Device ID)</label>
          <input
            type="number" min="0" step="1"
            value={form.containedIn}
            placeholder="Optional — e.g. 1001"
            onKeyDown={e => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
            onChange={e => set('containedIn')(e.target.value)}
            className={iCls}
          />
        </div>
        <FText label="Value ($)" value={form.value} onChange={set('value')} type="number" placeholder="e.g. 29.99" />
        <div>
          <label className={lCls}>Acquisition Date</label>
          <input type="date" value={form.acquisitionDate} onChange={e => set('acquisitionDate')(e.target.value)}
            className={iCls} />
        </div>
      </div>
    )
  }

  // Device
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-5">
        <FCombo label="Manufacturer" value={form.manufacturer} options={lookups.manufacturers} onChange={set('manufacturer')} req placeholder="e.g. Asus" maxLength={50} />
        <FText label="Model" value={form.model} onChange={set('model')} req placeholder="e.g. ThinkPad X1" maxLength={50} />
        <FText label="Year" value={form.year} onChange={set('year')} req type="number" placeholder="e.g. 2021" min={1980} max={new Date().getFullYear()} />
        <FSelect label="Status" value={form.status} options={lookups.deviceStatuses} onChange={set('status')} req />
        <FText label="CPU" value={form.cpu} onChange={set('cpu')} placeholder="e.g. i5-1135G7" maxLength={50} />
        <FSelect label="Chapter" value={form.chapter} options={lookups.chapters} onChange={set('chapter')} req />
        <FText label="RAM (GB)" value={form.ram} onChange={set('ram')} req type="number" placeholder="e.g. 16" min={0} />
        <FCombo label="RAM Generation" value={form.ramGeneration} options={lookups.ramGenerations} onChange={set('ramGeneration')} placeholder="e.g. DDR4" maxLength={20} />
        <FText label="Storage (GB)" value={form.storage} onChange={set('storage')} req type="number" placeholder="e.g. 256" min={0} />
        <FCombo label="Storage Type" value={form.storageType} options={lookups.storageTypes} onChange={set('storageType')} placeholder="e.g. SSD" maxLength={30} />
        <FText label="Value ($)" value={form.value} onChange={set('value')} type="number" placeholder="e.g. 150.00" />
        <div>
          <label className={lCls}>Acquisition Date</label>
          <input type="date" value={form.acquisitionDate} onChange={e => set('acquisitionDate')(e.target.value)}
            className={iCls} />
        </div>
      </div>

      {subtype === 'Desktop' && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100 mb-4">Desktop Details</p>
          <div className="grid grid-cols-2 gap-5">
            <FSelect label="Has Wi-Fi" value={form.hasWifi} options={lookups.wifiOpts} onChange={set('hasWifi')} />
          </div>
        </div>
      )}

      {subtype === 'Laptop' && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100 mb-4">Laptop Details</p>
          <div className="grid grid-cols-2 gap-5">
            <FSelect label="Charger" value={form.includesCharger} options={lookups.chargerStatuses} onChange={set('includesCharger')} req />
            <FText label="Design Capacity (mWh)" value={form.designBatteryCapacity} onChange={set('designBatteryCapacity')} type="number" placeholder="e.g. 56000" min={1} />
            <FText label="Actual Capacity (mWh)" value={form.actualBatteryCapacity} onChange={set('actualBatteryCapacity')} type="number" placeholder="e.g. 48000" min={1} />
            {form.actualBatteryCapacity && form.designBatteryCapacity &&
              Number(form.actualBatteryCapacity) > Number(form.designBatteryCapacity) && (
              <p className="col-span-full text-xs text-red-500 -mt-3">
                Actual capacity cannot exceed design capacity.
              </p>
            )}
          </div>
        </div>
      )}

      {subtype === 'Tablet' && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 pb-3 border-b border-slate-100 mb-4">Tablet Details</p>
          <div className="grid grid-cols-2 gap-5">
            <FSelect label="Charger" value={form.includesCharger} options={lookups.chargerStatuses} onChange={set('includesCharger')} req />
            <FSelect label="Working Battery" value={form.workingBattery} options={lookups.workingBatteryOpts} onChange={set('workingBattery')} req />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export function AddAssetModal({ scanId, onAdd, onCancel }: {
  scanId?: number
  onAdd?: (asset: AnyDevice | Part | Tool) => void
  onCancel: () => void
}) {
  const lookups = useLookups()
  const { chapters: chapterList } = useChapters()

  // Set default chapter once lookup data loads
  const [step, setStep]         = useState<'id' | 'category' | 'subtype' | 'fields'>(scanId !== undefined ? 'category' : 'id')
  const [idMode, setIdMode]     = useState<'input' | 'generate'>(scanId !== undefined ? 'input' : 'generate')
  const [inputId, setInputId]   = useState(scanId !== undefined ? String(scanId) : '')
  const [category, setCategory] = useState<AssetCategory | null>(null)
  const [subtype, setSubtype]   = useState<DeviceSubtype | null>(null)
  const [form, setForm]         = useState<FormState>({ ...DEFAULT_FORM })
  const [idConflict, setIdConflict] = useState(false)

  // Pre-select first chapter when lookups load
  useEffect(() => {
    if (lookups.chapters.length > 0 && form.chapter === '') {
      const first = lookups.chapters[0]
      Promise.resolve().then(() => setForm(prev => ({ ...prev, chapter: first })))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookups.chapters.length])

  // Async ID conflict check
  useEffect(() => {
    let cancelled = false
    const n = Number(inputId)
    if (idMode !== 'input' || !inputId || !Number.isInteger(n) || n <= 0) {
      Promise.resolve().then(() => { if (!cancelled) setIdConflict(false) })
      return () => { cancelled = true }
    }
    checkAssetIdExists(n).then(exists => { if (!cancelled) setIdConflict(exists) })
    return () => { cancelled = true }
  }, [idMode, inputId])

  function isIdStepValid(): boolean {
    if (idMode === 'generate') return true
    const n = Number(inputId)
    if (!inputId || !Number.isInteger(n) || n <= 0) return false
    return !idConflict
  }

  function idError(): string | null {
    if (idMode === 'generate' || !inputId) return null
    const n = Number(inputId)
    if (!Number.isInteger(n) || n <= 0) return 'ID must be a positive whole number.'
    if (idConflict) return `ID ${n} is already in use.`
    return null
  }

  function handleSelectCategory(cat: AssetCategory) {
    setCategory(cat)
    setStep(cat === 'Device' ? 'subtype' : 'fields')
  }

  function handleSelectSubtype(sub: DeviceSubtype) {
    setSubtype(sub)
    setStep('fields')
  }

  function handleBack() {
    if (step === 'fields' && category === 'Device') setStep('subtype')
    else if (step === 'fields') setStep('category')
    else if (step === 'subtype') setStep('category')
    else if (step === 'category' && scanId === undefined) setStep('id')
  }

  function isValid(): boolean {
    if (!category) return false
    const f = form
    if (category === 'Tool') return f.toolType.trim() !== '' && f.toolDescription.trim() !== '' && f.chapter !== ''
    if (category === 'Part') return !!f.partType && f.description.trim() !== '' && f.chapter !== ''
    // Device — RAM and storage default to 0 in the DB, so 0 is valid; only require non-empty strings
    if (!(f.manufacturer?.trim() && f.model.trim() && f.year && f.ram !== '' && f.storage !== '' && f.chapter)) return false
    // Battery cross-validation: actual ≤ design (DB CHECK constraint)
    if (subtype === 'Laptop' && f.actualBatteryCapacity && f.designBatteryCapacity &&
        Number(f.actualBatteryCapacity) > Number(f.designBatteryCapacity)) return false
    return true
  }

  function handleSubmit() {
    if (!category || !isValid()) return

    if (category === 'Tool') {
      const tool: Tool = {
        id: idMode === 'input' ? Number(inputId) : 0,
        type: form.toolType.trim(),
        description: form.toolDescription.trim(),
        chapter: form.chapter,
        acquisitionDate: form.acquisitionDate || null,
        value: form.value ? Number(form.value) : null,
      }
      onAdd?.(tool)
      return
    }

    if (category === 'Part') {
      const chapterId = chapterList.find(c => c.name === form.chapter)?.id ?? 0
      const part: Part = {
        id: idMode === 'input' ? Number(inputId) : 0,
        type: form.partType ?? '',
        description: form.description.trim(),
        wasPurchased: form.wasPurchased,
        containedIn: form.containedIn ? Number(form.containedIn) : null,
        chapterId,
        acquisitionDate: form.acquisitionDate || null,
        value: form.value ? Number(form.value) : null,
      }
      onAdd?.(part)
      return
    }

    // Device
    const base = {
      id: idMode === 'input' ? Number(inputId) : 0,
      manufacturer: form.manufacturer?.trim() ?? '',
      model: form.model.trim(),
      year: Number(form.year),
      cpu: form.cpu.trim() || null,
      ram: Number(form.ram),
      ramGeneration: form.ramGeneration,
      storage: Number(form.storage),
      storageType: form.storageType,
      status: form.status,
      chapter: form.chapter,
      acquisitionDate: form.acquisitionDate || null,
      donatedDate: null,
      value: form.value ? Number(form.value) : null,
    }

    if (subtype === 'Desktop') {
      const device: AnyDevice = {
        ...base,
        type: 'Desktop',
        hasWifi: form.hasWifi === 'Unknown' ? null : form.hasWifi === 'Yes',
      }
      onAdd?.(device)
    } else if (subtype === 'Laptop') {
      const device: AnyDevice = {
        ...base,
        type: 'Laptop',
        includesCharger: form.includesCharger,
        designBatteryCapacity: form.designBatteryCapacity ? Number(form.designBatteryCapacity) : null,
        actualBatteryCapacity: form.actualBatteryCapacity ? Number(form.actualBatteryCapacity) : null,
        batteryHealth: null, // computed by DB
      }
      onAdd?.(device)
    } else if (subtype === 'Tablet') {
      const device: AnyDevice = {
        ...base,
        type: 'Tablet',
        includesCharger: form.includesCharger,
        workingBattery: form.workingBattery,
      }
      onAdd?.(device)
    }
  }

  // Step indicator
  const steps = scanId !== undefined
    ? (category === 'Device' ? ['Category', 'Device Type', 'Details'] : ['Category', 'Details'])
    : (category === 'Device' ? ['ID', 'Category', 'Device Type', 'Details'] : ['ID', 'Category', 'Details'])
  const stepIdx = scanId !== undefined
    ? (step === 'category' ? 0 : step === 'subtype' ? 1 : (category === 'Device' ? 2 : 1))
    : (step === 'id' ? 0 : step === 'category' ? 1 : step === 'subtype' ? 2 : (category === 'Device' ? 3 : 2))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Add New Asset</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {scanId !== undefined
                ? <>Barcode <span className="font-mono font-medium text-slate-600">#{scanId}</span> was not found — fill in the details below to add it.</>
                : 'Fill in the details below to add a new asset.'}
            </p>
          </div>
          <button onClick={onCancel}
            className="ml-4 shrink-0 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-6 pt-4 pb-2 flex items-center gap-1.5 shrink-0">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-1.5">
              {i > 0 && <div className={`h-px w-8 transition-colors ${i <= stepIdx ? 'bg-heart-blue/40' : 'bg-slate-200'}`} />}
              <div className="flex items-center gap-1.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  i < stepIdx  ? 'bg-heart-blue text-white' :
                  i === stepIdx ? 'bg-brand-red text-white' :
                  'bg-slate-100 text-slate-400'
                }`}>
                  {i < stepIdx ? '✓' : i + 1}
                </span>
                <span className={`text-xs font-medium transition-colors ${i === stepIdx ? 'text-brand-red' : 'text-slate-400'}`}>
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'id' && (
            <div>
              <p className="text-sm text-slate-500 mb-5">How should this asset's ID be assigned?</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {([['generate', 'Generate an ID', 'The system will assign an ID automatically when saved to the database.'], ['input', 'Input an ID', 'Manually enter the ID — useful when the barcode number is already known.']] as const).map(([mode, title, desc]) => (
                  <button key={mode} onClick={() => setIdMode(mode)}
                    className={`flex flex-col items-start gap-2 p-5 rounded-xl border-2 transition-all text-left ${
                      idMode === mode
                        ? 'border-heart-blue bg-heart-blue/5 text-heart-blue'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      idMode === mode ? 'border-heart-blue' : 'border-slate-300'
                    }`}>
                      {idMode === mode && <span className="w-2 h-2 rounded-full bg-heart-blue" />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{title}</p>
                      <p className="text-xs opacity-70 mt-0.5 leading-snug">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              {idMode === 'input' && (
                <div>
                  <label className={lCls}>Asset ID</label>
                  <input
                    type="number" min="1" step="1"
                    value={inputId}
                    placeholder="e.g. 1015"
                    onKeyDown={e => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
                    onChange={e => setInputId(e.target.value)}
                    className={`${iCls} ${idError() ? 'border-red-300 focus:ring-red-300 focus:border-red-300' : ''}`}
                  />
                  {idError() && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {idError()}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
          {step === 'category' && <CategoryStep onSelect={handleSelectCategory} />}
          {step === 'subtype'  && <SubtypeStep  onSelect={handleSelectSubtype} />}
          {step === 'fields'   && (
            <FieldsForm category={category!} subtype={subtype} form={form} setForm={setForm} lookups={lookups} />
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div>
            {step !== 'category' && (
              <button onClick={handleBack}
                className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            {step === 'id' && (
              <button onClick={() => setStep('category')} disabled={!isIdStepValid()}
                className="text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue-dark disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 rounded-lg transition-colors">
                Continue
              </button>
            )}
            {step === 'fields' && (
              <button onClick={handleSubmit} disabled={!isValid()}
                className="text-sm font-medium text-white bg-brand-red hover:bg-brand-red-dark disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 rounded-lg transition-colors">
                Add Asset
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
