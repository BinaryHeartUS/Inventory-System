import { useEffect, useRef, useState } from "react";

interface FilterChecklistMenuProps<T extends string> {
  label: string;
  options: readonly T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  isDefault: boolean;
  optionLabel?: (option: T) => string;
}

export function FilterChecklistMenu<T extends string>({
  label,
  options,
  selected,
  onChange,
  isDefault,
  optionLabel = (option) => option,
}: FilterChecklistMenuProps<T>) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(selected);
  const menuRef = useRef<HTMLDivElement>(null);

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

  function toggleOption(option: T, checked: boolean) {
    const next = new Set(draft);
    if (checked) next.add(option);
    else if (next.size > 1) next.delete(option);
    const nextSelected = options.filter((candidate) => next.has(candidate));
    setDraft(nextSelected);
    onChange(nextSelected);
  }

  return (
    <div ref={menuRef} className="relative w-full sm:w-auto">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => {
          if (!open) setDraft(selected);
          setOpen((current) => !current);
        }}
        className={`flex w-full sm:w-auto items-center justify-center gap-2 text-sm px-3 py-2 rounded-lg border transition-all ${
          isDefault
            ? "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
            : "bg-heart-blue/10 border-heart-blue text-heart-blue font-medium"
        }`}
      >
        {label}
        <span className="min-w-5 h-5 px-1 rounded-full bg-heart-blue text-white text-[11px] font-semibold flex items-center justify-center">
          {selected.length}
        </span>
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
          className="absolute left-0 top-full z-30 mt-2 w-52 rounded-lg border border-slate-200 bg-white p-2 shadow-md"
        >
          {options.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={draft.includes(option)}
                disabled={draft.length === 1 && draft.includes(option)}
                onChange={(event) => toggleOption(option, event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-heart-blue disabled:cursor-not-allowed"
              />
              {optionLabel(option)}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
