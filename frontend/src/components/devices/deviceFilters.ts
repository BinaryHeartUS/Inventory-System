import type { DeviceStatus } from "../../types/inventory";

export const DEVICE_TYPES = ["All", "Desktop", "Laptop", "Tablet"] as const;
export type DeviceTypeFilter = (typeof DEVICE_TYPES)[number];

export const STATUS_OPTIONS: Array<DeviceStatus | "All"> = [
  "All",
  "Not Started",
  "In Progress",
  "Ready To Donate",
  "Donated",
  "Scrapped",
];
