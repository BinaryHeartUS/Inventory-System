import { useState, useEffect } from "react";
import { getParty, createOrg, updateOrg } from "../services/partyService";
import type { OrgDetail } from "../types/inventory";
import { formatLocation } from "../types/inventory";
import { inputCls, labelCls } from "../utils/formStyles";
import { AddressFields } from "./AddressFields";

export function OrgPanel({
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
  const [name, setName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [showAddr, setShowAddr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNew) return;
    getParty(partyId as number)
      .then((detail) => {
        const o = detail as OrgDetail;
        setName(o.name);
        setContactName(o.contactName ?? "");
        setContactEmail(o.contactEmail ?? "");
        const loc = o.location;
        if (loc) {
          setStreet(loc.street ?? "");
          setCity(loc.city ?? "");
          setState(loc.state ?? "");
          setZipCode(loc.zipCode ?? "");
          setCountry(loc.country ?? "");
          setShowAddr(true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isNew, partyId]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    const location =
      street || city || state || zipCode || country
        ? formatLocation({ street, city, state, zipCode, country })
        : undefined;
    const req = {
      name: name.trim(),
      ...(contactName.trim() ? { contactName: contactName.trim() } : {}),
      ...(contactEmail.trim() ? { contactEmail: contactEmail.trim() } : {}),
      ...(location ? { location } : {}),
    };
    try {
      if (isNew) {
        await createOrg(req);
      } else {
        await updateOrg(partyId as number, req);
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {isNew ? "New Organization" : "Edit Organization"}
        </p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      {loading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>
              Organization Name <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="e.g. Acme Corp"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Contact Name</label>
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              maxLength={50}
              placeholder="Primary contact"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="contact@example.com"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() => setShowAddr((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-heart-blue hover:underline"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {showAddr ? (
                  <line x1="5" y1="12" x2="19" y2="12" />
                ) : (
                  <>
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </>
                )}
              </svg>
              {showAddr ? "Hide address" : "Address (optional)"}
            </button>
          </div>
          {showAddr && (
            <AddressFields
              street={street}
              city={city}
              state={state}
              zipCode={zipCode}
              country={country}
              setStreet={setStreet}
              setCity={setCity}
              setState={setState}
              setZipCode={setZipCode}
              setCountry={setCountry}
            />
          )}
          {error && <p className="sm:col-span-2 text-xs text-red-500">{error}</p>}
          <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="px-4 py-2 text-sm font-medium text-white bg-heart-blue rounded-lg hover:bg-heart-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving…" : isNew ? "Create" : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
