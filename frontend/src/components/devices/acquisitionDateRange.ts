export interface AcquisitionDateRange {
  acquiredFrom: string | null;
  acquiredTo: string | null;
}

export function formatCalendarDate(date: Date): string {
  return `${String(date.getFullYear()).padStart(4, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function parseCalendarDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (year < 1) return undefined;
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  return formatCalendarDate(date) === value ? date : undefined;
}

export function parseAcquisitionDateRange(
  from: string,
  to: string
): { range: AcquisitionDateRange; error: null } | { range: null; error: string } {
  if ((from && !parseCalendarDate(from)) || (to && !parseCalendarDate(to))) {
    return { range: null, error: "Enter a valid acquisition date." };
  }
  if (from && to && from > to) {
    return { range: null, error: "The starting date cannot be later than the ending date." };
  }
  return { range: { acquiredFrom: from || null, acquiredTo: to || null }, error: null };
}
