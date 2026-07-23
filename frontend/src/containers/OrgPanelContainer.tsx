/**
 * OrgPanelContainer — data + persistence for the organization editor.
 *
 * Fetches the existing organization on mount (edit mode), assembles the initial
 * form values, and persists via partyService create/update. The presentational
 * OrgPanel is remounted (via key) once data is ready so it can seed its form
 * state from the loaded values without effect-based syncing.
 */

import { useState, useEffect } from "react";
import { getParty, createOrg, updateOrg } from "../services/partyService";
import type { OrgDetail } from "../types/inventory";
import { OrgPanel, type OrgFormData, type OrgSaveRequest } from "../components/OrgPanel";

const BLANK: OrgFormData = {
  name: "",
  contactName: "",
  contactEmail: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  hasLocation: false,
};

export function OrgPanelContainer({
  partyId,
  onClose,
  onSaved,
}: {
  partyId: number | "new";
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = partyId === "new";
  const [loading, setLoading] = useState(!isNew);
  const [initial, setInitial] = useState<OrgFormData>(BLANK);

  useEffect(() => {
    if (isNew) return;
    getParty(partyId as number)
      .then((detail) => {
        const o = detail as OrgDetail;
        const loc = o.location;
        setInitial({
          name: o.name,
          contactName: o.contactName ?? "",
          contactEmail: o.contactEmail ?? "",
          street: loc?.street ?? "",
          city: loc?.city ?? "",
          state: loc?.state ?? "",
          zipCode: loc?.zipCode ?? "",
          country: loc?.country ?? "",
          hasLocation: !!loc,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isNew, partyId]);

  async function handleSave(req: OrgSaveRequest) {
    if (isNew) {
      await createOrg(req);
    } else {
      await updateOrg(partyId as number, req);
    }
    onSaved();
  }

  return (
    <OrgPanel
      key={`${String(partyId)}-${loading}`}
      isNew={isNew}
      loading={loading}
      initial={initial}
      onClose={onClose}
      onSave={handleSave}
    />
  );
}
