import { Link } from "react-router-dom";
import { formatDate } from "../../utils/dateUtils";

export type DonatedRow = {
  id: number;
  label: string;
  year?: number | string | null;
  detail: string;
  value: number | null;
  acquired: string | null;
};

export function DonatedTable({
  rows,
  basePath,
  emptyMessage,
  selectMode,
  selected,
  onToggle,
  onToggleAll,
}: {
  rows: DonatedRow[];
  basePath: string;
  emptyMessage: string;
  selectMode: boolean;
  selected: Set<number>;
  onToggle: (id: number) => void;
  onToggleAll: (ids: number[]) => void;
}) {
  if (rows.length === 0)
    return <p className="px-6 py-10 text-center text-sm text-slate-400">{emptyMessage}</p>;
  const allChecked = rows.length > 0 && rows.every((r) => selected.has(r.id));
  return (
    <div className="overflow-x-auto">
      <table className="responsive-cards w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {selectMode && (
              <th className="px-5 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={() => onToggleAll(rows.map((r) => r.id))}
                  className="rounded border-slate-300 text-heart-blue cursor-pointer"
                />
              </th>
            )}
            {["ID", "Asset", "Acquired", ""].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr
              key={row.id}
              className={`transition-colors ${selectMode && selected.has(row.id) ? "bg-blue-50/40" : "hover:bg-slate-50"}`}
            >
              {selectMode && (
                <td className="px-5 py-3" data-label="Select">
                  <input
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={() => onToggle(row.id)}
                    className="rounded border-slate-300 text-heart-blue cursor-pointer"
                  />
                </td>
              )}
              <td className="px-5 py-3 font-mono text-xs text-slate-400" data-label="ID">
                #{row.id}
              </td>
              <td className="px-5 py-3 text-slate-800" data-label="Asset">
                {row.label}
                {row.detail && <span className="ml-1.5 text-slate-400 text-xs">{row.detail}</span>}
              </td>
              <td className="px-5 py-3 text-slate-500 whitespace-nowrap" data-label="Acquired">
                {formatDate(row.acquired) ?? "—"}
              </td>
              <td className="px-5 py-3 text-right" data-label="">
                <Link
                  to={`${basePath}/${row.id}`}
                  className="text-xs font-medium text-heart-blue hover:underline whitespace-nowrap"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
