import { useState } from "react";
import type { BaseChangelogEntry } from "../types/changelog";
import { ModificationLogRow } from "./ModificationLogRow";

interface ModificationLogProps<T extends BaseChangelogEntry> {
  entries: T[];
  detailRenderer: (entry: T, onClose: () => void) => React.ReactNode;
}

export function ModificationLog<T extends BaseChangelogEntry>({
  entries,
  detailRenderer,
}: ModificationLogProps<T>) {
  const [selected, setSelected] = useState<T | null>(null);

  const sorted = [...entries].sort((a, b) => {
    if (!a.modifiedAt && !b.modifiedAt) return 0;
    if (!a.modifiedAt) return 1;
    if (!b.modifiedAt) return -1;
    return b.modifiedAt.localeCompare(a.modifiedAt);
  });

  return (
    <>
      {selected && detailRenderer(selected, () => setSelected(null))}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700">Modification History</h2>
        </div>

        {entries.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-400">
            No modification history yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Asset ID
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Change Type
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Date Modified
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Modified By
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {sorted.map((entry, i) => (
                  <ModificationLogRow key={i} entry={entry} onViewMore={() => setSelected(entry)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
