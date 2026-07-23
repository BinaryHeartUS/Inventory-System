import type { RefObject } from "react";
import type { Tool } from "../../types/inventory";
import PageHeading from "../PageHeading";
import { ToolRowContainer } from "../../containers/ToolRowContainer";
import AddAssetButtonContainer from "../../containers/AddAssetButtonContainer";
import ChapterFilterContainer from "../../containers/ChapterFilterContainer";

export interface ToolsViewProps {
  tools: Tool[];
  loading: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
  summaryLoaded: boolean;
  toolTotal: number;
  chapterFilter: number | "All";
  onChapterChange: (value: number | "All") => void;
  hasFilters: boolean;
  onClearFilters: () => void;
}

/**
 * ToolsView — presentational tools list: heading, chapter filter, and the
 * paginated tools table.
 */
export default function ToolsView({
  tools,
  loading,
  sentinelRef,
  summaryLoaded,
  toolTotal,
  chapterFilter,
  onChapterChange,
  hasFilters,
  onClearFilters,
}: ToolsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeading
          title="Tools"
          subtitle={
            summaryLoaded
              ? `${toolTotal} tool${toolTotal !== 1 ? "s" : ""}`
              : `${tools.length} tool${tools.length !== 1 ? "s" : ""}`
          }
        />
        <div className="flex justify-end">
          <AddAssetButtonContainer className="w-full sm:w-auto" />
        </div>
      </div>

      {/* Chapter filter */}
      <ChapterFilterContainer selected={chapterFilter} onChange={onChapterChange} />

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm responsive-cards">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["ID", "Description", "Chapter", "Value", "Acquired"].map((h) => (
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
              {tools.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                    No tools match the current filters.{" "}
                    {hasFilters && (
                      <button onClick={onClearFilters} className="text-brand-red hover:underline">
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                tools.map((t) => <ToolRowContainer key={t.id} tool={t} />)
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" aria-hidden="true" />
      {loading && <p className="text-center text-sm text-slate-400 py-4">Loading more tools…</p>}
    </div>
  );
}
