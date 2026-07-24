import { useState, useMemo, useEffect } from "react";
import { getPartTypeCounts } from "../services/partService";
import type { PartTypeCountResponse } from "../types/inventory";
import { useLookups } from "../hooks/useLookups";
import PartsView from "../components/parts/PartsView";

export default function PartsContainer() {
  const [chapterFilter, setChapterFilter] = useState<number | "All">("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState<"All" | "Donated" | "Purchased">("All");
  const [showInDevice, setShowInDevice] = useState(false);

  const filters = useMemo(
    () => ({
      chapter: chapterFilter === "All" ? undefined : chapterFilter,
      type: typeFilter === "All" ? undefined : typeFilter,
      source:
        sourceFilter === "Donated"
          ? ("donated" as const)
          : sourceFilter === "Purchased"
            ? ("purchased" as const)
            : undefined,
      includeInDevice: showInDevice,
    }),
    [chapterFilter, typeFilter, sourceFilter, showInDevice]
  );

  // Accurate per-type totals. These drive the collapsed group headers, so the page can render
  // without fetching any individual part rows up front — parts are loaded lazily on expand.
  const [typeCounts, setTypeCounts] = useState<PartTypeCountResponse[]>([]);
  const [countsLoading, setCountsLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCountsLoading(true);
    getPartTypeCounts(filters)
      .then((c) => {
        if (!cancelled) setTypeCounts(c);
      })
      .finally(() => {
        if (!cancelled) setCountsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filters]);

  const totalTypes = typeCounts.length;
  const totalParts = useMemo(() => typeCounts.reduce((sum, c) => sum + c.count, 0), [typeCounts]);
  const sortedTypes = useMemo(
    () => [...typeCounts].sort((a, b) => a.type.localeCompare(b.type)),
    [typeCounts]
  );

  const [expandedTypes, setExpandedTypes] = useState<Set<string>>(new Set());
  const { partTypes } = useLookups();

  function toggleGroup(type: string) {
    setExpandedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  const hasFilters =
    chapterFilter !== "All" || typeFilter !== "All" || sourceFilter !== "All" || showInDevice;

  function clearFilters() {
    setChapterFilter("All");
    setTypeFilter("All");
    setSourceFilter("All");
    setShowInDevice(false);
  }

  return (
    <PartsView
      partTypes={partTypes}
      filters={filters}
      sortedTypes={sortedTypes}
      countsLoading={countsLoading}
      totalTypes={totalTypes}
      totalParts={totalParts}
      chapterFilter={chapterFilter}
      typeFilter={typeFilter}
      sourceFilter={sourceFilter}
      showInDevice={showInDevice}
      expandedTypes={expandedTypes}
      hasFilters={hasFilters}
      onChapterChange={setChapterFilter}
      onTypeChange={setTypeFilter}
      onSourceChange={setSourceFilter}
      onShowInDeviceChange={setShowInDevice}
      onToggleGroup={toggleGroup}
      onClearFilters={clearFilters}
    />
  );
}
