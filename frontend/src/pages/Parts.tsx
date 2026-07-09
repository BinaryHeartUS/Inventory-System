import React, { useState, useMemo, useEffect } from "react";
import { getParts } from "../services/partService";
import { useVisibleChapters } from "../context/ChapterContext";
import PageHeading from "../components/PageHeading";
import { PartRow } from "../components/PartRow";
import AddAssetButton from "../components/AddAssetButton";

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`transition-transform duration-200 flex-shrink-0 ${expanded ? "rotate-90" : ""}`}
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Parts() {
  const [chapterFilter, setChapterFilter] = useState<number | "All">("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState<"All" | "Donated" | "Purchased">("All");
  const [showInDevice, setShowInDevice] = useState(false);

  const [allParts, setAllParts] = useState<import("../types/inventory").Part[]>([]);
  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const chapters = useVisibleChapters();

  useEffect(() => {
    getParts().then(setAllParts);
  }, []);

  function toggleGroup(type: string) {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  const partTypes = useMemo(
    () => Array.from(new Set(allParts.map((p) => p.type))).sort(),
    [allParts]
  );

  const filtered = useMemo(() => {
    return allParts.filter((p) => {
      if (chapterFilter !== "All" && p.chapterId !== chapterFilter) return false;
      if (typeFilter !== "All" && p.type !== typeFilter) return false;
      if (sourceFilter === "Donated" && p.wasPurchased) return false;
      if (sourceFilter === "Purchased" && !p.wasPurchased) return false;
      if (!showInDevice && p.containedIn != null) return false;
      return true;
    });
  }, [chapterFilter, typeFilter, sourceFilter, showInDevice, allParts]);

  const grouped = useMemo(() => {
    const map = new Map<string, import("../types/inventory").Part[]>();
    for (const part of filtered) {
      const arr = map.get(part.type) ?? [];
      arr.push(part);
      map.set(part.type, arr);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  const hasFilters =
    chapterFilter !== "All" || typeFilter !== "All" || sourceFilter !== "All" || showInDevice;

  function clearFilters() {
    setChapterFilter("All");
    setTypeFilter("All");
    setSourceFilter("All");
    setShowInDevice(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeading
          title="Parts"
          subtitle={
            filtered.length === allParts.length
              ? `${grouped.length} type${grouped.length !== 1 ? "s" : ""}, ${allParts.length} part${allParts.length !== 1 ? "s" : ""}`
              : `${filtered.length} of ${allParts.length} parts`
          }
        />
        <div className="flex justify-end">
          <AddAssetButton />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all cursor-pointer"
          >
            <option value="All">All Types</option>
            {partTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={String(chapterFilter)}
            onChange={(e) =>
              setChapterFilter(e.target.value === "All" ? "All" : Number(e.target.value))
            }
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all cursor-pointer"
          >
            <option value="All">All Chapters</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as typeof sourceFilter)}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all cursor-pointer"
          >
            <option value="All">All Sources</option>
            <option value="Donated">Donated</option>
            <option value="Purchased">Purchased</option>
          </select>

          <label
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer select-none transition-all ${
              showInDevice
                ? "bg-heart-blue/10 border-heart-blue text-heart-blue font-medium"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <input
              type="checkbox"
              checked={showInDevice}
              onChange={(e) => setShowInDevice(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                showInDevice ? "bg-heart-blue border-heart-blue" : "border-slate-300"
              }`}
            >
              {showInDevice && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 5l2.5 2.5 4.5-4.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            Include Parts in Devices
          </label>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-brand-red hover:text-brand-red-dark underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["ID", "Description", "Chapter", "Source", "Contained In", "Acquired"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grouped.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    No parts match the current filters.{" "}
                    {hasFilters && (
                      <button onClick={clearFilters} className="text-brand-red hover:underline">
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                grouped.map(([type, parts]) => {
                  const isExpanded = expandedTypes.has(type);
                  return (
                    <React.Fragment key={type}>
                      <tr
                        onClick={() => toggleGroup(type)}
                        className="cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors select-none"
                      >
                        <td colSpan={6} className="px-5 py-3">
                          <div className="flex items-center gap-2.5 text-slate-700">
                            <ChevronIcon expanded={isExpanded} />
                            <span className="font-semibold">{type}</span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                              {parts.length} {parts.length === 1 ? "part" : "parts"}
                            </span>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && parts.map((p) => <PartRow key={p.id} part={p} hideTypeCol />)}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
