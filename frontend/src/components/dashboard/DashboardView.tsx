import type { DashboardData } from "../../hooks/useDashboardData";
import ActivityChart from "./ActivityChart";
import DeviceValueChart from "./DeviceValueChart";
import PageHeading from "../PageHeading";
import ChapterFilterContainer from "../../containers/ChapterFilterContainer";
import AddAssetButtonContainer from "../../containers/AddAssetButtonContainer";
import type { DeviceStatus } from "../../types/inventory";

export interface DashboardViewProps {
  selectedChapter: number | "All";
  onChapterChange: (value: number | "All") => void;
  chartMonths: number;
  data: DashboardData;
  onStatusSelect: (status: DeviceStatus) => void;
  onTypeSelect: (type: "Desktop" | "Laptop" | "Tablet") => void;
  onStuckSelect: () => void;
}

export default function DashboardView({
  selectedChapter,
  onChapterChange,
  chartMonths,
  data,
  onStatusSelect,
  onTypeSelect,
  onStuckSelect,
}: DashboardViewProps) {
  const {
    notStartedCount,
    inProgressCount,
    readyToDonateCount,
    donatedCount,
    desktopCount,
    laptopCount,
    tabletCount,
    totalCount,
    stuckCount,
    completionRate,
    chapterActivity,
    receivedData,
    donatedActivityData,
    valueData,
    chartsLoading,
    completionPct,
    avgDays,
    sampleSize,
  } = data;
  const eligibleCount =
    inProgressCount !== null && readyToDonateCount !== null
      ? inProgressCount + readyToDonateCount
      : null;
  const stuckPct =
    stuckCount !== null && eligibleCount !== null && eligibleCount > 0
      ? Math.round((stuckCount / eligibleCount) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeading title="Dashboard" subtitle="Inventory overview by chapter" />
        <div className="flex justify-end">
          <AddAssetButtonContainer className="w-full sm:w-auto" />
        </div>
      </div>

      {/* Chapter tabs */}
      <ChapterFilterContainer selected={selectedChapter} onChange={onChapterChange} />

      {/* Pipeline card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Pipeline
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Not Started",
              status: "Not Started" as const,
              count: notStartedCount,
              bg: "bg-slate-100",
              text: "text-slate-700",
              dot: "bg-slate-400",
            },
            {
              label: "In Progress",
              status: "In Progress" as const,
              count: inProgressCount,
              bg: "bg-amber-50",
              text: "text-amber-700",
              dot: "bg-amber-400",
            },
            {
              label: "Ready to Donate",
              status: "Ready To Donate" as const,
              count: readyToDonateCount,
              bg: "bg-green-50",
              text: "text-green-700",
              dot: "bg-green-500",
            },
            {
              label: "Donated",
              status: "Donated" as const,
              count: donatedCount,
              bg: "bg-sky-50",
              text: "text-sky-700",
              dot: "bg-sky-500",
            },
          ].map(({ label, status, count, bg, text, dot }) => (
            <button
              type="button"
              key={label}
              onClick={() => onStatusSelect(status)}
              className={`rounded-lg p-4 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heart-blue ${bg}`}
            >
              <div className={`w-2 h-2 rounded-full ${dot} mb-3`} />
              <p className={`text-3xl font-extrabold leading-none ${text}`}>
                {count !== null ? count : <span className="text-xl opacity-40">—</span>}
              </p>
              <p className={`text-[11px] font-medium mt-2 ${text} opacity-75`}>{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Inventory health */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={onStuckSelect}
          className="bg-white border border-slate-200 rounded-xl p-5 text-left flex flex-col justify-between transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heart-blue"
        >
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Stuck Devices
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Number of in-progress and ready-to-donate devices with no recent activity
            </p>
          </div>
          <div className="my-5">
            <p className="text-3xl font-extrabold text-heart-blue leading-none">
              {stuckCount !== null ? stuckCount : "—"}
            </p>
            <p className="text-xs text-slate-500 mt-4">
              {stuckCount !== null && eligibleCount !== null
                ? `${stuckPct}% of in-progress and ready-to-donate devices`
                : "Calculating workflow health"}
            </p>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-heart-blue rounded-full transition-all"
              style={{ width: `${stuckPct}%` }}
            />
          </div>
        </button>

        {/* Device type breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
          <div className="flex items-baseline justify-between mb-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Device Types
            </p>
            <span className="text-lg font-extrabold text-heart-blue">
              {totalCount !== null ? totalCount : "—"} total
            </span>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            {[
              { label: "Desktops", count: desktopCount, color: "bg-blue-500" },
              { label: "Laptops", count: laptopCount, color: "bg-indigo-500" },
              { label: "Tablets", count: tabletCount, color: "bg-violet-500" },
            ].map(({ label, count, color }) => (
              <button
                type="button"
                key={label}
                onClick={() => onTypeSelect(label.slice(0, -1) as "Desktop" | "Laptop" | "Tablet")}
                className="block w-full rounded-md p-1 text-left transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-heart-blue"
              >
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-600 font-medium">{label}</span>
                  <span className="text-slate-700 font-semibold">
                    {count !== null ? count : "—"}{" "}
                    <span className="text-slate-400 font-normal">
                      {count !== null && totalCount
                        ? `${Math.round((count / totalCount) * 100)}%`
                        : "—"}
                    </span>
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} rounded-full transition-all`}
                    style={{
                      width: count !== null && totalCount ? `${(count / totalCount) * 100}%` : "0%",
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Avg time in inventory */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Avg Time in Inventory
            </p>
            <p className="text-[11px] text-slate-400 mt-1">acquisition → donated</p>
          </div>
          <div className="mt-4 flex-1 flex flex-col justify-center">
            {avgDays !== null ? (
              <>
                <p className="text-4xl font-extrabold text-heart-blue leading-none">{avgDays}</p>
                <p className="text-sm text-slate-400 mt-1">days</p>
              </>
            ) : (
              <p className="text-sm text-slate-300 italic">No data yet</p>
            )}
          </div>
          <p className="text-[11px] text-slate-300 mt-4">
            Based on {sampleSize} donated device{sampleSize !== 1 ? "s" : ""} with both dates
            recorded
          </p>
        </div>

        {/* Network health */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
          {/* Completion rate */}
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Completion Rate
          </p>
          <div className="flex-1 flex flex-col justify-center py-3">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-extrabold text-heart-blue leading-none">
                {completionPct}%
              </span>
              <span className="text-xs text-slate-400 mb-0.5">
                {completionRate
                  ? `${completionRate.donated} of ${completionRate.total} devices`
                  : "—"}
              </span>
            </div>
            <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-heart-blue rounded-full transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          <div className="border-t border-slate-100 mb-4" />

          {/* Chapter activity */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Chapters
            </p>
            <div className="space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Active chapters</span>
                <span className="font-semibold text-slate-800">
                  {chapterActivity
                    ? `${chapterActivity.activeChapters} of ${chapterActivity.totalChapters}`
                    : "—"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Chapters working on devices</span>
                <span className="font-semibold text-amber-600">
                  {chapterActivity?.chaptersWorkingOnDevices ?? "—"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Chapters with pickups ready</span>
                <span
                  className={`font-semibold ${(chapterActivity?.chaptersWithPickupsReady ?? 0) > 0 ? "text-green-600" : "text-slate-300"}`}
                >
                  {chapterActivity?.chaptersWithPickupsReady ?? "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity over time */}
      <ActivityChart
        receivedData={receivedData}
        donatedData={donatedActivityData}
        months={chartMonths}
        loading={chartsLoading}
      />

      {/* Value of donated devices */}
      <DeviceValueChart data={valueData} months={chartMonths} />
    </div>
  );
}
