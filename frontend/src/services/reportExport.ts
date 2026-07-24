import type { AnyDevice, Part, Tool } from "../types/inventory";
import { downloadCsv, today, type CsvCell } from "../utils/csv";

/**
 * CSV export builders for the Reports page. Each takes already-loaded rows plus a
 * naming context and triggers a download. Kept free of React/page state so the
 * column mappings can be reused and tested independently.
 */

export function exportInInventoryDevices(devices: AnyDevice[], chapterSlug: string) {
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

export function exportParts(
  parts: Part[],
  chapterSlug: string,
  chapterName: (id: number) => string
) {
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

export function exportTools(tools: Tool[], chapterSlug: string) {
  downloadCsv(
    `tools-${chapterSlug}-${today()}.csv`,
    ["ID", "Description", "Chapter ID", "Acquisition Date", "Value ($)"],
    tools.map((t) => [t.id, t.description, t.chapterId, t.acquisitionDate, t.value])
  );
}

export function exportDonatedDevices(devices: AnyDevice[], chapterSlug: string) {
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

export function exportValuation(
  devices: AnyDevice[],
  parts: Part[],
  tools: Tool[],
  chapterSlug: string,
  chapterName: (id: number) => string
) {
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
        ] as CsvCell[]
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
        ] as CsvCell[]
    );
  const toolRows = tools
    .filter((t) => t.value != null)
    .map(
      (t) =>
        [
          "Tool",
          t.id,
          t.description,
          chapterName(t.chapterId),
          t.acquisitionDate,
          t.value,
        ] as CsvCell[]
    );
  downloadCsv(
    `inventory-valuation-${chapterSlug}-${today()}.csv`,
    ["Category", "ID", "Description", "Chapter", "Acquisition Date", "Value ($)"],
    [...deviceRows, ...partRows, ...toolRows]
  );
}
