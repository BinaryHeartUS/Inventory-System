import { useState, useEffect, useCallback } from "react";
import {
  getDashboardCounts,
  getAvgTimeInInventory,
  getCompletionRate,
  getChapterActivityStats,
  getDevicesReceived,
  getDevicesDonated,
  getDonatedDeviceValue,
} from "../services/deviceService";
import type {
  AvgTimeInInventoryResponse,
  CompletionRateResponse,
  ChapterActivityStatsResponse,
  MonthlyCountPoint,
  MonthlyValuePoint,
} from "../types/inventory";
import { useVisibleChapters } from "../context/ChapterContext";
import { useMediaQuery } from "../hooks/useMediaQuery";
import ActivityChart from "../components/ActivityChart";
import DeviceValueChart from "../components/DeviceValueChart";
import PageHeading from "../components/PageHeading";
import ChapterTabs from "../components/ChapterTabs";
import AddAssetButton from "../components/AddAssetButton";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const [selectedChapter, setSelectedChapter] = useState<string>("All");
  const visibleChapters = useVisibleChapters();
  const chapters = visibleChapters.map((c) => c.name);

  // Derive the chapter IDs for the currently selected chapter filter
  const selectedChapterIds: number[] =
    selectedChapter === "All"
      ? visibleChapters.map((c) => c.id)
      : visibleChapters.filter((c) => c.name === selectedChapter).map((c) => c.id);

  // ── Pipeline counts ────────────────────────────────────────────────────────
  const [notStartedCount, setNotStartedCount] = useState<number | null>(null);
  const [inProgressCount, setInProgressCount] = useState<number | null>(null);
  const [readyToDonateCount, setReadyToDonateCount] = useState<number | null>(null);
  const [donatedCount, setDonatedCount] = useState<number | null>(null);

  // ── Device type counts ─────────────────────────────────────────────────────
  const [desktopCount, setDesktopCount] = useState<number | null>(null);
  const [laptopCount, setLaptopCount] = useState<number | null>(null);
  const [tabletCount, setTabletCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // ── Other stats ────────────────────────────────────────────────────────────
  const [avgTime, setAvgTime] = useState<AvgTimeInInventoryResponse | null>(null);
  const [completionRate, setCompletionRate] = useState<CompletionRateResponse | null>(null);
  const [chapterActivity, setChapterActivity] = useState<ChapterActivityStatsResponse | null>(null);
  const [receivedData, setReceivedData] = useState<MonthlyCountPoint[]>([]);
  const [donatedActivityData, setDonatedActivityData] = useState<MonthlyCountPoint[]>([]);
  const [valueData, setValueData] = useState<MonthlyValuePoint[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  // On phones the time-series charts get cramped, so show a shorter range.
  const isMobile = useMediaQuery("(max-width: 639px)");
  const chartMonths = isMobile ? 6 : 12;

  const fetchChapterFiltered = useCallback(async (chapterIds: number[], months: number) => {
    setChartsLoading(true);
    const [counts, avg, cr, received, donated, val] = await Promise.all([
      getDashboardCounts(chapterIds),
      getAvgTimeInInventory(chapterIds),
      getCompletionRate(chapterIds),
      getDevicesReceived(chapterIds, months),
      getDevicesDonated(chapterIds, months),
      getDonatedDeviceValue(chapterIds, months),
    ]);
    setNotStartedCount(counts.notStarted);
    setInProgressCount(counts.inProgress);
    setReadyToDonateCount(counts.readyToDonate);
    setDonatedCount(counts.donated);
    setDesktopCount(counts.desktopActive);
    setLaptopCount(counts.laptopActive);
    setTabletCount(counts.tabletActive);
    setTotalCount(counts.totalActive);
    setAvgTime(avg);
    setCompletionRate(cr);
    setReceivedData(received);
    setDonatedActivityData(donated);
    setValueData(val);
    setChartsLoading(false);
  }, []);

  // Chapter activity is always network-wide (not filtered by selectedChapter)
  useEffect(() => {
    getChapterActivityStats().then(setChapterActivity);
  }, []);

  useEffect(() => {
    if (selectedChapterIds.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchChapterFiltered(selectedChapterIds, chartMonths);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChapter, visibleChapters.map((c) => c.id).join(","), chartMonths]);

  // ── Derived display values ─────────────────────────────────────────────────
  const completionPct =
    completionRate && completionRate.total > 0
      ? Math.round((completionRate.donated / completionRate.total) * 100)
      : 0;
  const avgDays =
    avgTime?.avgDays !== null
      ? avgTime?.avgDays != null
        ? Math.round(avgTime.avgDays)
        : null
      : null;
  const sampleSize = avgTime?.sampleSize ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeading title="Dashboard" subtitle="Inventory overview by chapter" />
        <div className="flex justify-end">
          <AddAssetButton />
        </div>
      </div>

      {/* Chapter tabs */}
      <ChapterTabs chapters={chapters} selected={selectedChapter} onChange={setSelectedChapter} />

      {/* Pipeline card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Pipeline
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Not Started",
              count: notStartedCount,
              bg: "bg-slate-100",
              text: "text-slate-700",
              dot: "bg-slate-400",
            },
            {
              label: "In Progress",
              count: inProgressCount,
              bg: "bg-amber-50",
              text: "text-amber-700",
              dot: "bg-amber-400",
            },
            {
              label: "Ready to Donate",
              count: readyToDonateCount,
              bg: "bg-green-50",
              text: "text-green-700",
              dot: "bg-green-500",
            },
            {
              label: "Donated",
              count: donatedCount,
              bg: "bg-sky-50",
              text: "text-sky-700",
              dot: "bg-sky-500",
            },
          ].map(({ label, count, bg, text, dot }) => (
            <div key={label} className={`rounded-lg p-4 ${bg}`}>
              <div className={`w-2 h-2 rounded-full ${dot} mb-3`} />
              <p className={`text-3xl font-extrabold leading-none ${text}`}>
                {count !== null ? count : <span className="text-xl opacity-40">—</span>}
              </p>
              <p className={`text-[11px] font-medium mt-2 ${text} opacity-75`}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Device types + Chapter breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
              <div key={label}>
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
              </div>
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
