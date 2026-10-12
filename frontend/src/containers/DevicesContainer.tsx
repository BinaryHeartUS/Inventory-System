import { useState, useEffect, useMemo, useCallback } from "react";
import type { AnyDevice, DeviceStatus, ChapterInventorySummary } from "../types/inventory";
import { getDevices, getChapterInventorySummary } from "../services/deviceService";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import type { SortKey, SortDir } from "../components/devices/DeviceList";
import DevicesView from "../components/devices/DevicesView";
import { useLookups } from "../hooks/useLookups";
import {
  getOperatingSystemFilterParams,
  hasDefaultOperatingSystems,
  UNSPECIFIED_OPERATING_SYSTEM,
} from "../components/devices/operatingSystemFilters";
import {
  DEVICE_TYPES,
  DEFAULT_DEVICE_STATUSES,
  type DeviceType,
} from "../components/devices/deviceFilters";
import {
  clearDeviceFilters,
  createDeviceFilters,
  loadDeviceFilters,
  saveDeviceFilters,
  type DeviceFilters,
} from "../components/devices/deviceFilterStorage";
import { parseModelYearRange } from "../components/devices/modelYearRange";

function hasDefaultStatuses(statuses: DeviceStatus[]): boolean {
  return (
    statuses.length === DEFAULT_DEVICE_STATUSES.length &&
    DEFAULT_DEVICE_STATUSES.every((status) => statuses.includes(status))
  );
}

function hasDefaultTypes(types: DeviceType[]): boolean {
  return types.length === DEVICE_TYPES.length && DEVICE_TYPES.every((type) => types.includes(type));
}

export default function DevicesContainer() {
  const lookups = useLookups();
  const [filters, setFilters] = useState(loadDeviceFilters);
  const {
    search,
    types: selectedTypes,
    statuses: selectedStatuses,
    chapter: chapterFilter,
    stuckOnly: showStuck,
    yearFrom,
    yearTo,
    sort: sortKey,
    dir: sortDir,
  } = filters;
  const selectedOperatingSystems = useMemo(
    () => filters.operatingSystems ?? [...lookups.operatingSystems, UNSPECIFIED_OPERATING_SYSTEM],
    [filters.operatingSystems, lookups.operatingSystems]
  );
  const operatingSystemParams = useMemo(
    () => getOperatingSystemFilterParams(selectedOperatingSystems, lookups.operatingSystems),
    [selectedOperatingSystems, lookups.operatingSystems]
  );
  const hasOperatingSystemFilter = filters.operatingSystems !== null;
  const [yearFromInput, setYearFromInput] = useState(yearFrom?.toString() ?? "");
  const [yearToInput, setYearToInput] = useState(yearTo?.toString() ?? "");
  const [yearError, setYearError] = useState<string | null>(null);
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

  const updateFilters = useCallback((updates: Partial<DeviceFilters>) => {
    setFilters((current) => {
      const next = { ...current, ...updates };
      saveDeviceFilters(next);
      return next;
    });
  }, []);

  const fetchPage = useCallback(
    (pageKey: number, pageSize: number) =>
      getDevices({
        pageKey,
        pageSize,
        search: debouncedSearch || undefined,
        types: selectedTypes.join(","),
        statuses: selectedStatuses.join(","),
        operatingSystems: operatingSystemParams.operatingSystems,
        includeUnspecifiedOperatingSystem: operatingSystemParams.includeUnspecifiedOperatingSystem,
        chapter: chapterFilter === "All" ? undefined : chapterFilter,
        stuckOnly: showStuck,
        yearFrom: yearFrom ?? undefined,
        yearTo: yearTo ?? undefined,
        sort: sortKey,
        dir: sortDir,
      }),
    [
      debouncedSearch,
      selectedTypes,
      selectedStatuses,
      operatingSystemParams,
      chapterFilter,
      showStuck,
      yearFrom,
      yearTo,
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
    selectedTypes,
    selectedStatuses,
    operatingSystemParams,
    chapterFilter,
    showStuck,
    yearFrom,
    yearTo,
    sortKey,
    sortDir,
  ]);

  const hasFilters =
    search !== "" ||
    !hasDefaultTypes(selectedTypes) ||
    !hasDefaultStatuses(selectedStatuses) ||
    hasOperatingSystemFilter ||
    chapterFilter !== "All" ||
    showStuck ||
    yearFrom !== null ||
    yearTo !== null;

  const exactTotal = useMemo(() => {
    if (!summaryLoaded) return null;
    if (
      showStuck ||
      yearFrom !== null ||
      yearTo !== null ||
      hasOperatingSystemFilter ||
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
    hasOperatingSystemFilter,
    chapterFilter,
    showStuck,
    yearFrom,
    yearTo,
  ]);

  const deviceSubtitle =
    exactTotal != null
      ? `${exactTotal} device${exactTotal !== 1 ? "s" : ""}`
      : hasFilters
        ? `${devices.length}${hasMore ? "+" : ""} matching device${devices.length !== 1 ? "s" : ""}`
        : `${devices.length} device${devices.length !== 1 ? "s" : ""}`;

  function clearFilters() {
    clearDeviceFilters();
    setFilters(createDeviceFilters());
    setYearFromInput("");
    setYearToInput("");
    setYearError(null);
  }

  function handleSort(key: SortKey, dir: SortDir) {
    updateFilters({ sort: key, dir });
  }

  function handleShowStuckChange(value: boolean) {
    updateFilters({
      stuckOnly: value,
    });
  }

  function handleSelectedStatusesChange(statuses: DeviceStatus[]) {
    updateFilters({ statuses });
  }

  function handleSelectedTypesChange(types: DeviceType[]) {
    updateFilters({ types });
  }

  function handleSelectedOperatingSystemsChange(operatingSystems: string[]) {
    updateFilters({
      operatingSystems: hasDefaultOperatingSystems(operatingSystems, lookups.operatingSystems)
        ? null
        : operatingSystems,
    });
  }

  function handleYearRangeChange(from: string, to: string) {
    setYearFromInput(from);
    setYearToInput(to);
    const result = parseModelYearRange(from, to);
    setYearError(result.error);
    if (result.range) updateFilters(result.range);
  }

  return (
    <DevicesView
      search={search}
      onSearchChange={(value) => updateFilters({ search: value })}
      selectedTypes={selectedTypes}
      onSelectedTypesChange={handleSelectedTypesChange}
      selectedStatuses={selectedStatuses}
      onSelectedStatusesChange={handleSelectedStatusesChange}
      operatingSystemOptions={lookups.operatingSystems}
      selectedOperatingSystems={selectedOperatingSystems}
      onSelectedOperatingSystemsChange={handleSelectedOperatingSystemsChange}
      chapterFilter={chapterFilter}
      onChapterFilterChange={(value) => updateFilters({ chapter: value })}
      showStuck={showStuck}
      onShowStuckChange={handleShowStuckChange}
      yearFrom={yearFromInput}
      yearTo={yearToInput}
      yearError={yearError}
      onYearRangeChange={handleYearRangeChange}
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
