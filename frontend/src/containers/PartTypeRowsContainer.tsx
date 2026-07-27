import { useCallback } from "react";
import { getParts } from "../services/partService";
import type { PartTypeCountParams } from "../services/partService";
import type { Part } from "../types/inventory";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { PartRowContainer } from "./PartRowContainer";

export function PartTypeRowsContainer({
  type,
  filters,
}: {
  type: string;
  filters: PartTypeCountParams;
}) {
  const fetchPage = useCallback(
    (pageKey: number, pageSize: number) => getParts({ ...filters, type, pageKey, pageSize }),
    [filters, type]
  );
  const {
    items: parts,
    loading,
    sentinelRef,
  } = useInfiniteScroll<Part, HTMLTableRowElement>(fetchPage, [filters, type]);

  return (
    <>
      {parts.map((p) => (
        <PartRowContainer key={p.id} part={p} hideTypeCol />
      ))}
      <tr ref={sentinelRef} aria-hidden="true">
        <td colSpan={6} className="p-0">
          {loading && <p className="text-center text-sm text-slate-400 py-3">Loading parts…</p>}
        </td>
      </tr>
    </>
  );
}
