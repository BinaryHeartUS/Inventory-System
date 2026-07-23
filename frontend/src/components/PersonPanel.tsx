import { useState } from "react";
import { formatLocation } from "../types/inventory";
import { inputCls, labelCls } from "../utils/formStyles";
import { AddressFields } from "./AddressFields";

/** Form values fed to PersonPanel; assembled by PersonPanelContainer. */
export interface PersonFormData {
  name: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  hasLocation: boolean;
}

/** Persisted shape produced by the form. */
export interface PersonSaveRequest {
  name: string;
  email?: string;
  location?: string;
}

/**
 * Presentational editor for a single individual (person) party. Owns only local
 * form/view-state seeded from the injected `initial` values; loading and
 * persistence live in PersonPanelContainer.
 */
export function PersonPanel({
  isNew,
  loading,
  initial,
  onClose,
  onSave,
}: {
  isNew: boolean;
  loading: boolean;
  initial: PersonFormData;
  onClose: () => void;
  onSave: (req: PersonSaveRequest) => Promise<void>;
}) {
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [street, setStreet] = useState(initial.street);
  const [city, setCity] = useState(initial.city);
  const [state, setState] = useState(initial.state);
  const [zipCode, setZipCode] = useState(initial.zipCode);
  const [country, setCountry] = useState(initial.country);
  const [showAddr, setShowAddr] = useState(initial.hasLocation);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    const location =
      street || city || state || zipCode || country
        ? formatLocation({ street, city, state, zipCode, country })
        : undefined;
    const req: PersonSaveRequest = {
      name: name.trim(),
      ...(email.trim() ? { email: email.trim() } : {}),
      ...(location ? { location } : {}),
    };
    try {
      await onSave(req);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
      setSaving(false);
    }
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {isNew ? "New Individual" : "Edit Individual"}
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
              Name <span className="text-red-400">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="Full name"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
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
