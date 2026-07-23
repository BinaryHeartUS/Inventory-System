import type { ChargerStatus, DeviceStatus, WorkingBattery } from "../../types/inventory";

export type AssetCategory = "Device" | "Part" | "Tool";
export type DeviceSubtype = "Desktop" | "Laptop" | "Tablet";

// ─── Form state ───────────────────────────────────────────────────────────────
export interface FormState {
  // Shared
  chapter: string;
  acquisitionDate: string;
  // Device (BaseDevice)
  manufacturer: string | null;
  model: string;
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
