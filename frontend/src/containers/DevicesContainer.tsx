import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { AnyDevice, DeviceStatus, ChapterInventorySummary } from "../types/inventory";
import { getDevices, getChapterInventorySummary } from "../services/deviceService";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useVisibleChapters } from "../context/ChapterContext";
import type { SortKey, SortDir } from "../components/devices/DeviceList";
import DevicesView from "../components/devices/DevicesView";
import { type DeviceTypeFilter } from "../components/devices/deviceFilters";

export default function DevicesContainer() {
  const [searchParams] = useSearchParams();
  const chapters = useVisibleChapters();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DeviceTypeFilter>("All");
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | "All">("All");
  const [chapterFilter, setChapterFilter] = useState<number | "All">("All");
  const [showDonated, setShowDonated] = useState(false);
  const [showScrapped, setShowScrapped] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [summary, setSummary] = useState<ChapterInventorySummary[]>([]);
  const [summaryLoaded, setSummaryLoaded] = useState(false);

  // Debounce the search box so typing doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    getChapterInventorySummary().then((s) => {
      if (!cancelled) {
        setSummary(s);
        setSummaryLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Resolve a ?chapter=<name> deep link to a chapter id. Chapters load asynchronously
  // (the list starts empty), so this can't be done in the state initializer — it must wait
  // until the chapters arrive. Applied at most once so it never clobbers a later user change.
  const chapterParamApplied = useRef(false);
  useEffect(() => {
    if (chapterParamApplied.current) return;
    const name = searchParams.get("chapter");
    if (!name) {
      chapterParamApplied.current = true;
      return;
    }
    if (chapters.length === 0) return; // wait for chapters to load
    const match = chapters.find((c) => c.name === name);
    chapterParamApplied.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (match) setChapterFilter(match.id);
  }, [chapters, searchParams]);

  const fetchPage = useCallback(
    (pageKey: number, pageSize: number) =>
      getDevices({
        pageKey,
        pageSize,
        search: debouncedSearch || undefined,
        type: typeFilter === "All" ? undefined : typeFilter,
        status: statusFilter === "All" ? undefined : statusFilter,
        chapter: chapterFilter === "All" ? undefined : chapterFilter,
        includeDonated: showDonated,
        includeScrapped: showScrapped,
        sort: sortKey,
        dir: sortDir,
      }),
    [
      debouncedSearch,
      typeFilter,
      statusFilter,
      chapterFilter,
      showDonated,
      showScrapped,
      sortKey,
      sortDir,
    ]
  );

  const {
    items: devices,
    loading,
    hasMore,
    sentinelRef,
  } = useInfiniteScroll<AnyDevice>(fetchPage, [
    debouncedSearch,
    typeFilter,
    statusFilter,
    chapterFilter,
    showDonated,
    showScrapped,
    sortKey,
    sortDir,
  ]);

  const hasFilters =
    search !== "" ||
    typeFilter !== "All" ||
    statusFilter !== "All" ||
    chapterFilter !== "All" ||
    showDonated ||
    showScrapped;

  const exactTotal = useMemo(() => {
    if (!summaryLoaded) return null;
    if (debouncedSearch || typeFilter !== "All" || statusFilter !== "All") return null;
    const rows =
      chapterFilter === "All" ? summary : summary.filter((s) => s.chapterId === chapterFilter);
    let total = rows.reduce((sum, r) => sum + r.notStarted + r.inProgress + r.readyToDonate, 0);
    if (showDonated) total += rows.reduce((sum, r) => sum + r.donated, 0);
    if (showScrapped) total += rows.reduce((sum, r) => sum + r.scrapped, 0);
    return total;
  }, [
    summaryLoaded,
    summary,
    debouncedSearch,
    typeFilter,
    statusFilter,
    chapterFilter,
    showDonated,
    showScrapped,
  ]);

  const deviceSubtitle =
    exactTotal != null
      ? `${exactTotal} device${exactTotal !== 1 ? "s" : ""}`
      : hasFilters
        ? `${devices.length} matching device${devices.length !== 1 ? "s" : ""}${hasMore ? "+" : ""}`
        : `${devices.length} device${devices.length !== 1 ? "s" : ""}`;

  function clearFilters() {
    setSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
    setChapterFilter("All");
    setShowDonated(false);
    setShowScrapped(false);
  }

  function handleSort(key: SortKey, dir: SortDir) {
    setSortKey(key);
    setSortDir(dir);
  }

  return (
    <DevicesView
      search={search}
      onSearchChange={setSearch}
      typeFilter={typeFilter}
      onTypeFilterChange={setTypeFilter}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      chapterFilter={chapterFilter}
      onChapterFilterChange={setChapterFilter}
      showDonated={showDonated}
      onShowDonatedChange={setShowDonated}
      showScrapped={showScrapped}
      onShowScrappedChange={setShowScrapped}
      sortKey={sortKey}
      sortDir={sortDir}
      onSort={handleSort}
      devices={devices}
      loading={loading}
      sentinelRef={sentinelRef}
      deviceSubtitle={deviceSubtitle}
      hasFilters={hasFilters}
      onClearFilters={clearFilters}
    />
  );
}
