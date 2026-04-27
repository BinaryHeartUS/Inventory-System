/**
 * Lookup service — canonical option lists for all dropdown/combo fields.
 *
 * Endpoints (Javalin backend):
 *   GET /api/lookup/manufacturers     → string[]
 *   GET /api/lookup/ram-generations   → string[]
 *   GET /api/lookup/storage-types     → string[]
 *   GET /api/lookup/part-types        → string[]
 *   GET /api/lookup/tool-types        → string[]
 *   GET /api/lookup/device-statuses   → DeviceStatus[]
 *   GET /api/lookup/charger-statuses  → ChargerStatus[]
 *   GET /api/lookup/working-batteries → WorkingBattery[]
 *
 * Chapter lookups are handled by chapterService / ChapterContext.
 */

import { apiGet } from './api'
import type { ChargerStatus, DeviceStatus, WorkingBattery } from '../types/inventory'
import {
  DEVICE_STATUSES, CHARGER_STATUSES, WORKING_BATTERY_OPTS,
  MANUFACTURER_OPTS, RAM_GEN_OPTS, STORAGE_TYPE_OPTS,
  PART_TYPE_OPTS, TOOL_TYPE_OPTS,
} from '../data/lookups'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

/** Fixed PostgreSQL Status enum values — unlikely to change without a schema migration. */
export async function getDeviceStatuses(): Promise<DeviceStatus[]> {
  if (!USE_MOCK) return apiGet<DeviceStatus[]>('/lookup/device-statuses')
  return Promise.resolve([...DEVICE_STATUSES])
}

/** Fixed PostgreSQL Charger_Status enum values. */
export async function getChargerStatuses(): Promise<ChargerStatus[]> {
  if (!USE_MOCK) return apiGet<ChargerStatus[]>('/lookup/charger-statuses')
  return Promise.resolve([...CHARGER_STATUSES])
}

/** Fixed PostgreSQL Working_Battery enum values. */
export async function getWorkingBatteryOpts(): Promise<WorkingBattery[]> {
  if (!USE_MOCK) return apiGet<WorkingBattery[]>('/lookup/working-batteries')
  return Promise.resolve([...WORKING_BATTERY_OPTS])
}

/** Rows from the Manufacturer lookup table. */
export async function getManufacturers(): Promise<string[]> {
  if (!USE_MOCK) return apiGet<string[]>('/lookup/manufacturers')
  return Promise.resolve([...MANUFACTURER_OPTS])
}

/** Rows from the Ram_Generation lookup table. */
export async function getRamGenerations(): Promise<string[]> {
  if (!USE_MOCK) return apiGet<string[]>('/lookup/ram-generations')
  return Promise.resolve([...RAM_GEN_OPTS])
}

/** Rows from the Storage_Type lookup table. */
export async function getStorageTypes(): Promise<string[]> {
  if (!USE_MOCK) return apiGet<string[]>('/lookup/storage-types')
  return Promise.resolve([...STORAGE_TYPE_OPTS])
}

/** Rows from the Part_Type lookup table. */
export async function getPartTypes(): Promise<string[]> {
  if (!USE_MOCK) return apiGet<string[]>('/lookup/part-types')
  return Promise.resolve([...PART_TYPE_OPTS])
}

/** Tool type values (stored as VARCHAR(20) on Tool; treated as a lookup). */
export async function getToolTypes(): Promise<string[]> {
  if (!USE_MOCK) return apiGet<string[]>('/lookup/tool-types')
  return Promise.resolve([...TOOL_TYPE_OPTS])
}
