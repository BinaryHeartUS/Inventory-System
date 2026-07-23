import type { RefObject } from "react";
import type { AnyDevice, ChapterInventorySummary, ChapterSummary } from "../../types/inventory";
import { renderDeviceRow, DEVICE_TABLE_HEADERS } from "../../utils/deviceUtils";
import PageHeading from "../PageHeading";

export interface DonationsViewProps {
  chapters: ChapterSummary[];
  summary: ChapterInventorySummary[];
  totalDonated: number;
  donated: AnyDevice[];
  loading: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
  chapterFilter: number | "All";
  onChapterChange: (value: number | "All") => void;
  onOpenDevice: (id: number) => void;
}

/**
 * DonationsView — presentational donations screen: per-chapter summary cards, a
 * chapter filter, and the paginated donated-device table.
 */
export default function DonationsView({
  chapters,
  summary,
  totalDonated,
  donated,
  loading,
  sentinelRef,
  chapterFilter,
  onChapterChange,
  onOpenDevice,
}: DonationsViewProps) {
  return (
    <div className="space-y-6">
      <PageHeading
        title="Donations"
        subtitle={`${totalDonated} device${totalDonated !== 1 ? "s" : ""} donated all time`}
        compact
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {chapters.map((ch) => {
          const count = summary.find((s) => s.chapterId === ch.id)?.donated ?? 0;
          return (
            <div key={ch.id} className="bg-white border border-slate-200 rounded-xl p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {ch.name}
              </p>
              <p className="text-3xl font-extrabold mt-2 text-slate-900">{count}</p>
              <p className="text-xs text-slate-400 mt-2">donated</p>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <select
          value={String(chapterFilter)}
          onChange={(e) =>
            onChapterChange(e.target.value === "All" ? "All" : Number(e.target.value))
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
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {DEVICE_TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {donated.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={DEVICE_TABLE_HEADERS.length}
                    className="px-5 py-12 text-center text-sm text-slate-400"
                  >
                    No donations recorded.
                  </td>
                </tr>
              ) : (
                donated.map((d) => renderDeviceRow(d, undefined, onOpenDevice))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" aria-hidden="true" />
      {loading && <p className="text-center text-sm text-slate-400 py-4">Loading more…</p>}
    </div>
  );
}
