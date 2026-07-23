/**
 * PersonPanelContainer — data + persistence for the individual (person) editor.
 *
 * Fetches the existing person on mount (edit mode), assembles the initial form
 * values, and persists via partyService create/update. The presentational
 * PersonPanel is remounted (via key) once data is ready so it can seed its
 * form state from the loaded values without effect-based syncing.
 */

import { useState, useEffect } from "react";
import { getParty, createPerson, updatePerson } from "../services/partyService";
import type { PersonDetail } from "../types/inventory";
import {
  PersonPanel,
  type PersonFormData,
  type PersonSaveRequest,
} from "../components/PersonPanel";

const BLANK: PersonFormData = {
  name: "",
  email: "",
  street: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  hasLocation: false,
};

export function PersonPanelContainer({
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
  const [initial, setInitial] = useState<PersonFormData>(BLANK);

  useEffect(() => {
    if (isNew) return;
    getParty(partyId as number)
      .then((detail) => {
        const p = detail as PersonDetail;
        const loc = p.location;
        setInitial({
          name: p.name,
          email: p.email ?? "",
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

  async function handleSave(req: PersonSaveRequest) {
    if (isNew) {
      await createPerson(req);
    } else {
      await updatePerson(partyId as number, req);
    }
    onSaved();
  }

  return (
    <PersonPanel
      key={`${String(partyId)}-${loading}`}
      isNew={isNew}
      loading={loading}
      initial={initial}
      onClose={onClose}
      onSave={handleSave}
    />
  );
}
