import { useState, useEffect } from "react";
import type { PartySummary, CreatePersonRequest, CreateOrgRequest } from "../types/inventory";
import { getParties, createPerson, createOrg } from "../services/partyService";
import { PartyPickerModal } from "../components/parties/PartyPickerModal";

export function PartyPickerModalContainer({
  onSelect,
  onCancel,
}: {
  onSelect: (party: PartySummary) => void;
  onCancel: () => void;
}) {
  const [parties, setParties] = useState<PartySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParties()
      .then((p) => {
        setParties(p);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleCreate(
    mode: "Person" | "Organization",
    req: CreatePersonRequest | CreateOrgRequest
  ) {
    if (mode === "Person") {
      await createPerson(req as CreatePersonRequest);
    } else {
      await createOrg(req as CreateOrgRequest);
    }
    // Re-fetch the list so the new party (returned as void by the API) appears
    const updated = await getParties();
    setParties(updated);
    // Find the newly created entry by name (last match wins in case of duplicates)
    const match = [...updated]
      .reverse()
      .find((p) => p.name.toLowerCase() === (req.name ?? "").toLowerCase());
    if (match) onSelect(match);
  }

  return (
    <PartyPickerModal
      parties={parties}
      loading={loading}
      onSelect={onSelect}
      onCancel={onCancel}
      onCreate={handleCreate}
    />
  );
}
