// Shared value formatters. These return `string | null` so callers can decide
// how to render a missing value (e.g. an em-dash placeholder). Keep all
// display-formatting logic here so it can be reused and unit-tested in one place.

import { formatDate } from "./dateUtils";

export { formatDate };

/** Passes a string through, normalising empty/undefined to null. */
export function formatText(v: string | null | undefined): string | null {
  return v ?? null;
}

/** Formats a number as USD currency, e.g. `$12.50`. */
export function formatMoney(v: number | null | undefined): string | null {
  return v != null ? `$${v.toFixed(2)}` : null;
}

/** Formats a numeric identifier as `#123`. */
export function formatId(v: number | null | undefined): string | null {
  return v != null ? `#${v}` : null;
}

/** Formats a boolean as `Yes`/`No`. */
export function formatBool(v: boolean | null | undefined): string | null {
  return v != null ? (v ? "Yes" : "No") : null;
}

/** Formats a number as a plain string. */
export function formatNumber(v: number | null | undefined): string | null {
  return v != null ? String(v) : null;
}

/** Formats a 0–1 ratio as a whole percentage, e.g. `85%`. */
export function formatPercent(v: number | null | undefined): string | null {
  return v != null ? `${Math.round(v * 100)}%` : null;
}
