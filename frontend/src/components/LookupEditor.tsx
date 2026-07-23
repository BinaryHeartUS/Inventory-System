import { useState, useEffect } from "react";
import { getAllLookups } from "../services/lookupService";

export interface LookupSection {
  title: string;
  description: string;
  key: "manufacturers" | "ramGenerations" | "storageTypes" | "partTypes" | "operatingSystems";
  add: (name: string) => Promise<void>;
  remove: (name: string) => Promise<void>;
}

export function LookupEditor({ section }: { section: LookupSection }) {
  const [values, setValues] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllLookups()
      .then((data) => setValues(data[section.key] ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [section.key]);

  async function add() {
    const trimmed = input.trim();
    if (!trimmed || values.map((v) => v.toLowerCase()).includes(trimmed.toLowerCase())) return;
    setInput("");
    setError(null);
    setLoading(true);
    const prev = values;
    setValues((v) => [...v, trimmed]);
    try {
      await section.add(trimmed);
    } catch {
      setValues(prev);
      setError(`Failed to add "${trimmed}". Please try again.`);
    } finally {
      setLoading(false);
    }
  }

  async function remove(value: string) {
    setError(null);
    const prev = values;
    setValues((v) => v.filter((x) => x !== value));
    try {
      await section.remove(value);
    } catch (err) {
      setValues(prev);
      setError(err instanceof Error ? err.message : `Failed to remove "${value}".`);
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-slate-800">{section.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">{section.description}</p>
      </div>

      {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

      {/* Current values */}
      <div className="flex flex-wrap gap-2 mb-4 min-h-[2rem]">
        {!loaded ? (
          <span className="text-xs text-slate-300 italic">Loading options…</span>
        ) : (
          <>
            {values.map((v) => (
              <span
                key={v}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium"
              >
                {v}
                <button
                  onClick={() => remove(v)}
                  className="text-slate-400 hover:text-red-500 transition-colors leading-none"
                  aria-label={`Remove ${v}`}
                >
                  <svg
                    width="10"
                    height="10"
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
              </span>
            ))}
            {values.length === 0 && (
              <span className="text-xs text-slate-300 italic">No values — add one below</span>
            )}
          </>
        )}
      </div>

      {/* Add input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={`Add a ${section.title.toLowerCase().replace(/s$/, "")}…`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-heart-blue focus:border-heart-blue transition-all"
        />
        <button
          onClick={add}
          disabled={!input.trim() || loading}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-heart-blue text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Add
        </button>
      </div>
    </div>
  );
}
