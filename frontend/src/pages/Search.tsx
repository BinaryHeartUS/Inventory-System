import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { DeviceStatus } from "../types/inventory";
import { getDevices } from "../services/deviceService";
import { getParts } from "../services/partService";
import { getTools } from "../services/toolService";
import { fetchAllPages } from "../services/api";
import type { AnyDevice, Part, Tool } from "../types/inventory";
import StatusBadge from "../components/StatusBadge";
import PageHeading from "../components/PageHeading";
import { useChapters } from "../context/ChapterContext";

// Cap each category's results so a broad/short query can't pull an unbounded number of rows.
// The server-side search already filters; this bounds a match-everything query to a top-N.
const SEARCH_RESULT_CAP = 100;

export default function Search() {
  const [query, setQuery] = useState("");
  const [deviceResults, setDeviceResults] = useState<AnyDevice[]>([]);
  const [partResults, setPartResults] = useState<Part[]>([]);
  const [toolResults, setToolResults] = useState<Tool[]>([]);
  const [searching, setSearching] = useState(false);
  const { chapterName } = useChapters();

  const q = query.trim();

  // Server-side search across devices, parts and tools (debounced). Empty query clears results.
  useEffect(() => {
    let cancelled = false;
    // Reflect the pending search immediately so the UI shows "Searching…" while the
    // debounce timer and the request are in flight (instead of flashing "No results").
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setSearching(!!q);
    const timer = setTimeout(() => {
      if (!q) {
        setDeviceResults([]);
        setPartResults([]);
        setToolResults([]);
        return;
      }
      Promise.all([
        fetchAllPages(
          (pageKey, pageSize) =>
            getDevices({
              pageKey,
              pageSize,
              search: q,
              includeDonated: true,
              includeScrapped: true,
            }),
          SEARCH_RESULT_CAP,
          SEARCH_RESULT_CAP
        ),
        fetchAllPages(
          (pageKey, pageSize) => getParts({ pageKey, pageSize, search: q }),
          SEARCH_RESULT_CAP,
          SEARCH_RESULT_CAP
        ),
        fetchAllPages(
          (pageKey, pageSize) => getTools({ pageKey, pageSize, search: q }),
          SEARCH_RESULT_CAP,
          SEARCH_RESULT_CAP
        ),
      ]).then(([d, p, t]) => {
        if (cancelled) return;
        setDeviceResults(d);
        setPartResults(p);
        setToolResults(t);
        setSearching(false);
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [q]);

  const total = deviceResults.length + partResults.length + toolResults.length;

  return (
    <div className="space-y-6">
      <PageHeading title="Search" subtitle="Search across all devices, parts, and tools" />

      {/* Search input */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
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
        <input
          autoFocus
          type="text"
          placeholder="Search by ID, model, manufacturer, chapter, status…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-11 pr-10 py-3 text-sm border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue bg-white"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Empty state */}
      {!q && (
        <p className="text-slate-400 text-sm text-center py-16">
          Start typing to search across all inventory
        </p>
      )}
      {q && searching && <p className="text-slate-400 text-sm text-center py-16">Searching…</p>}
      {q && !searching && total === 0 && (
        <p className="text-slate-400 text-sm text-center py-16">
          No results for "<span className="text-slate-600">{query}</span>"
        </p>
      )}

      {/* Results summary */}
      {q && !searching && total > 0 && (
        <p className="text-xs text-slate-400">
          {total} result{total !== 1 ? "s" : ""} for "
          <span className="text-slate-600 font-medium">{query}</span>"
          {(deviceResults.length === SEARCH_RESULT_CAP ||
            partResults.length === SEARCH_RESULT_CAP ||
            toolResults.length === SEARCH_RESULT_CAP) && (
            <span className="text-slate-300">
              {" "}
              — showing the first {SEARCH_RESULT_CAP} of each type; refine your search to narrow
              results
            </span>
          )}
        </p>
      )}

      {/* Device results */}
      {deviceResults.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Devices <span className="text-slate-300 font-normal">— {deviceResults.length}</span>
          </p>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {deviceResults.map((d) => (
              <Link
                key={d.id}
                to={`/devices/${d.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <span className="font-mono text-xs text-slate-400 w-14 shrink-0">#{d.id}</span>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                    d.type === "Desktop"
                      ? "bg-blue-50 text-blue-600"
                      : d.type === "Laptop"
                        ? "bg-indigo-50 text-indigo-600"
                        : "bg-violet-50 text-violet-600"
                  }`}
                >
                  {d.type}
                </span>
                <span className="text-sm text-slate-800 font-medium flex-1 truncate">
                  {d.manufacturer} {d.model}
                </span>
                <span className="text-xs text-slate-400 hidden sm:block shrink-0">{d.chapter}</span>
                <StatusBadge status={d.status as DeviceStatus} />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Part results */}
      {partResults.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Parts <span className="text-slate-300 font-normal">— {partResults.length}</span>
          </p>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {partResults.map((p) => (
              <Link
                key={p.id}
                to={`/parts/${p.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <span className="font-mono text-xs text-slate-400 w-14 shrink-0">#{p.id}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 shrink-0">
                  {p.type}
                </span>
                <span className="text-sm text-slate-800 font-medium flex-1 truncate">
                  {p.description}
                </span>
                <span className="text-xs text-slate-400 hidden sm:block shrink-0">
                  {chapterName(p.chapterId)}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${p.wasPurchased ? "bg-slate-100 text-slate-500" : "bg-sky-50 text-sky-600"}`}
                >
                  {p.wasPurchased ? "Purchased" : "Donated"}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Tool results */}
      {toolResults.length > 0 && (
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Tools <span className="text-slate-300 font-normal">— {toolResults.length}</span>
          </p>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {toolResults.map((t) => (
              <Link
                key={t.id}
                to={`/tools/${t.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <span className="font-mono text-xs text-slate-400 w-14 shrink-0">#{t.id}</span>
                <span className="text-sm text-slate-800 font-medium flex-1 truncate">
                  {t.description}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
