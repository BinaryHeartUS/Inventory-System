import type { DeviceStatus } from "../../types/inventory";

export const DEVICE_TYPES = ["All", "Desktop", "Laptop", "Tablet"] as const;
export type DeviceTypeFilter = (typeof DEVICE_TYPES)[number];

export const DEVICE_SORT_KEYS = [
  "id",
  "type",
  "manufacturer",
  "model",
  "year",
  "cpu",
  "operatingSystem",
  "ram",
  "storage",
  "status",
  "chapter",
  "acquisitionDate",
] as const;

export const DEVICE_STATUS_OPTIONS: DeviceStatus[] = [
  "Not Started",
  "In Progress",
  "Ready To Donate",
  "Donated",
  "Sold",
  "Scrapped",
];

export const DEFAULT_DEVICE_STATUSES: DeviceStatus[] = [
  "Not Started",
  "In Progress",
  "Ready To Donate",
];
