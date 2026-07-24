import { Link } from "react-router-dom";

export function NotFound({
  entity,
  id,
  backTo,
  backLabel,
}: {
  entity: string;
  id: string | number | undefined;
  backTo: string;
  backLabel: string;
}) {
  const lower = entity.toLowerCase();
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-400"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-900">{entity} not found</p>
        <p className="text-xs text-slate-400 mt-1">
          No {lower} with ID <span className="font-mono">{id}</span> exists in inventory.
        </p>
      </div>
      <Link
        to={backTo}
        className="mt-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
      >
        ← {backLabel}
      </Link>
    </div>
  );
}
