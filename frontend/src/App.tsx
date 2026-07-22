import {
  createBrowserRouter,
  NavLink,
  Outlet,
  RouterProvider,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useState, useCallback } from "react";
import { ToastProvider, useToast } from "./context/ToastContext";
import Dashboard from "./pages/Dashboard";
import Devices from "./pages/Devices";
import Parts from "./pages/Parts";
import Tools from "./pages/Tools";
import Donations from "./pages/Donations";
import Chapters from "./pages/Chapters";
import DeviceDetail from "./pages/DeviceDetail";
import PartDetail from "./pages/PartDetail";
import ToolDetail from "./pages/ToolDetail";
import Search from "./pages/Search";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Account from "./pages/Account";
import AdminAccounts from "./pages/AdminAccounts";
import ManageParties from "./pages/ManageParties";
import PartyDetail from "./pages/PartyDetail";
import Scanner from "./pages/Scanner";
import { useBarcodeScanner } from "./hooks/useBarcodeScanner";
import { usePWA } from "./hooks/usePWA";
import { getDevice, createDevice } from "./services/deviceService";
import { getPart, createPart } from "./services/partService";
import { getTool, createTool } from "./services/toolService";
import { AddAssetModal } from "./components/AddAssetModal";
import { PrintLabelModal } from "./components/PrintLabelModal";
import { canPrintLabels } from "./utils/canPrintLabels";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChapterProvider, useIsNationalAdmin } from "./context/ChapterContext";
import { AddAssetProvider } from "./context/AddAssetContext";

import type { AnyDevice, Part, Tool } from "./types/inventory";

const Icons = {
  dashboard: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  devices: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  ),
  parts: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
    </svg>
  ),
  tools: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  donations: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  ),
  chapters: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  search: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  reports: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  settings: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  plus: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  barcode: (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 5v14M7 5v14M11 5v14M15 5v3M15 11v3M15 18v1M19 5v14" />
    </svg>
  ),
};

const navItems = [
  { to: "/", label: "Dashboard", icon: Icons.dashboard },
  { to: "/devices", label: "Devices", icon: Icons.devices },
  { to: "/parts", label: "Parts", icon: Icons.parts },
  { to: "/tools", label: "Tools", icon: Icons.tools },
  { to: "/search", label: "Search", icon: Icons.search },
  { to: "/reports", label: "Reports", icon: Icons.reports },
];

// Primary destinations shown in the mobile bottom tab bar (a compact subset of
// navItems). The remaining destinations + admin tools live in the drawer.
const bottomNavItems = [
  { to: "/", label: "Home", icon: Icons.dashboard },
  { to: "/devices", label: "Devices", icon: Icons.devices },
  { to: "/parts", label: "Parts", icon: Icons.parts },
  { to: "/tools", label: "Tools", icon: Icons.tools },
];

const adminNavItems = [
  {
    to: "/admin/accounts",
    label: "Manage Accounts",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: "/chapters",
    label: "Manage Chapters",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  { to: "/settings", label: "Manage Options", icon: Icons.settings },
  {
    to: "/admin/parties",
    label: "Manage Parties",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="8" r="3" />
        <path d="M2 20c0-3 2.7-5 6-5" />
        <circle cx="16" cy="8" r="3" />
        <path d="M13 20c0-3 2.7-5 6-5" />
      </svg>
    ),
  },
];

function SidebarContent() {
  const { auth } = useAuth();
  const isNationalAdmin = useIsNationalAdmin();
  const canManageAccounts = auth?.role === "Admin" || auth?.role === "Chapter Admin";
  return (
    <>
      <div className="px-6 pt-8 pb-7">
        <div className="flex items-center gap-3">
          <img src="/icon.png" alt="BinaryHeart" className="w-10 h-10 object-contain" />
          <div>
            <span className="font-lato font-semibold text-base tracking-tight">
              <span className="text-brand-red">Binary</span>
              <span className="text-heart-blue">Heart</span>
            </span>
            <p className="text-slate-400 text-xs mt-0.5">Inventory System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest px-3 mb-2">
          Menu
        </p>
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-heart-blue"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? "text-brand-red" : ""}>{icon}</span>
                <span className={isActive ? "text-white" : ""}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        {canManageAccounts && (
          <>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest px-3 mb-2 mt-6 pt-4 border-t border-slate-100">
              Administrator
            </p>
            <div className="space-y-0.5 mt-2">
              {adminNavItems
                .filter((item) => item.to !== "/chapters" || isNationalAdmin)
                .map(({ to, label, icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-heart-blue"
                          : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span className={isActive ? "text-brand-red" : ""}>{icon}</span>
                        <span className={isActive ? "text-white" : ""}>{label}</span>
                      </>
                    )}
                  </NavLink>
                ))}
            </div>
          </>
        )}
      </nav>

      <div className="px-3 py-4 mt-auto border-t border-slate-200">
        <NavLink
          to="/account"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
              isActive ? "bg-heart-blue" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div
                className={`w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center shrink-0 ${
                  isActive ? "bg-white/20" : ""
                }`}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isActive ? "text-white" : "text-slate-500"}
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <span
                className={`flex-1 min-w-0 truncate ${isActive ? "text-white" : "text-slate-700"}`}
              >
                <AccountLabel isActive={isActive} />
              </span>
            </>
          )}
        </NavLink>
      </div>
    </>
  );
}

/** Fixed sidebar shown on large screens (lg+). Mobile uses the drawer + tab bar. */
function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-slate-200 h-dvh sticky top-0 overflow-y-auto">
      <SidebarContent />
    </aside>
  );
}

/** Hamburger icon used in the mobile top bar. */
const MenuIcon = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

/** Sticky top bar shown on small screens with a hamburger + wordmark. */
function MobileTopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header
      className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center gap-3 px-4 h-14">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open menu"
          className="-ml-2 p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
        >
          {MenuIcon}
        </button>
        <div className="flex items-center gap-2">
          <img src="/icon.png" alt="BinaryHeart" className="w-7 h-7 object-contain" />
          <span className="font-lato font-semibold text-sm tracking-tight">
            <span className="text-brand-red">Binary</span>
            <span className="text-heart-blue">Heart</span>
          </span>
        </div>
      </div>
    </header>
  );
}

/** Slide-in navigation drawer for small screens. Renders the full menu. */
function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div
      className={`lg:hidden fixed inset-0 z-40 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute left-0 top-0 h-dvh w-72 max-w-[85%] bg-white shadow-xl flex flex-col overflow-y-auto transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Any click inside (e.g. a nav link) closes the drawer. */}
        <div onClick={onClose} className="flex flex-col min-h-full">
          <SidebarContent />
        </div>
      </aside>
    </div>
  );
}

/** Fixed bottom tab bar for small screens. Shows a Scanner tab on touch devices. */
function BottomTabBar() {
  const { isTouch } = usePWA();
  const showScanner = isTouch;
  const tabCls = (isActive: boolean) =>
    `flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors ${
      isActive ? "text-heart-blue" : "text-slate-400"
    }`;
  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-16">
        {bottomNavItems.map(({ to, label, icon }) => (
          <NavLink key={to} to={to} end className={({ isActive }) => tabCls(isActive)}>
            {({ isActive }) => (
              <>
                <span className={isActive ? "text-brand-red" : ""}>{icon}</span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
        {showScanner && (
          <NavLink to="/scanner" className={({ isActive }) => tabCls(isActive)}>
            {({ isActive }) => (
              <>
                <span className={isActive ? "text-brand-red" : ""}>{Icons.barcode}</span>
                <span>Scan</span>
              </>
            )}
          </NavLink>
        )}
      </div>
    </nav>
  );
}

function AccountLabel({ isActive }: { isActive: boolean }) {
  const { auth } = useAuth();
  return (
    <span
      className={`text-sm font-medium truncate block ${isActive ? "text-white" : "text-slate-700"}`}
    >
      {auth?.username ?? "Account"}
    </span>
  );
}

/** Forces detail pages to remount when the :id param changes so state resets correctly. */
function DeviceDetailKeyed() {
  const { id } = useParams<{ id: string }>();
  return <DeviceDetail key={id} />;
}
function PartDetailKeyed() {
  const { id } = useParams<{ id: string }>();
  return <PartDetail key={id} />;
}
function ToolDetailKeyed() {
  const { id } = useParams<{ id: string }>();
  return <ToolDetail key={id} />;
}

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "login", element: <Login /> },
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "devices",
        element: (
          <ProtectedRoute>
            <Devices />
          </ProtectedRoute>
        ),
      },
      {
        path: "devices/:id",
        element: (
          <ProtectedRoute>
            <DeviceDetailKeyed />
          </ProtectedRoute>
        ),
      },
      {
        path: "parts",
        element: (
          <ProtectedRoute>
            <Parts />
          </ProtectedRoute>
        ),
      },
      {
        path: "parts/:id",
        element: (
          <ProtectedRoute>
            <PartDetailKeyed />
          </ProtectedRoute>
        ),
      },
      {
        path: "tools",
        element: (
          <ProtectedRoute>
            <Tools />
          </ProtectedRoute>
        ),
      },
      {
        path: "tools/:id",
        element: (
          <ProtectedRoute>
            <ToolDetailKeyed />
          </ProtectedRoute>
        ),
      },
      {
        path: "donations",
        element: (
          <ProtectedRoute>
            <Donations />
          </ProtectedRoute>
        ),
      },
      {
        path: "chapters",
        element: (
          <ProtectedRoute>
            <Chapters />
          </ProtectedRoute>
        ),
      },
      {
        path: "search",
        element: (
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        ),
      },
      {
        path: "reports",
        element: (
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: "account",
        element: (
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/accounts",
        element: (
          <ProtectedRoute>
            <AdminAccounts />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/parties",
        element: (
          <ProtectedRoute>
            <ManageParties />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin/parties/:id",
        element: (
          <ProtectedRoute>
            <PartyDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "scanner",
        element: (
          <ProtectedRoute>
            <Scanner />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

function RootLayout() {
  return (
    <AuthProvider>
      <ChapterProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </ChapterProvider>
    </AuthProvider>
  );
}

function AppShell() {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { showToast } = useToast();
  const [pendingScanId, setPendingScanId] = useState<number | null>(null);
  const [pendingPrintId, setPendingPrintId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useBarcodeScanner({
    onScan: useCallback(
      async (barcode: string) => {
        const id = Number(barcode);
        if (Number.isNaN(id)) {
          showToast(`Invalid barcode: "${barcode}"`, false);
          return;
        }

        const device = await getDevice(id);
        if (device) {
          navigate(`/devices/${id}`);
          return;
        }

        const part = await getPart(id);
        if (part) {
          navigate(`/parts/${id}`);
          return;
        }

        const tool = await getTool(id);
        if (tool) {
          navigate(`/tools/${id}`);
          return;
        }

        // Unknown barcode — prompt to create a new asset
        setPendingScanId(id);
      },
      [navigate, showToast]
    ),
  });

  async function handleAddAsset(asset: AnyDevice | Part | Tool) {
    try {
      if ("ram" in asset) {
        const saved = await createDevice(asset as AnyDevice);
        setPendingScanId(null);
        setPendingPrintId(saved.id);
        navigate(`/devices/${saved.id}`);
      } else if ("wasPurchased" in asset) {
        const saved = await createPart(asset as Part);
        setPendingScanId(null);
        setPendingPrintId(saved.id);
        navigate(`/parts/${saved.id}`);
      } else {
        const saved = await createTool(asset as Tool);
        setPendingScanId(null);
        setPendingPrintId(saved.id);
        navigate(`/tools/${saved.id}`);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save asset", false);
    }
  }

  return (
    <AddAssetProvider onOpen={(scanId?: number) => setPendingScanId(scanId ?? -1)}>
      <div className="flex min-h-dvh bg-slate-50 text-slate-900">
        {auth && <Sidebar />}
        <div className="flex-1 min-w-0 flex flex-col">
          {auth && <MobileTopBar onMenu={() => setDrawerOpen(true)} />}
          <main className={`flex-1 px-4 py-5 lg:px-10 lg:py-12 ${auth ? "pb-24 lg:pb-12" : ""}`}>
            <Outlet />
          </main>
        </div>

        {auth && <BottomTabBar />}
        {auth && <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />}

        {/* Add asset modal (shown when an unknown barcode is scanned) */}
        {pendingScanId !== null && (
          <AddAssetModal
            scanId={pendingScanId >= 0 ? pendingScanId : undefined}
            onAdd={handleAddAsset}
            onCancel={() => setPendingScanId(null)}
          />
        )}

        {/* Print label modal — shown after a new asset is saved */}
        {pendingPrintId !== null && canPrintLabels() && (
          <PrintLabelModal assetId={pendingPrintId} onClose={() => setPendingPrintId(null)} />
        )}
      </div>
    </AddAssetProvider>
  );
}

export default App;
