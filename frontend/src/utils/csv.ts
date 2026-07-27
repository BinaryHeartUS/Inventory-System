export type CsvCell = string | number | null | undefined;

export function escapeCsvCell(value: CsvCell): string {
  const s = String(value ?? "");
  return `"${s.replace(/"/g, '""')}"`;
}

export function downloadCsv(filename: string, header: string[], rows: CsvCell[][]) {
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

/** Today's date as an ISO `YYYY-MM-DD` string, for filenames. */
export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/\s+/g, "-");
}
