import { useEffect, useId, useRef, useState, type ReactNode } from "react";

export function FilterPopover({ label, active, children, wide = false }: {
  label: string;
  active: boolean;
  children: ReactNode;
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const popoverId = useId();

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
      <button type="button" aria-haspopup="dialog" aria-expanded={open}
        aria-controls={open ? popoverId : undefined}
        onClick={() => {
          const bounds = menuRef.current?.getBoundingClientRect();
          setAlignRight(Boolean(wide && bounds && bounds.left + 320 > window.innerWidth - 16));
          setOpen((current) => !current);
        }}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all sm:w-auto ${active
          ? "border-heart-blue bg-heart-blue/10 font-medium text-heart-blue"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
        {label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div id={popoverId} role="dialog" aria-label={`${label} range`}
          className={`z-30 rounded-lg border border-slate-200 bg-white p-3 shadow-md ${wide
            ? `fixed inset-x-4 bottom-20 max-h-[70dvh] overflow-y-auto sm:absolute sm:inset-x-auto sm:bottom-auto sm:top-full sm:mt-2 sm:w-80 ${alignRight ? "sm:right-0" : "sm:left-0"}`
            : "absolute left-0 top-full mt-2 w-full sm:w-72"}`}>
          {children}
        </div>
      )}
    </div>
  );
}