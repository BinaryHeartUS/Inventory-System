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
import type { LookupSection } from "../components/settings/LookupEditor";
import SettingsView from "../components/settings/SettingsView";

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

export default function SettingsContainer() {
  return <SettingsView sections={LOOKUP_SECTIONS} />;
}
