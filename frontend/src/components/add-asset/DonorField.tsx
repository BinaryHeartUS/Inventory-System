import type { PartySummary } from "../../types/inventory";
import { labelCls } from "../../utils/formStyles";

export function DonorField({
  selectedParty,
  onOpen,
  onClear,
  colSpan = true,
}: {
  selectedParty: PartySummary | null;
  onOpen: () => void;
  onClear: () => void;
  colSpan?: boolean;
}) {
  return (
    <div className={colSpan ? "col-span-full" : ""}>
      <label className={labelCls}>Donor</label>
      {selectedParty ? (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
          <span className="text-sm text-slate-700">{selectedParty.name}</span>
          <span
            className={`ml-1 text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${selectedParty.type === "Person" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}
          >
            {selectedParty.type === "Person" ? "Individual" : "Organization"}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="ml-auto text-slate-400 hover:text-red-500 p-0.5 rounded transition-colors"
            title="Remove donor"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center gap-2 w-full text-sm text-slate-500 border border-slate-200 border-dashed rounded-lg px-3 py-2 hover:border-heart-blue hover:text-heart-blue hover:bg-heart-blue/5 transition-all"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Select donor (optional)
        </button>
      )}
    </div>
  );
}
