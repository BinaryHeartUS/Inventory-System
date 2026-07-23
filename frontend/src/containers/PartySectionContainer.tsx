import { useEffect, useState } from "react";
import { getParties } from "../services/partyService";
import type { PartySummary } from "../types/inventory";
import PartySectionView from "../components/manageParties/PartySectionView";

type SectionType = "individuals" | "organizations";

export interface PartySectionContainerProps {
  kind: SectionType;
  refreshKey: number;
  onRefresh: () => void;
}

/**
 * PartySectionContainer — loads the party list for one kind (individuals or
 * organizations) and reloads whenever refreshKey changes.
 */
export default function PartySectionContainer({
  kind,
  refreshKey,
  onRefresh,
}: PartySectionContainerProps) {
  const isPerson = kind === "individuals";
  const [items, setItems] = useState<PartySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.resolve().then(() => {
      if (!cancelled) {
        setLoading(true);
        setListError(null);
      }
    });
    getParties({ type: isPerson ? "person" : "organization" })
      .then((all) => {
        if (!cancelled) {
          setItems(all);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setListError(e instanceof Error ? e.message : "Failed to load");
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isPerson, refreshKey]);

  return (
    <PartySectionView
      isPerson={isPerson}
      items={items}
      loading={loading}
      listError={listError}
      onRefresh={onRefresh}
    />
  );
}
