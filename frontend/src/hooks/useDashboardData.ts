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

/**
 * Loads and derives every metric shown on the Dashboard for the given chapter
 * scope and time range. Chapter-filtered stats re-fetch whenever the scope or
 * month range changes; the network-wide chapter-activity figure is loaded once.
 */
export function useDashboardData(selectedChapterIds: number[], chartMonths: number) {
  // Pipeline counts
  const [notStartedCount, setNotStartedCount] = useState<number | null>(null);
  const [inProgressCount, setInProgressCount] = useState<number | null>(null);
  const [readyToDonateCount, setReadyToDonateCount] = useState<number | null>(null);
  const [donatedCount, setDonatedCount] = useState<number | null>(null);

  // Device type counts
  const [desktopCount, setDesktopCount] = useState<number | null>(null);
  const [laptopCount, setLaptopCount] = useState<number | null>(null);
  const [tabletCount, setTabletCount] = useState<number | null>(null);
  const [totalCount, setTotalCount] = useState<number | null>(null);

  // Other stats
  const [avgTime, setAvgTime] = useState<AvgTimeInInventoryResponse | null>(null);
  const [completionRate, setCompletionRate] = useState<CompletionRateResponse | null>(null);
  const [chapterActivity, setChapterActivity] = useState<ChapterActivityStatsResponse | null>(null);
  const [receivedData, setReceivedData] = useState<MonthlyCountPoint[]>([]);
  const [donatedActivityData, setDonatedActivityData] = useState<MonthlyCountPoint[]>([]);
  const [valueData, setValueData] = useState<MonthlyValuePoint[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);

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
  }, [selectedChapterIds.join(","), chartMonths]);

  // Derived display values
  const completionPct =
    completionRate && completionRate.total > 0
      ? Math.round((completionRate.donated / completionRate.total) * 100)
      : 0;
  const avgDays = avgTime?.avgDays != null ? Math.round(avgTime.avgDays) : null;
  const sampleSize = avgTime?.sampleSize ?? 0;

  return {
    notStartedCount,
    inProgressCount,
    readyToDonateCount,
    donatedCount,
    desktopCount,
    laptopCount,
    tabletCount,
    totalCount,
    completionRate,
    chapterActivity,
    receivedData,
    donatedActivityData,
    valueData,
    chartsLoading,
    completionPct,
    avgDays,
    sampleSize,
  };
}

/** All Dashboard metrics derived by {@link useDashboardData}. */
export type DashboardData = ReturnType<typeof useDashboardData>;
