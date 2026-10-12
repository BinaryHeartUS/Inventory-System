export const MIN_MODEL_YEAR = 1980;

export interface ModelYearRange {
  yearFrom: number | null;
  yearTo: number | null;
}

export type ModelYearRangeResult =
  | { range: ModelYearRange; error: null }
  | { range: null; error: string };

function parseYear(value: string, currentYear: number): number | null | undefined {
  if (value === "") return null;
  const year = Number(value);
  return Number.isInteger(year) && year >= MIN_MODEL_YEAR && year <= currentYear ? year : undefined;
}

export function parseModelYearRange(
  from: string,
  to: string,
  currentYear = new Date().getFullYear()
): ModelYearRangeResult {
  const yearFrom = parseYear(from, currentYear);
  const yearTo = parseYear(to, currentYear);

  if (yearFrom === undefined || yearTo === undefined) {
    return {
      range: null,
      error: `Enter a year from ${MIN_MODEL_YEAR} through ${currentYear}.`,
    };
  }
  if (yearFrom !== null && yearTo !== null && yearFrom > yearTo) {
    return { range: null, error: "The starting year cannot be later than the ending year." };
  }
  return { range: { yearFrom, yearTo }, error: null };
}
