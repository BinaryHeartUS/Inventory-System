import type { BaseChangelogEntry } from "../types/changelog";
import { formatDate } from "../utils/dateUtils";

const CHANGE_TYPE_STYLES: Record<string, string> = {
  Insert: "bg-green-50 text-green-700",
  Update: "bg-blue-50 text-blue-700",
  Delete: "bg-red-50 text-red-600",
};

export function ModificationLogRow<T extends BaseChangelogEntry>({
  entry,
  onViewMore,
}: {
  entry: T;
  onViewMore: () => void;
}) {
  const badgeCls = CHANGE_TYPE_STYLES[entry.changeType ?? ""] ?? "bg-slate-100 text-slate-600";

  return (
    <tr className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
      <td className="px-5 py-4 font-mono text-xs text-slate-400">#{entry.assetId}</td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${badgeCls}`}
        >
          {entry.changeType ?? "—"}
        </span>
      </td>
      <td className="px-5 py-4 text-sm text-slate-600 whitespace-nowrap">
        {formatDate(entry.modifiedAt ?? null) ?? "—"}
      </td>
      <td className="px-5 py-4 text-sm text-slate-700">{entry.modifiedBy ?? "—"}</td>
      <td className="px-5 py-4">
        <button
          onClick={onViewMore}
          className="text-xs font-medium text-heart-blue hover:text-heart-blue-dark hover:underline transition-colors"
        >
          View more
        </button>
      </td>
    </tr>
  );
}
