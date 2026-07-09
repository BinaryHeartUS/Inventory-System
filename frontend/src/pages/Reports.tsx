import { useState, useEffect } from "react";
import { getDevices } from "../services/deviceService";
import { getParts } from "../services/partService";
import { getTools } from "../services/toolService";
import { useChapters, useVisibleChapters } from "../context/ChapterContext";
import type { AnyDevice, Part, Tool } from "../types/inventory";
import PageHeading from "../components/PageHeading";
import ChapterTabs from "../components/ChapterTabs";

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function escapeCsvCell(value: string | number | null | undefined): string {
  const s = String(value ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

function downloadCsv(
  filename: string,
  header: string[],
  rows: (string | number | null | undefined)[][]
) {
  const lines = [
    header.map(escapeCsvCell).join(","),
    ...rows.map((r) => r.map(escapeCsvCell).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ExportCard({
  title,
  icon,
  description,
  count,
  colorText,
  colorBg,
  onExport,
}: {
  title: string;
  icon: React.ReactNode;
  description: string;
  count: number;
  colorText: string;
  colorBg: string;
  onExport: () => void;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col h-full">
      <div
        className={`w-9 h-9 ${colorBg} ${colorText} rounded-lg flex items-center justify-center mb-4 shrink-0`}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-800">{title} Export</p>
      <p className="text-xs text-slate-400 mt-2 flex-1 leading-relaxed">{description}</p>
      <button
        onClick={onExport}
        disabled={count === 0}
        className={`mt-4 w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
          count > 0
            ? `${colorBg} ${colorText} hover:opacity-80`
            : "bg-slate-100 text-slate-400 cursor-not-allowed"
        }`}
      >
        {count > 0 ? `Download CSV (${count} rows)` : "No data to export"}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Reports() {
  const [allDevices, setAllDevices] = useState<AnyDevice[]>([]);
  const [allParts, setAllParts] = useState<Part[]>([]);
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [chapter, setChapter] = useState("All");
  const visibleChapters = useVisibleChapters();
  const { chapterName } = useChapters();
  const chapters = visibleChapters.map((c) => c.name);

  useEffect(() => {
    Promise.all([getDevices(), getParts(), getTools()]).then(([d, p, t]) => {
      setAllDevices(d);
      setAllParts(p);
      setAllTools(t);
    });
  }, []);

  const devices = chapter === "All" ? allDevices : allDevices.filter((d) => d.chapter === chapter);
  const selectedChapterId =
    chapter === "All" ? null : visibleChapters.find((c) => c.name === chapter)?.id;
  const parts =
    selectedChapterId == null
      ? allParts
      : allParts.filter((p) => p.chapterId === selectedChapterId);
  const tools =
    selectedChapterId == null
      ? allTools
      : allTools.filter((t) => t.chapterId === selectedChapterId);

  const donated = devices.filter((d) => d.status === "Donated").length;
  const inProgress = devices.filter(
    (d) => d.status === "Not Started" || d.status === "In Progress"
  ).length;
  const ready = devices.filter((d) => d.status === "Ready To Donate").length;
  const scrapped = devices.filter((d) => d.status === "Scrapped").length;
  const nonScrapped = devices.filter(
    (d) => d.status !== "Scrapped" && d.status !== "Unknown"
  ).length;
  const completion = nonScrapped > 0 ? Math.round((donated / nonScrapped) * 100) : 0;

  const chapterSlug = slugify(chapter === "All" ? "all-chapters" : chapter);

  function exportInInventory() {
    const inInventory = devices.filter(
      (d) =>
        d.status === "Not Started" || d.status === "In Progress" || d.status === "Ready To Donate"
    );
    downloadCsv(
      `in-inventory-devices-${chapterSlug}-${today()}.csv`,
      [
        "ID",
        "Type",
        "Manufacturer",
        "Model",
        "Year",
        "CPU",
        "RAM (GB)",
        "RAM Generation",
        "Storage (GB)",
        "Storage Type",
        "Status",
        "Chapter",
        "Acquisition Date",
        "Value ($)",
      ],
      inInventory.map((d) => [
        d.id,
        d.type,
        d.manufacturer,
        d.model,
        d.year,
        d.cpu,
        d.ram,
        d.ramGeneration,
        d.storage,
        d.storageType,
        d.status,
        d.chapter,
        d.acquisitionDate,
        d.value,
      ])
    );
  }

  function exportParts() {
    downloadCsv(
      `parts-${chapterSlug}-${today()}.csv`,
      [
        "ID",
        "Type",
        "Description",
        "Chapter",
        "Source",
        "Contained In Device",
        "Acquisition Date",
        "Value ($)",
      ],
      parts.map((p) => [
        p.id,
        p.type,
        p.description,
        chapterName(p.chapterId),
        p.wasPurchased ? "Purchased" : "Donated",
        p.containedIn,
        p.acquisitionDate,
        p.value,
      ])
    );
  }

  function exportTools() {
    downloadCsv(
      `tools-${chapterSlug}-${today()}.csv`,
      ["ID", "Description", "Chapter ID", "Acquisition Date", "Value ($)"],
      tools.map((t) => [t.id, t.description, t.chapterId, t.acquisitionDate, t.value])
    );
  }

  function exportDonated() {
    const donated = devices.filter((d) => d.status === "Donated");
    downloadCsv(
      `donated-devices-${chapterSlug}-${today()}.csv`,
      [
        "ID",
        "Type",
        "Manufacturer",
        "Model",
        "Year",
        "CPU",
        "RAM (GB)",
        "Storage (GB)",
        "Storage Type",
        "Chapter",
        "Acquisition Date",
      ],
      donated.map((d) => [
        d.id,
        d.type,
        d.manufacturer,
        d.model,
        d.year,
        d.cpu,
        d.ram,
        d.storage,
        d.storageType,
        d.chapter,
        d.acquisitionDate,
      ])
    );
  }

  function exportValuation() {
    const deviceRows = devices
      .filter((d) => d.value != null)
      .map(
        (d) =>
          [
            "Device",
            d.id,
            `${d.manufacturer ?? ""} ${d.model ?? ""}`.trim(),
            d.chapter,
            d.acquisitionDate,
            d.value,
          ] as (string | number | null | undefined)[]
      );
    const partRows = parts
      .filter((p) => p.value != null)
      .map(
        (p) =>
          [
            "Part",
            p.id,
            p.description || p.type,
            chapterName(p.chapterId),
            p.acquisitionDate,
            p.value,
          ] as (string | number | null | undefined)[]
      );
    const toolRows = tools
      .filter((t) => t.value != null)
      .map(
        (t) =>
          ["Tool", t.id, t.description, chapterName(t.chapterId), t.acquisitionDate, t.value] as (
            | string
            | number
            | null
            | undefined
          )[]
      );
    downloadCsv(
      `inventory-valuation-${chapterSlug}-${today()}.csv`,
      ["Category", "ID", "Description", "Chapter", "Acquisition Date", "Value ($)"],
      [...deviceRows, ...partRows, ...toolRows]
    );
  }

  const valuationCount =
    devices.filter((d) => d.value != null).length +
    parts.filter((p) => p.value != null).length +
    tools.filter((t) => t.value != null).length;

  return (
    <div className="space-y-6">
      <PageHeading title="Reports" subtitle="Export inventory data and view summary statistics" />

      {/* Chapter filter */}
      <ChapterTabs chapters={chapters} selected={chapter} onChange={setChapter} />

      {/* Summary stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Summary — {chapter === "All" ? "All Chapters" : chapter}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Devices", value: devices.length, color: "text-heart-blue" },
            { label: "In Pipeline", value: inProgress, color: "text-amber-600" },
            { label: "Ready", value: ready, color: "text-green-600" },
            { label: "Donated", value: donated, color: "text-sky-600" },
            { label: "Scrapped", value: scrapped, color: "text-red-500" },
            { label: "Completion", value: `${completion}%`, color: "text-slate-700" },
          ].map(({ label, value, color }) => (
            <div key={label} className="border-l-2 border-slate-100 pl-3 first:border-0 first:pl-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {label}
              </p>
              <p className={`text-2xl font-extrabold leading-none ${color}`}>{value}</p>
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
            count={
              devices.filter(
                (d) =>
                  d.status === "Not Started" ||
                  d.status === "In Progress" ||
                  d.status === "Ready To Donate"
              ).length
            }
            colorText="text-amber-600"
            colorBg="bg-amber-50"
            onExport={exportInInventory}
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
            count={devices.filter((d) => d.status === "Donated").length}
            colorText="text-sky-600"
            colorBg="bg-sky-50"
            onExport={exportDonated}
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
            count={parts.length}
            colorText="text-emerald-600"
            colorBg="bg-emerald-50"
            onExport={exportParts}
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
            count={tools.length}
            colorText="text-rose-600"
            colorBg="bg-rose-50"
            onExport={exportTools}
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
            onExport={exportValuation}
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
