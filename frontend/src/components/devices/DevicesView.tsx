import type { RefObject } from "react";
import type { AnyDevice, DeviceStatus } from "../../types/inventory";
import PageHeading from "../PageHeading";
import { DeviceListContainer } from "../../containers/DeviceListContainer";
import type { SortKey, SortDir } from "../DeviceList";
import AddAssetButtonContainer from "../../containers/AddAssetButtonContainer";
import FilterSelect from "../FilterSelect";
import ChapterFilterContainer from "../../containers/ChapterFilterContainer";
import { DEVICE_TYPES, STATUS_OPTIONS, type DeviceTypeFilter } from "./deviceFilters";

export interface DevicesViewProps {
  search: string;
  onSearchChange: (value: string) => void;
  typeFilter: DeviceTypeFilter;
  onTypeFilterChange: (value: DeviceTypeFilter) => void;
  statusFilter: DeviceStatus | "All";
  onStatusFilterChange: (value: DeviceStatus | "All") => void;
  chapterFilter: number | "All";
  onChapterFilterChange: (value: number | "All") => void;
  showDonated: boolean;
  onShowDonatedChange: (value: boolean) => void;
  showScrapped: boolean;
  onShowScrappedChange: (value: boolean) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey, dir: SortDir) => void;
  devices: AnyDevice[];
  loading: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
  deviceSubtitle: string;
  hasFilters: boolean;
  onClearFilters: () => void;
}

/**
 * DevicesView — presentational device browser: heading, chapter filter, the
 * search / status / type / include-donated-scrapped filter bar, and the device
 * table (DeviceListContainer) plus the infinite-scroll sentinel.
 */
export default function DevicesView({
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  chapterFilter,
  onChapterFilterChange,
  showDonated,
  onShowDonatedChange,
  showScrapped,
  onShowScrappedChange,
  sortKey,
  sortDir,
  onSort,
  devices,
  loading,
  sentinelRef,
  deviceSubtitle,
  hasFilters,
  onClearFilters,
}: DevicesViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeading title="Devices" subtitle={deviceSubtitle} />
        <div className="flex justify-end">
          <AddAssetButtonContainer className="w-full sm:w-auto" />
        </div>
      </div>

      {/* Chapter filter */}
      <ChapterFilterContainer selected={chapterFilter} onChange={onChapterFilterChange} />

      {/* Filter bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search — matches ID, manufacturer, model, CPU, chapter */}
          <div className="relative w-full sm:w-auto">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              width="14"
              height="14"
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
              placeholder="ID, manufacturer, model, CPU…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue w-full sm:w-72 transition-all"
            />
          </div>

          <FilterSelect
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as DeviceStatus | "All")}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Statuses" : s}
              </option>
            ))}
          </FilterSelect>

          <label
            className={`flex w-full sm:w-auto items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer select-none transition-all ${
              showDonated
                ? "bg-heart-blue/10 border-heart-blue text-heart-blue font-medium"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <input
              type="checkbox"
              checked={showDonated}
              onChange={(e) => onShowDonatedChange(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                showDonated ? "bg-heart-blue border-heart-blue" : "border-slate-300"
              }`}
            >
              {showDonated && (
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
            Include Donated
          </label>

          <label
            className={`flex w-full sm:w-auto items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer select-none transition-all ${
              showScrapped
                ? "bg-heart-blue/10 border-heart-blue text-heart-blue font-medium"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <input
              type="checkbox"
              checked={showScrapped}
              onChange={(e) => onShowScrappedChange(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                showScrapped ? "bg-heart-blue border-heart-blue" : "border-slate-300"
              }`}
            >
              {showScrapped && (
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
            Include Scrapped
          </label>

          {hasFilters && (
            <button
              onClick={onClearFilters}
              className="text-xs font-medium text-brand-red hover:text-brand-red-dark underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Type pills */}
        <div className="flex gap-1.5">
          {DEVICE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => onTypeFilterChange(t)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                typeFilter === t
                  ? "bg-brand-red text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              }`}
            >
              {t === "All" ? "All Types" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Device table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <DeviceListContainer
          devices={devices}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={onSort}
          emptyMessage={
            loading ? (
              "Loading devices…"
            ) : (
              <>
                No devices match the current filters.{" "}
                {hasFilters && (
                  <button onClick={onClearFilters} className="text-brand-red hover:underline">
                    Clear filters
                  </button>
                )}
              </>
            )
          }
        />
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" aria-hidden="true" />
      {loading && devices.length > 0 && (
        <p className="text-center text-sm text-slate-400 py-4">Loading more devices…</p>
      )}
    </div>
  );
}
