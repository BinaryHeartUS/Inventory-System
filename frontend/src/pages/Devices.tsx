import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import type { AnyDevice, DeviceStatus } from "../types/inventory";
import { getDevices } from "../services/deviceService";
import { useVisibleChapters } from "../context/ChapterContext";
import PageHeading from "../components/PageHeading";
import { DeviceList } from "../components/DeviceList";
import AddAssetButton from "../components/AddAssetButton";
// import AddAssetButton from '../components/AddAssetButton'

// ─── Types ────────────────────────────────────────────────────────────────────

const DEVICE_TYPES = ["All", "Desktop", "Laptop", "Tablet"] as const;
type DeviceTypeFilter = (typeof DEVICE_TYPES)[number];

const STATUS_OPTIONS: Array<DeviceStatus | "All"> = [
  "All",
  "Not Started",
  "In Progress",
  "Ready To Donate",
  "Donated",
  "Scrapped",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Devices() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DeviceTypeFilter>("All");
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | "All">("All");
  const [chapterFilter, setChapterFilter] = useState<string>(
    () => searchParams.get("chapter") ?? "All"
  );
  const [showDonated, setShowDonated] = useState(false);
  const [showScrapped, setShowScrapped] = useState(false);

  const [allDevices, setAllDevices] = useState<AnyDevice[]>([]);
  const chapters = useVisibleChapters().map((c) => c.name);

  useEffect(() => {
    getDevices().then(setAllDevices);
  }, []);

  const filtered = useMemo(() => {
    return allDevices.filter((d) => {
      if (!showDonated && d.status === "Donated") return false;
      if (!showScrapped && d.status === "Scrapped") return false;
      if (typeFilter !== "All" && d.type !== typeFilter) return false;
      if (statusFilter !== "All" && d.status !== statusFilter) return false;
      if (chapterFilter !== "All" && d.chapter !== chapterFilter) return false;
      if (search.trim().replace(/^0+|0+$/g, "")) {
        const s = search
          .trim()
          .toLowerCase()
          .replace(/^0+|0+$/g, "");
        return (
          String(d.id).includes(s) ||
          d.manufacturer?.toLowerCase().includes(s) ||
          d.model?.toLowerCase().includes(s) ||
          (d.cpu?.toLowerCase().includes(s) ?? false) ||
          d.chapter?.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [search, typeFilter, statusFilter, chapterFilter, showDonated, showScrapped, allDevices]);

  const total = allDevices.length;
  const hasFilters =
    search !== "" ||
    typeFilter !== "All" ||
    statusFilter !== "All" ||
    chapterFilter !== "All" ||
    showDonated ||
    showScrapped;

  function clearFilters() {
    setSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
    setChapterFilter("All");
    setShowDonated(false);
    setShowScrapped(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeading
          title="Devices"
          subtitle={
            filtered.length === total
              ? `All ${total} devices`
              : `${filtered.length} of ${total} devices`
          }
        />
        <div className="flex justify-end">
          <AddAssetButton className="w-full sm:w-auto" />
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search — matches ID, manufacturer, model, CPU, chapter */}
          <div className="relative w-full sm:w-auto">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="ID, manufacturer, model, CPU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue w-full sm:w-72 transition-all"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as DeviceStatus | "All")}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all cursor-pointer"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "All" ? "All Statuses" : s}
              </option>
            ))}
          </select>

          <select
            value={chapterFilter}
            onChange={(e) => setChapterFilter(e.target.value)}
            className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all cursor-pointer"
          >
            <option value="All">All Chapters</option>
            {chapters.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer select-none transition-all ${
              showDonated
                ? "bg-heart-blue/10 border-heart-blue text-heart-blue font-medium"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <input
              type="checkbox"
              checked={showDonated}
              onChange={(e) => setShowDonated(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                showDonated ? "bg-heart-blue border-heart-blue" : "border-slate-300"
              }`}
            >
              {showDonated && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 5l2.5 2.5 4.5-4.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            Include Donated
          </label>

          <label
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border cursor-pointer select-none transition-all ${
              showScrapped
                ? "bg-heart-blue/10 border-heart-blue text-heart-blue font-medium"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <input
              type="checkbox"
              checked={showScrapped}
              onChange={(e) => setShowScrapped(e.target.checked)}
              className="sr-only"
            />
            <span
              className={`w-4 h-4 rounded flex items-center justify-center border transition-all flex-shrink-0 ${
                showScrapped ? "bg-heart-blue border-heart-blue" : "border-slate-300"
              }`}
            >
              {showScrapped && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 5l2.5 2.5 4.5-4.5"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            Include Scrapped
          </label>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-brand-red hover:text-brand-red-dark underline underline-offset-2 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Type pills */}
        <div className="flex gap-1.5">
          {DEVICE_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
                typeFilter === t
                  ? "bg-brand-red text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
              }`}
            >
              {t === "All" ? "All Types" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Device table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <DeviceList
          devices={filtered}
          emptyMessage={
            <>
              No devices match the current filters.{" "}
              {hasFilters && (
                <button onClick={clearFilters} className="text-brand-red hover:underline">
                  Clear filters
                </button>
              )}
            </>
          }
        />
      </div>
    </div>
  );
}
