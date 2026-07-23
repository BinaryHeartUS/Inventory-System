import {
  addManufacturer,
  deleteManufacturer,
  addRamGeneration,
  deleteRamGeneration,
  addStorageType,
  deleteStorageType,
  addPartType,
  deletePartType,
  addOperatingSystem,
  deleteOperatingSystem,
} from "../services/lookupService";
import PageHeading from "../components/PageHeading";
import { LookupEditor, type LookupSection } from "../components/LookupEditor";

// ─── Lookup section config ────────────────────────────────────────────────────

const LOOKUP_SECTIONS: LookupSection[] = [
  {
    title: "Manufacturers",
    description: "Device manufacturer names used across desktops, laptops, and tablets.",
    key: "manufacturers",
    add: addManufacturer,
    remove: deleteManufacturer,
  },
  {
    title: "RAM Generations",
    description: "RAM type options (e.g. DDR4, LPDDR5) available when logging device specs.",
    key: "ramGenerations",
    add: addRamGeneration,
    remove: deleteRamGeneration,
  },
  {
    title: "Storage Types",
    description: "Storage media types (e.g. SSD, HDD, NVMe) used in device specs.",
    key: "storageTypes",
    add: addStorageType,
    remove: deleteStorageType,
  },
  {
    title: "Part Types",
    description: "Part category names used when logging spare parts.",
    key: "partTypes",
    add: addPartType,
    remove: deletePartType,
  },
  {
    title: "Operating Systems",
    description:
      "Operating system options (e.g. Windows 11, Ubuntu) available when logging devices.",
    key: "operatingSystems",
    add: addOperatingSystem,
    remove: deleteOperatingSystem,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Settings() {
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
        {LOOKUP_SECTIONS.map((section) => (
          <LookupEditor key={section.title} section={section} />
        ))}
      </section>
    </div>
  );
}
