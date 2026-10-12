import { FilterPopover } from "./FilterPopover";
import { MIN_MODEL_YEAR } from "./modelYearRange";

interface ModelYearFilterProps {
  from: string;
  to: string;
  error: string | null;
  onChange: (from: string, to: string) => void;
}

export function ModelYearFilter({ from, to, error, onChange }: ModelYearFilterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <FilterPopover label="Year" active={from !== "" || to !== ""}>
      <div className="flex h-10 items-center gap-2 text-sm text-slate-600">
        <label className="sr-only" htmlFor="model-year-from">
          Model year from
        </label>
        <input
          id="model-year-from"
          type="number"
          inputMode="numeric"
          min={MIN_MODEL_YEAR}
          max={currentYear}
          placeholder="From"
          value={from}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "model-year-error" : undefined}
          onChange={(event) => onChange(event.target.value, to)}
          className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-heart-blue focus:ring-2 focus:ring-heart-blue"
        />
        <span>to</span>
        <label className="sr-only" htmlFor="model-year-to">
          Model year to
        </label>
        <input
          id="model-year-to"
          type="number"
          inputMode="numeric"
          min={MIN_MODEL_YEAR}
          max={currentYear}
          placeholder="To"
          value={to}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "model-year-error" : undefined}
          onChange={(event) => onChange(from, event.target.value)}
          className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none transition-all focus:border-heart-blue focus:ring-2 focus:ring-heart-blue"
        />
      </div>
      {error && (
        <p id="model-year-error" role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
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
