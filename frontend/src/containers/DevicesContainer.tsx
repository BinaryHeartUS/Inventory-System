import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router";
import type { AnyDevice, DeviceStatus, ChapterInventorySummary } from "../types/inventory";
import { getDevices, getChapterInventorySummary } from "../services/deviceService";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { useVisibleChapters } from "../context/ChapterContext";
import type { SortKey, SortDir } from "../components/devices/DeviceList";
import DevicesView from "../components/devices/DevicesView";
import {
  DEVICE_TYPES,
  STATUS_OPTIONS,
  type DeviceTypeFilter,
} from "../components/devices/deviceFilters";

function getTypeFilter(value: string | null): DeviceTypeFilter {
  return DEVICE_TYPES.includes(value as DeviceTypeFilter) ? (value as DeviceTypeFilter) : "All";
}

function getStatusFilter(value: string | null): DeviceStatus | "All" {
  return STATUS_OPTIONS.includes(value as DeviceStatus | "All")
    ? (value as DeviceStatus | "All")
    : "All";
}

export default function DevicesContainer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const chapters = useVisibleChapters();
  const search = searchParams.get("search") ?? "";
  const typeFilter = getTypeFilter(searchParams.get("type"));
  const statusFilter = getStatusFilter(searchParams.get("status"));
  const chapterParam = searchParams.get("chapter");
  const chapterId = Number(chapterParam);
  const chapterFilter: number | "All" = chapterParam
    ? Number.isInteger(chapterId) && chapterId > 0
      ? chapterId
      : (chapters.find((chapter) => chapter.name === chapterParam)?.id ?? "All")
    : "All";
  const showDonated = searchParams.get("includeDonated") === "true";
  const showScrapped = searchParams.get("includeScrapped") === "true";
  const showStuck = searchParams.get("stuckOnly") === "true";
  const [debouncedSearch, setDebouncedSearch] = useState("");
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

  const updateFilters = useCallback(
    (updates: Record<string, string | number | boolean | null>) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === false || value === "" || value === "All") {
              next.delete(key);
            } else {
              next.set(key, String(value));
            }
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

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
        stuckOnly: showStuck,
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
      showStuck,
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
    showStuck,
    sortKey,
    sortDir,
  ]);

  const hasFilters =
    search !== "" ||
    typeFilter !== "All" ||
    statusFilter !== "All" ||
    chapterFilter !== "All" ||
    showDonated ||
    showScrapped ||
    showStuck;

  const exactTotal = useMemo(() => {
    if (!summaryLoaded) return null;
    if (showStuck || debouncedSearch || typeFilter !== "All" || statusFilter !== "All") return null;
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
    showStuck,
  ]);

  const deviceSubtitle =
    exactTotal != null
      ? `${exactTotal} device${exactTotal !== 1 ? "s" : ""}`
      : hasFilters
        ? `${devices.length} matching device${devices.length !== 1 ? "s" : ""}${hasMore ? "+" : ""}`
        : `${devices.length} device${devices.length !== 1 ? "s" : ""}`;

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  function handleSort(key: SortKey, dir: SortDir) {
    setSortKey(key);
    setSortDir(dir);
  }

  function handleShowStuckChange(value: boolean) {
    updateFilters({
      stuckOnly: value,
      status: value ? null : statusFilter,
      includeDonated: value ? null : showDonated,
      includeScrapped: value ? null : showScrapped,
    });
  }

  return (
    <DevicesView
      search={search}
      onSearchChange={(value) => updateFilters({ search: value })}
      typeFilter={typeFilter}
      onTypeFilterChange={(value) => updateFilters({ type: value })}
      statusFilter={statusFilter}
      onStatusFilterChange={(value) => updateFilters({ status: value })}
      chapterFilter={chapterFilter}
      onChapterFilterChange={(value) => updateFilters({ chapter: value })}
      showDonated={showDonated}
      onShowDonatedChange={(value) => updateFilters({ includeDonated: value })}
      showScrapped={showScrapped}
      onShowScrappedChange={(value) => updateFilters({ includeScrapped: value })}
      showStuck={showStuck}
      onShowStuckChange={handleShowStuckChange}
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
