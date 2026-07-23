import { useState, useEffect } from "react";
import { getParty, createPerson, updatePerson } from "../services/partyService";
import type { PersonDetail } from "../types/inventory";
import {
  PersonPanel,
  type PersonFormData,
  type PersonSaveRequest,
} from "../components/parties/PersonPanel";

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
