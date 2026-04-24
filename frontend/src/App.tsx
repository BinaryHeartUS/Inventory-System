import { BrowserRouter, NavLink, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useState, useCallback } from 'react'
import Dashboard    from './pages/Dashboard'
import Devices      from './pages/Devices'
import Parts        from './pages/Parts'
import Tools        from './pages/Tools'
import Donations    from './pages/Donations'
import Chapters     from './pages/Chapters'
import DeviceDetail from './pages/DeviceDetail'
import PartDetail   from './pages/PartDetail'
import ToolDetail   from './pages/ToolDetail'
import { useBarcodeScanner } from './hooks/useBarcodeScanner'
import { getDevice, createDevice } from './services/deviceService'
import { getPart, createPart } from './services/partService'
import { getTool, createTool } from './services/toolService'
import { AddAssetModal } from './components/AddAssetModal'
import { PrintLabelModal } from './components/PrintLabelModal'
import type { AnyDevice, Part, Tool } from './types/inventory'

const Icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  devices: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
    </svg>
  ),
  parts: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  ),
  tools: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
    </svg>
  ),
  donations: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  chapters: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  barcode: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 5v14M7 5v14M11 5v14M15 5v3M15 11v3M15 18v1M19 5v14"/>
    </svg>
  ),
  search: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: Icons.dashboard },
  { to: '/devices', label: 'Devices', icon: Icons.devices },
  { to: '/parts', label: 'Parts', icon: Icons.parts },
  { to: '/tools', label: 'Tools', icon: Icons.tools },
  { to: '/donations', label: 'Donations', icon: Icons.donations },
  { to: '/chapters', label: 'Chapters', icon: Icons.chapters },
]

function Sidebar() {
  return (
    <aside className="w-60 shrink-0 flex flex-col bg-slate-900 min-h-dvh">
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
              <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">BinaryHeart</span>
        </div>
        <p className="text-slate-500 text-xs mt-1 pl-9">Inventory System</p>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">Menu</p>
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-violet-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            {icon}
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-5 mt-auto border-t border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-violet-900 flex items-center justify-center text-violet-300 text-[10px] font-bold">BH</div>
          <div>
            <p className="text-slate-300 text-xs font-medium leading-none">BinaryHeart US</p>
            <p className="text-slate-500 text-[11px] mt-0.5">Non-profit</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

function AppHeader({ onAddAsset }: { onAddAsset: () => void }) {
  const { pathname } = useLocation()
  const placeholder: Record<string, string> = {
    '/':          'Search devices, parts…',
    '/devices':   'Search devices…',
    '/parts':     'Search parts…',
    '/donations': 'Search donations…',
    '/chapters':  'Search chapters…',
  }
  return (
    <header className="bg-white border-b border-slate-200 px-8 h-14 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2 text-slate-400">
        {Icons.search}
        <input
          type="text"
          placeholder={placeholder[pathname] ?? 'Search…'}
          className="text-sm text-slate-700 outline-none placeholder:text-slate-400 w-56 bg-transparent"
        />
      </div>
      <button
        onClick={onAddAsset}
        className="flex items-center gap-1.5 text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors">
        {Icons.plus}
        Add Asset
      </button>
    </header>
  )
}

/** Forces detail pages to remount when the :id param changes so state resets correctly. */
function DeviceDetailKeyed() {
  const { id } = useParams<{ id: string }>()
  return <DeviceDetail key={id} />
}
function PartDetailKeyed() {
  const { id } = useParams<{ id: string }>()
  return <PartDetail key={id} />
}
function ToolDetailKeyed() {
  const { id } = useParams<{ id: string }>()
  return <ToolDetail key={id} />
}

function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}

function AppInner() {
  const navigate = useNavigate()
  const [toast, setToast]               = useState<{ msg: string; ok: boolean } | null>(null)
  const [pendingScanId, setPendingScanId] = useState<number | null>(null)
  const [pendingPrintId, setPendingPrintId] = useState<number | null>(null)

  const showToast = useCallback((msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useBarcodeScanner({
    onScan: useCallback(async (barcode: string) => {
      const id = Number(barcode)
      if (Number.isNaN(id)) { showToast(`Invalid barcode: "${barcode}"`, false); return }

      const device = await getDevice(id)
      if (device) { navigate(`/devices/${id}`); return }

      const part = await getPart(id)
      if (part) { navigate(`/parts/${id}`); return }

      const tool = await getTool(id)
      if (tool) { navigate(`/tools/${id}`); return }

      // Unknown barcode — prompt to create a new asset
      setPendingScanId(id)
    }, [navigate, showToast]),
  })

  // TODO: Replace with POST /api/assets (device/part/tool) when backend is ready.
  async function handleAddAsset(asset: AnyDevice | Part | Tool) {
    if ('model' in asset) {
      const saved = await createDevice(asset as AnyDevice)
      setPendingScanId(null)
      setPendingPrintId(saved.id)
      navigate(`/devices/${saved.id}`)
    } else if ('description' in asset) {
      const saved = await createPart(asset as Part)
      setPendingScanId(null)
      setPendingPrintId(saved.id)
    } else {
      const saved = await createTool(asset as Tool)
      setPendingScanId(null)
      setPendingPrintId(saved.id)
    }
  }

  return (
    <div className="flex min-h-dvh bg-slate-50 text-slate-900">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onAddAsset={() => setPendingScanId(-1)} />
        <main className="flex-1 px-8 py-7">
          <Routes>
            <Route path="/"             element={<Dashboard />}    />
            <Route path="/devices"      element={<Devices />}            />
            <Route path="/devices/:id"  element={<DeviceDetailKeyed />}  />
            <Route path="/parts"        element={<Parts />}              />
            <Route path="/parts/:id"    element={<PartDetailKeyed />}    />
            <Route path="/tools"        element={<Tools />}              />
            <Route path="/tools/:id"    element={<ToolDetailKeyed />}    />
            <Route path="/donations"    element={<Donations />}          />
            <Route path="/chapters"     element={<Chapters />}           />
          </Routes>
        </main>
      </div>

      {/* Add asset modal (shown when an unknown barcode is scanned) */}
      {pendingScanId !== null && (
        <AddAssetModal
          scanId={pendingScanId >= 0 ? pendingScanId : undefined}
          onAdd={handleAddAsset}
          onCancel={() => setPendingScanId(null)}
        />
      )}

      {/* Print label modal — shown after a new asset is saved */}
      {pendingPrintId !== null && (
        <PrintLabelModal
          assetId={pendingPrintId}
          onClose={() => setPendingPrintId(null)}
        />
      )}

      {/* Scan toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all z-50 ${
          toast.ok
            ? 'bg-violet-600 text-white'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {toast.ok
            ? Icons.barcode
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          }
          {toast.msg}
        </div>
      )}
    </div>
  )
}

export default App
