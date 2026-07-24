import PageHeading from "../PageHeading";
import ChapterFilterContainer from "../../containers/ChapterFilterContainer";
import { ExportCard } from "./ExportCard";

export type ReportExportKey = "pipeline" | "donated" | "parts" | "tools" | "valuation";

export interface ReportsViewProps {
  selectedChapter: number | "All";
  onChapterChange: (value: number | "All") => void;
  selectedChapterLabel: string;
  summaryLoaded: boolean;
  totalDevices: number;
  pipeline: number;
  ready: number;
  donated: number;
  scrapped: number;
  completion: number;
  pipelineCount: number;
  valuationCount: number;
  partsCount: number;
  toolsCount: number;
  busyExport: string | null;
  onExport: (key: ReportExportKey) => void;
}

export default function ReportsView({
  selectedChapter,
  onChapterChange,
  selectedChapterLabel,
  summaryLoaded,
  totalDevices,
  pipeline,
  ready,
  donated,
  scrapped,
  completion,
  pipelineCount,
  valuationCount,
  partsCount,
  toolsCount,
  busyExport,
  onExport,
}: ReportsViewProps) {
  return (
    <div className="space-y-6">
      <PageHeading title="Reports" subtitle="Export inventory data and view summary statistics" />

      {/* Chapter filter */}
      <ChapterFilterContainer selected={selectedChapter} onChange={onChapterChange} />

      {/* Summary stats */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Summary — {selectedChapterLabel}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Total Devices", value: totalDevices, color: "text-heart-blue" },
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
            onExport={() => onExport("pipeline")}
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
            onExport={() => onExport("donated")}
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
            count={partsCount}
            colorText="text-emerald-600"
            colorBg="bg-emerald-50"
            onExport={() => onExport("parts")}
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
            count={toolsCount}
            colorText="text-rose-600"
            colorBg="bg-rose-50"
            onExport={() => onExport("tools")}
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
            onExport={() => onExport("valuation")}
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
