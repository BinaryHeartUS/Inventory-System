import type { ChargerStatus, DeviceStatus, WorkingBattery } from "../../types/inventory";

export type AssetCategory = "Device" | "Part" | "Tool" | "Misc";
export type DeviceSubtype = "Desktop" | "Laptop" | "Tablet";

export interface BulkDeviceFormState {
  count: string;
  type: DeviceSubtype;
  manufacturer: string | null;
  model: string;
  year: string;
  chapter: string;
  acquisitionDate: string;
}

function localDateString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export const DEFAULT_BULK_FORM: BulkDeviceFormState = {
  count: "",
  type: "Desktop",
  manufacturer: null,
  model: "",
  year: String(new Date().getFullYear()),
  chapter: "",
  acquisitionDate: localDateString(),
};

// ─── Form state ───────────────────────────────────────────────────────────────
export interface FormState {
  // Shared
  chapter: string;
  acquisitionDate: string;
  // Device (BaseDevice)
  manufacturer: string | null;
  model: string;
  serialNumber: string;
  year: string;
  cpu: string;
  ram: string;
  ramGeneration: string | null;
  storage: string;
  storageType: string | null;
  operatingSystem: string | null;
  status: DeviceStatus;
  // Desktop
  hasWifi: "Yes" | "No" | "Unknown";
  // Laptop
  includesCharger: ChargerStatus;
  designBatteryCapacity: string;
  actualBatteryCapacity: string;
  // Tablet
  workingBattery: WorkingBattery;
  // Part
  partType: string | null; // FCombo — maps to Part_Type.Name
  description: string;
  wasPurchased: boolean;
  containedIn: string;
  // Tool
  toolDescription: string;
  // Shared optional
  value: string; // optional monetary value (Asset.Value)
}

export const DEFAULT_FORM: FormState = {
  chapter: "",
  acquisitionDate: "",
  manufacturer: null,
  model: "",
  serialNumber: "",
  year: String(new Date().getFullYear()),
  cpu: "",
  ram: "",
  ramGeneration: null,
  storage: "",
  storageType: null,
  operatingSystem: null,
  status: "Not Started",
  hasWifi: "Unknown",
  includesCharger: "Unknown",
  designBatteryCapacity: "",
  actualBatteryCapacity: "",
  workingBattery: "Unknown",
  partType: null,
  description: "",
  wasPurchased: false,
  containedIn: "",
  toolDescription: "",
  value: "",
};
