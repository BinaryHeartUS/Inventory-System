import { Link } from "react-router-dom";
import StatusBadge from "../StatusBadge";
import type { DeviceStatus } from "../../types/inventory";
import { formatDate } from "../../utils/dateUtils";

export type AssetRow = {
  id: number;
  label: string;
  detail: string;
  status?: string;
  chapter?: string;
  acquired: string | null;
};

export function AssetTable({
  rows,
  basePath,
  emptyMessage,
}: {
  rows: AssetRow[];
  basePath: string;
  emptyMessage: string;
}) {
  if (rows.length === 0)
    return <p className="px-6 py-10 text-center text-sm text-slate-400">{emptyMessage}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="responsive-cards w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {[
              "ID",
              "Asset",
              ...(rows[0].status !== undefined ? ["Status"] : []),
              ...(rows[0].chapter !== undefined ? ["Chapter"] : []),
              "Acquired",
              "",
            ].map((h) => (
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
            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3 font-mono text-xs text-slate-400" data-label="ID">
                #{row.id}
              </td>
              <td className="px-5 py-3 text-slate-800" data-label="Asset">
                {row.label}
                {row.detail && <span className="ml-1.5 text-slate-400 text-xs">{row.detail}</span>}
              </td>
              {row.status !== undefined && (
                <td className="px-5 py-3" data-label="Status">
                  <StatusBadge status={row.status as DeviceStatus} />
                </td>
              )}
              {row.chapter !== undefined && (
                <td className="px-5 py-3 text-slate-500 whitespace-nowrap" data-label="Chapter">
                  {row.chapter ?? "—"}
                </td>
              )}
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
