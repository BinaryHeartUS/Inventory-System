import { useState, type CSSProperties } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { FilterPopover } from "./FilterPopover";
import { formatCalendarDate, parseCalendarDate } from "./acquisitionDateRange";

interface AcquisitionDateFilterProps {
  from: string;
  to: string;
  error: string | null;
  onChange: (from: string, to: string) => void;
}

export function AcquisitionDateFilter({ from, to, error, onChange }: AcquisitionDateFilterProps) {
  const fromDate = parseCalendarDate(from);
  const toDate = parseCalendarDate(to);
  const [month, setMonth] = useState(() => fromDate ?? toDate ?? new Date());

  return (
    <FilterPopover label="Acquisition date" active={Boolean(from || to)} wide>
      <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
        <label className="min-w-0">
          From
          <input
            type="date"
            aria-label="Acquired from"
            value={from}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "acquisition-date-error" : undefined}
            onChange={(event) => {
              onChange(event.target.value, to);
              const date = parseCalendarDate(event.target.value);
              if (date) setMonth(date);
            }}
            className="mt-1 h-10 w-full min-w-0 rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-heart-blue focus:ring-2 focus:ring-heart-blue"
          />
        </label>
        <label className="min-w-0">
          To
          <input
            type="date"
            aria-label="Acquired to"
            value={to}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "acquisition-date-error" : undefined}
            onChange={(event) => {
              onChange(from, event.target.value);
              const date = parseCalendarDate(event.target.value);
              if (date) setMonth(date);
            }}
            className="mt-1 h-10 w-full min-w-0 rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-heart-blue focus:ring-2 focus:ring-heart-blue"
          />
        </label>
      </div>
      {error && (
        <p id="acquisition-date-error" role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
      <DayPicker
        mode="range"
        month={month}
        onMonthChange={setMonth}
        captionLayout="dropdown"
        startMonth={new Date(1900, 0)}
        endMonth={new Date(new Date().getFullYear() + 10, 11)}
        selected={error ? undefined : { from: fromDate, to: toDate }}
        onSelect={(range) =>
          onChange(
            range?.from ? formatCalendarDate(range.from) : "",
            range?.to ? formatCalendarDate(range.to) : ""
          )
        }
        className="mt-3 text-sm"
        style={
          {
            "--rdp-accent-color": "var(--color-heart-blue)",
            "--rdp-day-width": "36px",
            "--rdp-day-height": "36px",
            "--rdp-day_button-width": "34px",
            "--rdp-day_button-height": "34px",
            "--rdp-months-gap": "0",
          } as CSSProperties
        }
      />
      <button
        type="button"
        onClick={() => onChange("", "")}
        disabled={!from && !to}
        className="mt-3 text-xs font-medium text-brand-red underline underline-offset-2 hover:text-brand-red-dark disabled:cursor-not-allowed disabled:text-slate-400"
      >
        Reset range
      </button>
    </FilterPopover>
  );
}
