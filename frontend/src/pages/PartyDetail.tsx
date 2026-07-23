import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getParty } from "../services/partyService";
import { getDevices } from "../services/deviceService";
import { getParts } from "../services/partService";
import { getTools } from "../services/toolService";
import { fetchAllPages } from "../services/api";
import type {
  PartyDetail,
  PersonDetail,
  OrgDetail,
  AnyDevice,
  Part,
  Tool,
} from "../types/inventory";
import { Field } from "../components/Field";
import { canManageAccounts } from "../utils/roles";
import { DonationReceiptModal, type ReceiptItem } from "../components/DonationReceiptModal";
import { SectionCard } from "../components/SectionCard";
import { DonatedTable } from "../components/DonatedTable";
import { AssetTable } from "../components/AssetTable";
import { Chevron } from "../components/Chevron";

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function PartyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numId = Number(id);
  const navigate = useNavigate();
  const { auth } = useAuth();
  const isAdmin = canManageAccounts(auth?.role);

  const [party, setParty] = useState<PartyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [donatedDevices, setDonatedDevices] = useState<AnyDevice[]>([]);
  const [receivedDevices, setReceivedDevices] = useState<AnyDevice[]>([]);
  const [donatedParts, setDonatedParts] = useState<Part[]>([]);
  const [donatedTools, setDonatedTools] = useState<Tool[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showReceipt, setShowReceipt] = useState(false);
  const [donatedOpen, setDonatedOpen] = useState(true);
  const [receivedOpen, setReceivedOpen] = useState(true);

  useEffect(() => {
    if (!numId) return;
    Promise.all([
      getParty(numId),
      fetchAllPages((pageKey, pageSize) =>
        getDevices({
          pageKey,
          pageSize,
          donorId: numId,
          includeDonated: true,
          includeScrapped: true,
        })
      ),
      fetchAllPages((pageKey, pageSize) =>
        getDevices({
          pageKey,
          pageSize,
          recipientId: numId,
          includeDonated: true,
          includeScrapped: true,
        })
      ),
      fetchAllPages((pageKey, pageSize) => getParts({ pageKey, pageSize, donorId: numId })),
      fetchAllPages((pageKey, pageSize) => getTools({ pageKey, pageSize, donorId: numId })),
    ])
      .then(([p, byDonor, byRecipient, parts, tools]) => {
        setParty(p);
        setDonatedDevices(byDonor);
        setReceivedDevices(byRecipient);
        setDonatedParts(parts);
        setDonatedTools(tools);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [numId]);

  if (!isAdmin) return <Navigate to="/" replace />;

  if (loading)
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );

  if (!party)
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-sm font-semibold text-slate-900">Party not found</p>
        <Link
          to="/admin/parties"
          className="text-sm font-medium text-slate-600 hover:text-slate-800"
        >
          ← Back to Manage Parties
        </Link>
      </div>
    );

  const isPerson = party.type === "Person";
  const person = isPerson ? (party as PersonDetail) : null;
  const org = !isPerson ? (party as OrgDetail) : null;
  const loc = isPerson ? person?.location : org?.location;

  // Map all donatable ids → ReceiptItem for the modal
  const allDonatedById = new Map<number, ReceiptItem>([
    ...donatedDevices.map(
      (d) =>
        [
          d.id,
          { id: d.id, label: `${d.manufacturer} ${d.model}`, year: d.year, value: d.value },
        ] as [number, ReceiptItem]
    ),
    ...donatedParts.map(
      (p) =>
        [p.id, { id: p.id, label: p.type, year: null, value: p.value }] as [number, ReceiptItem]
    ),
    ...donatedTools.map(
      (t) =>
        [t.id, { id: t.id, label: t.description, year: null, value: t.value }] as [
          number,
          ReceiptItem,
        ]
    ),
  ]);
  const selectedItems: ReceiptItem[] = Array.from(selected)
    .map((i) => allDonatedById.get(i)!)
    .filter(Boolean);

  function toggle(id: number) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function toggleAll(ids: number[]) {
    const allIn = ids.every((id) => selected.has(id));
    setSelected((prev) => {
      const n = new Set(prev);
      if (allIn) ids.forEach((id) => n.delete(id));
      else ids.forEach((id) => n.add(id));
      return n;
    });
  }

  const deviceIcon = (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
  const receiveIcon = (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
  const partIcon = (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="2" x2="9" y2="4" />
      <line x1="15" y1="2" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="22" />
      <line x1="15" y1="20" x2="15" y2="22" />
      <line x1="20" y1="9" x2="22" y2="9" />
      <line x1="20" y1="14" x2="22" y2="14" />
      <line x1="2" y1="9" x2="4" y2="9" />
      <line x1="2" y1="14" x2="4" y2="14" />
    </svg>
  );
  const toolIcon = (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );

  return (
    <>
      {showReceipt && (
        <DonationReceiptModal
          donorName={party.name}
          items={selectedItems}
          onClose={() => {
            setShowReceipt(false);
            setSelectMode(false);
            setSelected(new Set());
          }}
        />
      )}

      <div className="space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to="/admin/parties" className="hover:text-slate-600 transition-colors">
            Manage Parties
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{party.name}</span>
        </div>

        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide ${isPerson ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}
                >
                  {isPerson ? "Individual" : "Organization"}
                </span>
                <span className="font-mono text-xs text-slate-400">#{party.id}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900">{party.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!selectMode &&
                (donatedDevices.length > 0 ||
                  donatedParts.length > 0 ||
                  donatedTools.length > 0) && (
                  <button
                    onClick={() => setSelectMode(true)}
                    className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Create Donation Receipt
                  </button>
                )}
              <button
                onClick={() => navigate(-1)}
                className="text-sm font-medium text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                ← Back
              </button>
            </div>
          </div>
        </div>

        {/* Info card */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-5 sm:px-6 sm:py-6 grid grid-cols-2 md:grid-cols-4 gap-y-5 gap-x-4 sm:gap-x-8">
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
              {selected.size > 0
                ? `${selected.size} item${selected.size !== 1 ? "s" : ""} selected`
                : "Select items to include in the receipt"}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectMode(false);
                  setSelected(new Set());
                }}
                className="text-sm font-medium text-slate-600 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowReceipt(true)}
                disabled={selected.size === 0}
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue/90 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-1.5 rounded-lg transition-colors"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Generate Donor Receipt
              </button>
            </div>
          </div>
        )}

        {/* Donated group */}
        <div className="space-y-3">
          <button
            onClick={() => setDonatedOpen((o) => !o)}
            className="w-full flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            <Chevron expanded={donatedOpen} />
            Donated
            <span className="ml-1 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {donatedDevices.length + donatedParts.length + donatedTools.length}
            </span>
          </button>

          {donatedOpen && (
            <div className="space-y-3">
              {/* Donated devices */}
              <SectionCard title="Donated Devices" count={donatedDevices.length} icon={deviceIcon}>
                <DonatedTable
                  rows={donatedDevices.map((d) => ({
                    id: d.id,
                    label: `${d.manufacturer} ${d.model}`,
                    year: d.year,
                    detail: `${d.type} · ${d.year}`,
                    value: d.value,
                    acquired: d.acquisitionDate ?? null,
                  }))}
                  basePath="/devices"
                  emptyMessage="No donated devices."
                  selectMode={selectMode}
                  selected={selected}
                  onToggle={toggle}
                  onToggleAll={toggleAll}
                />
              </SectionCard>

              {/* Donated parts */}
              <SectionCard title="Donated Parts" count={donatedParts.length} icon={partIcon}>
                <DonatedTable
                  rows={donatedParts.map((p) => ({
                    id: p.id,
                    label: p.type,
                    year: null,
                    detail: p.description,
                    value: p.value,
                    acquired: p.acquisitionDate,
                  }))}
                  basePath="/parts"
                  emptyMessage="No donated parts."
                  selectMode={selectMode}
                  selected={selected}
                  onToggle={toggle}
                  onToggleAll={toggleAll}
                />
              </SectionCard>

              {/* Donated tools */}
              <SectionCard title="Donated Tools" count={donatedTools.length} icon={toolIcon}>
                <DonatedTable
                  rows={donatedTools.map((t) => ({
                    id: t.id,
                    label: t.description,
                    year: null,
                    detail: "",
                    value: t.value,
                    acquired: t.acquisitionDate,
                  }))}
                  basePath="/tools"
                  emptyMessage="No donated tools."
                  selectMode={selectMode}
                  selected={selected}
                  onToggle={toggle}
                  onToggleAll={toggleAll}
                />
              </SectionCard>
            </div>
          )}
        </div>

        {/* Received group */}
        <div className="space-y-3">
          <button
            onClick={() => setReceivedOpen((o) => !o)}
            className="w-full flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
          >
            <Chevron expanded={receivedOpen} />
            Received
            <span className="ml-1 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {receivedDevices.length}
            </span>
          </button>

          {receivedOpen && (
            <div className="space-y-3">
              {/* Received devices */}
              <SectionCard
                title="Received Devices"
                count={receivedDevices.length}
                icon={receiveIcon}
              >
                <AssetTable
                  rows={receivedDevices.map((d) => ({
                    id: d.id,
                    label: `${d.manufacturer} ${d.model}`,
                    detail: `${d.type} · ${d.year}`,
                    status: d.status,
                    chapter: d.chapter,
                    acquired: d.acquisitionDate ?? null,
                  }))}
                  basePath="/devices"
                  emptyMessage="No received devices."
                />
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
