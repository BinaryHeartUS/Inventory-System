import { useEffect, useState } from "react";
import type { PartySummary } from "../types/inventory";
import { getParty } from "../services/partyService";

/**
 * Loads a party summary by id into state, reloading whenever the id changes.
 * Returns the loaded party (or null) plus a setter so callers can override it
 * optimistically (e.g. while editing a donor/recipient link).
 */
export function useLinkedParty(partyId: number | null | undefined) {
  const [party, setParty] = useState<PartySummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (partyId != null) {
      getParty(partyId)
        .then((p) => {
          if (!cancelled) setParty(p);
        })
        .catch(() => {
          if (!cancelled) setParty(null);
        });
    } else {
      // Defer to avoid a synchronous setState in the effect body
      // (repo lint treats react-hooks/set-state-in-effect as an error).
      Promise.resolve().then(() => {
        if (!cancelled) setParty(null);
      });
    }
    return () => {
      cancelled = true;
    };
  }, [partyId]);

  return [party, setParty] as const;
}
