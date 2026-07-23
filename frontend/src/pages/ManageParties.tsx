import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageHeading from "../components/PageHeading";
import { getParties } from "../services/partyService";
import type { PartySummary } from "../types/inventory";
import { canManageAccounts } from "../utils/roles";
import { PersonPanelContainer } from "../containers/PersonPanelContainer";
import { OrgPanelContainer } from "../containers/OrgPanelContainer";

// ─── Reusable party table section ─────────────────────────────────────────────
type SectionType = "individuals" | "organizations";

function PartySection({
  kind,
  refreshKey,
  onRefresh,
}: {
  kind: SectionType;
  refreshKey: number;
  onRefresh: () => void;
}) {
  const isPerson = kind === "individuals";
  const [items, setItems] = useState<PartySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | "new" | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) {
        setLoading(true);
        setListError(null);
      }
    });
    getParties({ type: isPerson ? "person" : "organization" })
      .then((all) => {
        if (!cancelled) {
          setItems(all);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setListError(e instanceof Error ? e.message : "Failed to load");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isPerson, refreshKey]);

  const filtered = items.filter(
    (p) => !search.trim() || p.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleSaved() {
    setExpandedId(null);
    onRefresh();
  }

  return (
    <div>
      {/* Section header */}
      <div className="flex flex-col gap-3 mb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          {isPerson ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-heart-blue"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-heart-blue"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="12" y1="12" x2="12" y2="16" />
              <line x1="10" y1="14" x2="14" y2="14" />
            </svg>
          )}
          <h2 className="text-sm font-semibold text-slate-700">
            {isPerson ? "Individuals" : "Organizations"}
          </h2>
          {!loading && !listError && (
            <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          )}
        </div>
        <div className="hidden sm:block sm:flex-1" />
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            width="13"
            height="13"
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
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full text-sm border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all bg-white"
          />
        </div>
        {/* Add button */}
        <button
          onClick={() => setExpandedId("new")}
          className="flex items-center justify-center gap-1.5 text-sm font-medium text-white bg-heart-blue hover:bg-heart-blue/90 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap w-full sm:w-auto"
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
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {isPerson ? "Add Individual" : "Add Organization"}
        </button>
      </div>

      {/* "New" panel */}
      {expandedId === "new" && (
        <div className="mb-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isPerson ? (
            <PersonPanelContainer
              partyId="new"
              onClose={() => setExpandedId(null)}
              onSaved={handleSaved}
            />
          ) : (
            <OrgPanelContainer
              partyId="new"
              onClose={() => setExpandedId(null)}
              onSaved={handleSaved}
            />
          )}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
            Loading…
          </div>
        ) : listError ? (
          <div className="flex items-center justify-center py-12 text-red-500 text-sm">
            {listError}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">
            {items.length === 0
              ? `No ${isPerson ? "individuals" : "organizations"} yet.`
              : "No matches."}
          </div>
        ) : (
          <table className="responsive-cards w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="text-left px-6 py-3">Name</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <>
                  <tr
                    key={p.id}
                    className={`transition-colors ${expandedId === p.id ? "bg-slate-50" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-6 py-3 font-medium text-slate-800" data-label="Name">
                      {p.name}
                    </td>
                    <td className="px-4 py-3 text-right" data-label="">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          to={`/admin/parties/${p.id}`}
                          className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                          className="text-xs font-medium text-heart-blue hover:underline"
                        >
                          {expandedId === p.id ? "Close" : "Edit"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === p.id && (
                    <tr key={`${p.id}-panel`} className="rc-raw">
                      <td colSpan={2} className="p-0 rc-raw">
                        {isPerson ? (
                          <PersonPanelContainer
                            partyId={p.id}
                            onClose={() => setExpandedId(null)}
                            onSaved={handleSaved}
                          />
                        ) : (
                          <OrgPanelContainer
                            partyId={p.id}
                            onClose={() => setExpandedId(null)}
                            onSaved={handleSaved}
                          />
                        )}
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
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ManageParties() {
  const { auth } = useAuth();
  const isAdmin = canManageAccounts(auth?.role);

  // Separate refresh keys so refreshing one section doesn't reload the other
  const [individualsKey, setIndividualsKey] = useState(0);
  const [orgsKey, setOrgsKey] = useState(0);

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="space-y-10">
      <PageHeading
        title="Manage Parties"
        subtitle="Create and edit individuals and organizations that serve as donors or recipients."
      />
      <PartySection
        kind="individuals"
        refreshKey={individualsKey}
        onRefresh={() => setIndividualsKey((k) => k + 1)}
      />
      <PartySection
        kind="organizations"
        refreshKey={orgsKey}
        onRefresh={() => setOrgsKey((k) => k + 1)}
      />
    </div>
  );
}
