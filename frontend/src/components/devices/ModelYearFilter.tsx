import { useEffect, useRef, useState } from "react";
import { MIN_MODEL_YEAR } from "./modelYearRange";

interface ModelYearFilterProps {
  from: string;
  to: string;
  error: string | null;
  onChange: (from: string, to: string) => void;
}

export function ModelYearFilter({ from, to, error, onChange }: ModelYearFilterProps) {
  const currentYear = new Date().getFullYear();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasRange = from !== "" || to !== "";

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        menuRef.current?.querySelector("button")?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={menuRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? "model-year-popover" : undefined}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all sm:w-auto ${
          hasRange
            ? "border-heart-blue bg-heart-blue/10 font-medium text-heart-blue"
            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
        }`}
      >
        Year
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          id="model-year-popover"
          role="dialog"
          aria-label="Model year range"
          className="absolute left-0 top-full z-30 mt-2 w-full rounded-lg border border-slate-200 bg-white p-3 shadow-md sm:w-72"
        >
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
        </div>
      )}
    </div>
  );
}
