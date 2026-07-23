/**
 * LookupEditorContainer — data + persistence for one lookup list section.
 *
 * Loads the section's current values via lookupService on mount and applies
 * add/remove optimistically against the injected section.add / section.remove
 * mutators, reverting on failure.
 */

import { useState, useEffect } from "react";
import { getAllLookups } from "../services/lookupService";
import { LookupEditor } from "../components/LookupEditor";
import type { LookupSection } from "../components/LookupEditor";

export function LookupEditorContainer({ section }: { section: LookupSection }) {
  const [values, setValues] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllLookups()
      .then((data) => setValues(data[section.key] ?? []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [section.key]);

  async function handleAdd(trimmed: string) {
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

  async function handleRemove(value: string) {
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
    <LookupEditor
      title={section.title}
      description={section.description}
      values={values}
      loaded={loaded}
      error={error}
      busy={loading}
      onAdd={handleAdd}
      onRemove={handleRemove}
    />
  );
}
