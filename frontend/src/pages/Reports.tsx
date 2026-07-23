import { useState, useEffect, useMemo } from "react";
import { getDevices, getChapterInventorySummary } from "../services/deviceService";
import { getParts } from "../services/partService";
import { getTools } from "../services/toolService";
import { fetchAllPages } from "../services/api";
import { useChapters, useVisibleChapters } from "../context/ChapterContext";
import { useToast } from "../context/ToastContext";
import type { ChapterInventorySummary } from "../types/inventory";
import PageHeading from "../components/PageHeading";
import ChapterFilter from "../components/ChapterFilter";
import { ExportCard } from "../components/ExportCard";
import { slugify } from "../utils/csv";
import * as reportExport from "../services/reportExport";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Reports() {
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

  return (
    <div className="space-y-6">
      <PageHeading title="Reports" subtitle="Export inventory data and view summary statistics" />

      {/* Chapter filter */}
      <ChapterFilter selected={selectedChapter} onChange={setSelectedChapter} />

      {/* Summary stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Summary — {selectedChapter === "All" ? "All Chapters" : selectedChapterName}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Devices", value: stats.totalDevices, color: "text-heart-blue" },
            { label: "In Pipeline", value: pipeline, color: "text-amber-600" },
            { label: "Ready", value: ready, color: "text-green-600" },
            { label: "Donated", value: donated, color: "text-sky-600" },
            { label: "Scrapped", value: scrapped, color: "text-red-500" },
            { label: "Completion", value: `${completion}%`, color: "text-slate-700" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="border-l-2 border-slate-100 pl-3 lg:first:border-0 lg:first:pl-0"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {label}
              </p>
              <p className={`text-2xl font-extrabold leading-none ${color}`}>
                {summaryLoaded ? value : <span className="text-slate-300">—</span>}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Export cards */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
          CSV Exports
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <ExportCard
            title="Pipeline Devices"
            description="Devices currently Not Started, In Progress, or Ready to Donate — the active working inventory."
            count={pipelineCount}
            colorText="text-amber-600"
            colorBg="bg-amber-50"
            onExport={() => runExport("pipeline", exportInInventory)}
            busy={busyExport === "pipeline"}
            loading={!summaryLoaded}
            icon={
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
            }
          />

          <ExportCard
            title="Donated Devices"
            description="Devices with Donated status only — useful for grant and impact reporting."
            count={donated}
            colorText="text-sky-600"
            colorBg="bg-sky-50"
            onExport={() => runExport("donated", exportDonated)}
            busy={busyExport === "donated"}
            loading={!summaryLoaded}
            icon={
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 12 20 22 4 22 4 12" />
                <rect x="2" y="7" width="20" height="5" />
                <line x1="12" y1="22" x2="12" y2="7" />
                <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
              </svg>
            }
          />

          <ExportCard
            title="Parts"
            description="All parts — type, description, source, and which device each belongs to."
            count={stats.partsCount}
            colorText="text-emerald-600"
            colorBg="bg-emerald-50"
            onExport={() => runExport("parts", exportParts)}
            busy={busyExport === "parts"}
            loading={!summaryLoaded}
            icon={
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
              </svg>
            }
          />

          <ExportCard
            title="Tools"
            description="All tools in inventory with description and acquisition info."
            count={stats.toolsCount}
            colorText="text-rose-600"
            colorBg="bg-rose-50"
            onExport={() => runExport("tools", exportTools)}
            busy={busyExport === "tools"}
            loading={!summaryLoaded}
            icon={
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
            }
          />

          <ExportCard
            title="Inventory Valuation"
            description="All assets with a recorded value — devices, parts, and tools — for insurance or grant reporting."
            count={valuationCount}
            colorText="text-violet-600"
            colorBg="bg-violet-50"
            onExport={() => runExport("valuation", exportValuation)}
            busy={busyExport === "valuation"}
            loading={!summaryLoaded}
            icon={
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}
