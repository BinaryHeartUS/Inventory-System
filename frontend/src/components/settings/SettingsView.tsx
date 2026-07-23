import PageHeading from "../PageHeading";
import { LookupEditorContainer } from "../../containers/LookupEditorContainer";
import type { LookupSection } from "../LookupEditor";

export interface SettingsViewProps {
  sections: LookupSection[];
}

/**
 * SettingsView — presentational "Manage Options" screen. Lays out the lookup
 * table sections; each section's data + persistence is owned by its
 * LookupEditorContainer.
 */
export default function SettingsView({ sections }: SettingsViewProps) {
  return (
    <div className="space-y-8">
      <PageHeading
        title="Manage Options"
        subtitle="Manage dropdown options used across the application"
      />

      {/* Lookup tables */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-semibold text-slate-800">Lookup Tables</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            These values populate dropdowns throughout the app. Stored in the database and shared
            across all chapters.
          </p>
        </div>
        {sections.map((section) => (
          <LookupEditorContainer key={section.title} section={section} />
        ))}
      </section>
    </div>
  );
}
