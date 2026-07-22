import { useState, useCallback } from "react";
import { getTools } from "../services/toolService";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import PageHeading from "../components/PageHeading";
import { ToolRow } from "../components/ToolRow";
import AddAssetButton from "../components/AddAssetButton";
import ChapterFilter from "../components/ChapterFilter";

export default function Tools() {
  const [chapterFilter, setChapterFilter] = useState<number | "All">("All");

  const fetchPage = useCallback(
    (pageKey: number, pageSize: number) =>
      getTools({
        pageKey,
        pageSize,
        chapter: chapterFilter === "All" ? undefined : chapterFilter,
      }),
    [chapterFilter]
  );
  const {
    items: tools,
    loading,
    hasMore,
    sentinelRef,
  } = useInfiniteScroll<import("../types/inventory").Tool>(fetchPage, [chapterFilter]);

  const hasFilters = chapterFilter !== "All";

  function clearFilters() {
    setChapterFilter("All");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeading
          title="Tools"
          subtitle={
            hasFilters
              ? `${tools.length} matching tool${tools.length !== 1 ? "s" : ""}${hasMore ? "+" : ""}`
              : `${tools.length} tool${tools.length !== 1 ? "s" : ""}${hasMore ? " loaded so far…" : ""}`
          }
        />
        <div className="flex justify-end">
          <AddAssetButton className="w-full sm:w-auto" />
        </div>
      </div>

      {/* Chapter filter */}
      <ChapterFilter selected={chapterFilter} onChange={setChapterFilter} />

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
                      <button onClick={clearFilters} className="text-brand-red hover:underline">
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                tools.map((t) => <ToolRow key={t.id} tool={t} />)
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
