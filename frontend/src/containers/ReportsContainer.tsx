import { useEffect, useMemo, useState } from "react";
import { getDevices, getChapterInventorySummary } from "../services/deviceService";
import { getParts } from "../services/partService";
import { getTools } from "../services/toolService";
import { fetchAllPages } from "../services/api";
import { useChapters, useVisibleChapters } from "../context/ChapterContext";
import { useToast } from "../context/ToastContext";
import type { ChapterInventorySummary } from "../types/inventory";
import { slugify } from "../utils/csv";
import * as reportExport from "../services/reportExport";
import ReportsView, { type ReportExportKey } from "../components/reports/ReportsView";

/**
 * ReportsContainer — owns the report scope (selected chapter), summary stats,
 * and the lazy CSV export loaders/handlers.
 */
export default function ReportsContainer() {
  const [summary, setSummary] = useState<ChapterInventorySummary[]>([]);
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState<number | "All">("All");
  const [busyExport, setBusyExport] = useState<string | null>(null);
  const visibleChapters = useVisibleChapters();
  const { chapterName } = useChapters();
  const { showToast } = useToast();
  const selectedChapterId = selectedChapter === "All" ? undefined : selectedChapter;
  const selectedChapterName =
    selectedChapter === "All"
      ? "All"
      : (visibleChapters.find((c) => c.id === selectedChapter)?.name ?? "All");

  // Summary stats and export-row counts come from a single lightweight aggregate
  // endpoint, so opening the page no longer downloads the whole inventory. The full
  // rows for each CSV are fetched lazily — only when that export is actually run.
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

  // Collapse the per-chapter summary rows to the selected scope (a single chapter,
  // or every visible chapter when "All" is selected).
  const stats = useMemo(() => {
    const rows =
      selectedChapterId == null
        ? summary
        : summary.filter((s) => s.chapterId === selectedChapterId);
    const acc = {
      totalDevices: 0,
      notStarted: 0,
      inProgress: 0,
      readyToDonate: 0,
      donated: 0,
      scrapped: 0,
      partsCount: 0,
      toolsCount: 0,
    };
    for (const r of rows) {
      acc.totalDevices += r.totalDevices;
      acc.notStarted += r.notStarted;
      acc.inProgress += r.inProgress;
      acc.readyToDonate += r.readyToDonate;
      acc.donated += r.donated;
      acc.scrapped += r.scrapped;
      acc.partsCount += r.partsCount;
      acc.toolsCount += r.toolsCount;
    }
    return acc;
  }, [summary, selectedChapterId]);

  const pipeline = stats.notStarted + stats.inProgress;
  const ready = stats.readyToDonate;
  const donated = stats.donated;
  const scrapped = stats.scrapped;
  const nonScrapped = stats.notStarted + stats.inProgress + stats.readyToDonate + stats.donated;
  const completion = nonScrapped > 0 ? Math.round((donated / nonScrapped) * 100) : 0;

  const pipelineCount = stats.notStarted + stats.inProgress + stats.readyToDonate;
  const valuationCount = stats.totalDevices + stats.partsCount + stats.toolsCount;

  const chapterSlug = slugify(selectedChapter === "All" ? "all-chapters" : selectedChapterName);

  // Lazy row loaders — each export pulls only the data it needs, at click time.
  const loadDevices = () =>
    fetchAllPages((pageKey, pageSize) =>
      getDevices({
        pageKey,
        pageSize,
        chapter: selectedChapterId,
        includeDonated: true,
        includeScrapped: true,
      })
    );
  const loadParts = () =>
    fetchAllPages((pageKey, pageSize) =>
      getParts({ pageKey, pageSize, chapter: selectedChapterId })
    );
  const loadTools = () =>
    fetchAllPages((pageKey, pageSize) =>
      getTools({ pageKey, pageSize, chapter: selectedChapterId })
    );

  // Runs an export, showing a per-card busy state and surfacing any failure.
  async function runExport(key: string, build: () => Promise<void>) {
    setBusyExport(key);
    try {
      await build();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Export failed", false);
    } finally {
      setBusyExport(null);
    }
  }

  async function exportInInventory() {
    reportExport.exportInInventoryDevices(await loadDevices(), chapterSlug);
  }

  async function exportParts() {
    reportExport.exportParts(await loadParts(), chapterSlug, chapterName);
  }

  async function exportTools() {
    reportExport.exportTools(await loadTools(), chapterSlug);
  }

  async function exportDonated() {
    reportExport.exportDonatedDevices(await loadDevices(), chapterSlug);
  }

  async function exportValuation() {
    const [devices, parts, tools] = await Promise.all([loadDevices(), loadParts(), loadTools()]);
    reportExport.exportValuation(devices, parts, tools, chapterSlug, chapterName);
  }

  function handleExport(key: ReportExportKey) {
    switch (key) {
      case "pipeline":
        return runExport("pipeline", exportInInventory);
      case "donated":
        return runExport("donated", exportDonated);
      case "parts":
        return runExport("parts", exportParts);
      case "tools":
        return runExport("tools", exportTools);
      case "valuation":
        return runExport("valuation", exportValuation);
    }
  }

  return (
    <ReportsView
      selectedChapter={selectedChapter}
      onChapterChange={setSelectedChapter}
      selectedChapterLabel={selectedChapter === "All" ? "All Chapters" : selectedChapterName}
      summaryLoaded={summaryLoaded}
      totalDevices={stats.totalDevices}
      pipeline={pipeline}
      ready={ready}
      donated={donated}
      scrapped={scrapped}
      completion={completion}
      pipelineCount={pipelineCount}
      valuationCount={valuationCount}
      partsCount={stats.partsCount}
      toolsCount={stats.toolsCount}
      busyExport={busyExport}
      onExport={handleExport}
    />
  );
}
