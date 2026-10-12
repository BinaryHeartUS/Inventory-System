import type { LookupData } from "../hooks/useLookups";
import type { AnyDevice, Misc, Part, PartySummary, Tool } from "../types/inventory";

export const lookups: LookupData = {
  chapters: ["Central", "West"],
  manufacturers: ["Dell", "Lenovo"],
  ramGenerations: ["DDR4", "DDR5"],
  storageTypes: ["SSD", "HDD"],
  partTypes: ["RAM", "Charger"],
  operatingSystems: ["Windows", "Linux"],
  deviceStatuses: [
    "Not Started",
    "In Progress",
    "Ready To Donate",
    "Donated",
    "Sold",
    "Scrapped",
    "Unknown",
  ],
  chargerStatuses: ["Included", "Not Included", "Unknown"],
  workingBatteryOpts: ["Yes", "No", "Unknown"],
  wifiOpts: ["Yes", "No", "Unknown"],
};
export const person: PartySummary = { id: 1, name: "Alex Morgan", type: "Person" };
export const organization: PartySummary = { id: 2, name: "Community Center", type: "Organization" };
export const device: AnyDevice = {
  id: 42,
  type: "Laptop",
  manufacturer: "Lenovo",
  model: "ThinkPad",
  year: 2022,
  chapter: "Central",
  status: "In Progress",
  ram: 16,
  storage: 256,
  value: 250,
  deviceStuck: false,
  serialNumber: "ABC123",
  cpu: "Core i5",
  ramGeneration: "DDR4",
  storageType: "SSD",
  operatingSystem: "Linux",
  acquisitionDate: "2026-01-15",
  includesCharger: "Included",
  designBatteryCapacity: 50,
  actualBatteryCapacity: 45,
  batteryHealth: 0.9,
};
export const part: Part = {
  id: 43,
  type: "RAM",
  description: "DDR4 8GB",
  chapterId: 1,
  containedIn: null,
  acquisitionDate: "2026-01-15",
  value: 20,
  donorId: null,
  wasPurchased: true,
};
export const tool: Tool = {
  id: 44,
  description: "Precision screwdriver",
  chapterId: 1,
  acquisitionDate: "2026-01-15",
  value: 10,
  donorId: null,
};
export const misc: Misc = {
  id: 45,
  description: "Network cables",
  acquisitionDate: "2026-01-15",
  value: 100,
  donorId: 1,
};
