import type { PartTypeCountResponse } from "../../types/inventory";
import type { PartTypeCountParams } from "../../services/partService";
import PageHeading from "../PageHeading";
import AddAssetButtonContainer from "../../containers/AddAssetButtonContainer";
import FilterSelect from "../FilterSelect";
import ChapterFilterContainer from "../../containers/ChapterFilterContainer";
import { Chevron } from "../Chevron";
import { PartTypeRowsContainer } from "../../containers/PartTypeRowsContainer";

export interface PartsViewProps {
  partTypes: string[];
  filters: PartTypeCountParams;
  sortedTypes: PartTypeCountResponse[];
  countsLoading: boolean;
  totalTypes: number;
  totalParts: number;
  chapterFilter: number | "All";
  typeFilter: string;
  sourceFilter: "All" | "Donated" | "Purchased";
  showInDevice: boolean;
  expandedTypes: Set<string>;
  hasFilters: boolean;
  onChapterChange: (value: number | "All") => void;
  onTypeChange: (value: string) => void;
  onSourceChange: (value: "All" | "Donated" | "Purchased") => void;
  onShowInDeviceChange: (value: boolean) => void;
  onToggleGroup: (type: string) => void;
  onClearFilters: () => void;
}

export default function PartsView({
  partTypes,
  filters,
  sortedTypes,
  countsLoading,
  totalTypes,
  totalParts,
  chapterFilter,
  typeFilter,
  sourceFilter,
  showInDevice,
  expandedTypes,
  hasFilters,
  onChapterChange,
  onTypeChange,
  onSourceChange,
  onShowInDeviceChange,
  onToggleGroup,
  onClearFilters,
}: PartsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeading
          title="Parts"
          subtitle={`${totalTypes} type${totalTypes !== 1 ? "s" : ""}, ${totalParts} part${totalParts !== 1 ? "s" : ""}`}
        />
        <div className="flex justify-end">
          <AddAssetButtonContainer className="w-full sm:w-auto" />
        </div>
      </div>

      {/* Chapter filter */}
      <ChapterFilterContainer selected={chapterFilter} onChange={onChapterChange} />

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <FilterSelect value={typeFilter} onChange={(e) => onTypeChange(e.target.value)}>
            <option value="All">All Types</option>
            {partTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </FilterSelect>
          <FilterSelect
            value={sourceFilter}
            onChange={(e) => onSourceChange(e.target.value as "All" | "Donated" | "Purchased")}
          >
            <option value="All">All Sources</option>
            <option value="Donated">Donated</option>
            <option value="Purchased">Purchased</option>
          </FilterSelect>

          <label
            className={`flex w-full sm:w-auto items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer select-none transition-all ${
              showInDevice
                ? "bg-heart-blue/10 border-heart-blue text-heart-blue font-medium"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <input
              type="checkbox"
              checked={showInDevice}
              onChange={(e) => onShowInDeviceChange(e.target.checked)}
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
              onClick={onClearFilters}
              className="text-xs font-medium text-brand-red hover:text-brand-red-dark underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Grouped by type */}
      {sortedTypes.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl px-5 py-12 text-center text-sm text-slate-400">
          {countsLoading ? (
            "Loading parts…"
          ) : (
            <>
              No parts match the current filters.{" "}
              {hasFilters && (
                <button onClick={onClearFilters} className="text-brand-red hover:underline">
                  Clear filters
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedTypes.map(({ type, count }) => {
            const isExpanded = expandedTypes.has(type);
            return (
              <div
                key={type}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => onToggleGroup(type)}
                  className="w-full flex items-center gap-2.5 px-5 py-3 bg-slate-50 hover:bg-slate-100 transition-colors select-none cursor-pointer text-slate-700"
                >
                  <Chevron expanded={isExpanded} />
                  <span className="font-semibold">{type}</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                    {count} {count === 1 ? "part" : "parts"}
                  </span>
                </button>
                {isExpanded && (
                  <div className="overflow-x-auto border-t border-slate-100">
                    <table className="w-full text-sm responsive-cards">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          {[
                            "ID",
                            "Description",
                            "Chapter",
                            "Source",
                            "Contained In",
                            "Acquired",
                          ].map((h) => (
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
                        <PartTypeRowsContainer type={type} filters={filters} />
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
