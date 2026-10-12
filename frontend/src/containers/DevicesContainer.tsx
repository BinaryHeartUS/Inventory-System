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
  DEVICE_SORT_KEYS,
  DEFAULT_DEVICE_STATUSES,
  DEVICE_STATUS_OPTIONS,
  type DeviceType,
} from "../components/devices/deviceFilters";

function getSelectedTypes(types: string | null): DeviceType[] {
  if (types === null) return [...DEVICE_TYPES];
  const requested = new Set(types.split(","));
  const selected = DEVICE_TYPES.filter((type) => requested.has(type));
  return selected.length > 0 ? selected : [...DEVICE_TYPES];
}

function getSelectedStatuses(statuses: string | null): DeviceStatus[] {
  if (statuses === null) return DEFAULT_DEVICE_STATUSES;
  const requested = new Set(statuses.split(","));
  const selected = DEVICE_STATUS_OPTIONS.filter((status) => requested.has(status));
  return selected.length > 0 ? selected : DEFAULT_DEVICE_STATUSES;
}

function hasDefaultStatuses(statuses: DeviceStatus[]): boolean {
  return (
    statuses.length === DEFAULT_DEVICE_STATUSES.length &&
    DEFAULT_DEVICE_STATUSES.every((status) => statuses.includes(status))
  );
}

function hasDefaultTypes(types: DeviceType[]): boolean {
  return types.length === DEVICE_TYPES.length && DEVICE_TYPES.every((type) => types.includes(type));
}

function getSortKey(value: string | null): SortKey {
  return DEVICE_SORT_KEYS.includes(value as SortKey) ? (value as SortKey) : "id";
}

function getSortDir(value: string | null): SortDir {
  return value === "desc" ? "desc" : "asc";
}

export default function DevicesContainer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const chapters = useVisibleChapters();
  const search = searchParams.get("search") ?? "";
  const typesParam = searchParams.get("types");
  const selectedTypes = useMemo(() => getSelectedTypes(typesParam), [typesParam]);
  const statusesParam = searchParams.get("statuses");
  const selectedStatuses = useMemo(() => getSelectedStatuses(statusesParam), [statusesParam]);
  const chapterParam = searchParams.get("chapter");
  const chapterId = Number(chapterParam);
  const chapterFilter: number | "All" = chapterParam
    ? Number.isInteger(chapterId) && chapterId > 0
      ? chapterId
      : (chapters.find((chapter) => chapter.name === chapterParam)?.id ?? "All")
    : "All";
  const showStuck = searchParams.get("stuckOnly") === "true";
  const sortKey = getSortKey(searchParams.get("sort"));
  const sortDir = getSortDir(searchParams.get("dir"));
  const [debouncedSearch, setDebouncedSearch] = useState("");
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
        types: selectedTypes.join(","),
        statuses: selectedStatuses.join(","),
        chapter: chapterFilter === "All" ? undefined : chapterFilter,
        stuckOnly: showStuck,
        sort: sortKey,
        dir: sortDir,
      }),
    [debouncedSearch, selectedTypes, selectedStatuses, chapterFilter, showStuck, sortKey, sortDir]
  );

  const {
    items: devices,
    loading,
    hasMore,
    sentinelRef,
  } = useInfiniteScroll<AnyDevice>(fetchPage, [
    debouncedSearch,
    selectedTypes,
    selectedStatuses,
    chapterFilter,
    showStuck,
    sortKey,
    sortDir,
  ]);

  const hasFilters =
    search !== "" ||
    !hasDefaultTypes(selectedTypes) ||
    !hasDefaultStatuses(selectedStatuses) ||
    chapterFilter !== "All" ||
    showStuck;

  const exactTotal = useMemo(() => {
    if (!summaryLoaded) return null;
    if (
      showStuck ||
      selectedStatuses.includes("Sold") ||
      debouncedSearch ||
      !hasDefaultTypes(selectedTypes)
    )
      return null;
    const rows =
      chapterFilter === "All" ? summary : summary.filter((s) => s.chapterId === chapterFilter);
    return rows.reduce(
      (sum, row) =>
        sum +
        (selectedStatuses.includes("Not Started") ? row.notStarted : 0) +
        (selectedStatuses.includes("In Progress") ? row.inProgress : 0) +
        (selectedStatuses.includes("Ready To Donate") ? row.readyToDonate : 0) +
        (selectedStatuses.includes("Donated") ? row.donated : 0) +
        (selectedStatuses.includes("Scrapped") ? row.scrapped : 0),
      0
    );
  }, [
    summaryLoaded,
    summary,
    debouncedSearch,
    selectedTypes,
    selectedStatuses,
    chapterFilter,
    showStuck,
  ]);

  const deviceSubtitle =
    exactTotal != null
      ? `${exactTotal} device${exactTotal !== 1 ? "s" : ""}`
      : hasFilters
        ? `${devices.length}${hasMore ? "+" : ""} matching device${devices.length !== 1 ? "s" : ""}`
        : `${devices.length} device${devices.length !== 1 ? "s" : ""}`;

  function clearFilters() {
    setSearchParams({}, { replace: true });
  }

  function handleSort(key: SortKey, dir: SortDir) {
    updateFilters({
      sort: key === "id" ? null : key,
      dir: dir === "asc" ? null : dir,
    });
  }

  function handleShowStuckChange(value: boolean) {
    updateFilters({
      stuckOnly: value,
    });
  }

  function handleSelectedStatusesChange(statuses: DeviceStatus[]) {
    updateFilters({
      statuses: hasDefaultStatuses(statuses) ? null : statuses.join(","),
    });
  }

  function handleSelectedTypesChange(types: DeviceType[]) {
    updateFilters({
      types: hasDefaultTypes(types) ? null : types.join(","),
    });
  }

  return (
    <DevicesView
      search={search}
      onSearchChange={(value) => updateFilters({ search: value })}
      selectedTypes={selectedTypes}
      onSelectedTypesChange={handleSelectedTypesChange}
      selectedStatuses={selectedStatuses}
      onSelectedStatusesChange={handleSelectedStatusesChange}
      chapterFilter={chapterFilter}
      onChapterFilterChange={(value) => updateFilters({ chapter: value })}
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
