import type { DeviceStatus } from "../../types/inventory";
import {
  DEFAULT_DEVICE_STATUSES,
  DEVICE_SORT_KEYS,
  DEVICE_STATUS_OPTIONS,
  DEVICE_TYPES,
  type DeviceType,
} from "./deviceFilters";

type DeviceFilterSortKey = (typeof DEVICE_SORT_KEYS)[number];

export const DEVICE_FILTER_STORAGE_KEY = "bh_device_filters";
export const DEVICE_FILTER_EXPIRY_MS = 6 * 60 * 60 * 1000;

export interface DeviceFilters {
  search: string;
  types: DeviceType[];
  statuses: DeviceStatus[];
  operatingSystems: string[] | null;
  chapter: number | "All";
  stuckOnly: boolean;
  sort: DeviceFilterSortKey;
  dir: "asc" | "desc";
}

type DeviceFilterStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

interface StoredDeviceFilters {
  version: 1;
  updatedAt: number;
  filters: DeviceFilters;
}

export function createDeviceFilters(overrides: Partial<DeviceFilters> = {}): DeviceFilters {
  return {
    search: "",
    types: [...DEVICE_TYPES],
    statuses: [...DEFAULT_DEVICE_STATUSES],
    operatingSystems: null,
    chapter: "All",
    stuckOnly: false,
    sort: "id",
    dir: "asc",
    ...overrides,
  };
}

function normalizeFilters(value: unknown): DeviceFilters | null {
  if (!value || typeof value !== "object") return null;
  const filters = value as Partial<DeviceFilters>;
  const types = Array.isArray(filters.types)
    ? DEVICE_TYPES.filter((type) => filters.types?.includes(type))
    : [];
  const statuses = Array.isArray(filters.statuses)
    ? DEVICE_STATUS_OPTIONS.filter((status) => filters.statuses?.includes(status))
    : [];
  const operatingSystems =
    filters.operatingSystems === null
      ? null
      : Array.isArray(filters.operatingSystems) &&
          filters.operatingSystems.every((operatingSystem) => typeof operatingSystem === "string")
        ? filters.operatingSystems
        : null;

  return createDeviceFilters({
    search: typeof filters.search === "string" ? filters.search : "",
    types: types.length > 0 ? types : [...DEVICE_TYPES],
    statuses: statuses.length > 0 ? statuses : [...DEFAULT_DEVICE_STATUSES],
    operatingSystems,
    chapter:
      filters.chapter === "All" ||
      (typeof filters.chapter === "number" &&
        Number.isInteger(filters.chapter) &&
        filters.chapter > 0)
        ? filters.chapter
        : "All",
    stuckOnly: filters.stuckOnly === true,
    sort: DEVICE_SORT_KEYS.includes(filters.sort as DeviceFilterSortKey)
      ? (filters.sort as DeviceFilterSortKey)
      : "id",
    dir: filters.dir === "desc" ? "desc" : "asc",
  });
}

export function loadDeviceFilters(
  storage: DeviceFilterStorage = sessionStorage,
  now = Date.now()
): DeviceFilters {
  try {
    const raw = storage.getItem(DEVICE_FILTER_STORAGE_KEY);
    if (!raw) return createDeviceFilters();
    const stored = JSON.parse(raw) as Partial<StoredDeviceFilters>;
    if (
      stored.version !== 1 ||
      typeof stored.updatedAt !== "number" ||
      now - stored.updatedAt >= DEVICE_FILTER_EXPIRY_MS
    ) {
      storage.removeItem(DEVICE_FILTER_STORAGE_KEY);
      return createDeviceFilters();
    }
    const filters = normalizeFilters(stored.filters);
    if (!filters) throw new Error("Invalid device filters");
    return filters;
  } catch {
    storage.removeItem(DEVICE_FILTER_STORAGE_KEY);
    return createDeviceFilters();
  }
}

export function saveDeviceFilters(
  filters: DeviceFilters,
  storage: DeviceFilterStorage = sessionStorage,
  now = Date.now()
): void {
  const stored: StoredDeviceFilters = { version: 1, updatedAt: now, filters };
  storage.setItem(DEVICE_FILTER_STORAGE_KEY, JSON.stringify(stored));
}

export function saveDeviceFilterPreset(
  preset: Partial<DeviceFilters>,
  storage: DeviceFilterStorage = sessionStorage,
  now = Date.now()
): void {
  saveDeviceFilters(createDeviceFilters(preset), storage, now);
}

export function clearDeviceFilters(storage: DeviceFilterStorage = sessionStorage): void {
  storage.removeItem(DEVICE_FILTER_STORAGE_KEY);
}
