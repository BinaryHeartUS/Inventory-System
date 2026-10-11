import { useEffect, useRef, useState } from "react";

interface ArchivedDevicesMenuProps {
  includeDonated: boolean;
  onIncludeDonatedChange: (value: boolean) => void;
  includeSold: boolean;
  onIncludeSoldChange: (value: boolean) => void;
  includeScrapped: boolean;
  onIncludeScrappedChange: (value: boolean) => void;
  disabled?: boolean;
}

export function ArchivedDevicesMenu({
  includeDonated,
  onIncludeDonatedChange,
  includeSold,
  onIncludeSoldChange,
  includeScrapped,
  onIncludeScrappedChange,
  disabled = false,
}: ArchivedDevicesMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedCount = [includeDonated, includeSold, includeScrapped].filter(Boolean).length;

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (disabled) Promise.resolve().then(() => setOpen(false));
  }, [disabled]);

  const options = [
    {
      label: "Include Donated",
      checked: includeDonated,
      onChange: onIncludeDonatedChange,
    },
    { label: "Include Sold", checked: includeSold, onChange: onIncludeSoldChange },
    {
      label: "Include Scrapped",
      checked: includeScrapped,
      onChange: onIncludeScrappedChange,
    },
  ];

  return (
    <div ref={menuRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full sm:w-auto items-center justify-center gap-2 text-sm px-3 py-2 rounded-lg border transition-all ${
          disabled
            ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300"
            : selectedCount > 0
              ? "bg-heart-blue/10 border-heart-blue text-heart-blue font-medium"
              : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
        }`}
      >
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 8v13H3V8" />
          <path d="M1 3h22v5H1z" />
          <path d="M10 12h4" />
        </svg>
        Archived
        {selectedCount > 0 && (
          <span className="min-w-5 h-5 px-1 rounded-full bg-heart-blue text-white text-[11px] font-semibold flex items-center justify-center">
            {selectedCount}
          </span>
        )}
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
          role="menu"
          className="absolute left-0 top-full z-30 mt-2 w-52 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
        >
          {options.map((option) => (
            <label
              key={option.label}
              className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={option.checked}
                onChange={(event) => option.onChange(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-heart-blue"
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
