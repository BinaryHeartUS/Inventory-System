/**
 * Lookup service — canonical option lists for all dropdown/combo fields.
 *
 * Each function comments out the real API call and returns mock data instead.
 * To enable the real backend, uncomment the apiGet line and remove the
 * Promise.resolve fallback.
 *
 * Endpoints (Javalin backend):
 *   GET /api/lookup/chapters          → string[]
 *   GET /api/lookup/manufacturers     → string[]   (Manufacturer table)
 *   GET /api/lookup/ram-generations   → string[]   (Ram_Generation table)
 *   GET /api/lookup/storage-types     → string[]   (Storage_Type table)
 *   GET /api/lookup/part-types        → string[]   (Part_Type table)
 *   GET /api/lookup/tool-types        → string[]   (Tool_Type — VARCHAR stored on Tool)
 *   GET /api/lookup/device-statuses   → DeviceStatus[]  (Status enum)
 *   GET /api/lookup/charger-statuses  → ChargerStatus[] (Charger_Status enum)
 *   GET /api/lookup/working-batteries → WorkingBattery[] (Working_Battery enum)
 */

// import { apiGet } from './api'
import type { ChargerStatus, DeviceStatus, WorkingBattery } from '../types/inventory'
import { CHAPTERS as MOCK_CHAPTERS } from '../data/mockData'
import {
  DEVICE_STATUSES, CHARGER_STATUSES, WORKING_BATTERY_OPTS,
  MANUFACTURER_OPTS, RAM_GEN_OPTS, STORAGE_TYPE_OPTS,
  PART_TYPE_OPTS, TOOL_TYPE_OPTS,
} from '../data/lookups'

export async function getChapters(): Promise<string[]> {
  // return apiGet<string[]>('/lookup/chapters')
  return Promise.resolve([...MOCK_CHAPTERS])
}

/** Fixed PostgreSQL Status enum values — unlikely to change without a schema migration. */
export async function getDeviceStatuses(): Promise<DeviceStatus[]> {
  // return apiGet<DeviceStatus[]>('/lookup/device-statuses')
  return Promise.resolve([...DEVICE_STATUSES])
}

/** Fixed PostgreSQL Charger_Status enum values. */
export async function getChargerStatuses(): Promise<ChargerStatus[]> {
  // return apiGet<ChargerStatus[]>('/lookup/charger-statuses')
  return Promise.resolve([...CHARGER_STATUSES])
}

/** Fixed PostgreSQL Working_Battery enum values. */
export async function getWorkingBatteryOpts(): Promise<WorkingBattery[]> {
  // return apiGet<WorkingBattery[]>('/lookup/working-batteries')
  return Promise.resolve([...WORKING_BATTERY_OPTS])
}

/** Rows from the Manufacturer lookup table. */
export async function getManufacturers(): Promise<string[]> {
  // return apiGet<string[]>('/lookup/manufacturers')
  return Promise.resolve([...MANUFACTURER_OPTS])
}

/** Rows from the Ram_Generation lookup table. */
export async function getRamGenerations(): Promise<string[]> {
  // return apiGet<string[]>('/lookup/ram-generations')
  return Promise.resolve([...RAM_GEN_OPTS])
}

/** Rows from the Storage_Type lookup table. */
export async function getStorageTypes(): Promise<string[]> {
  // return apiGet<string[]>('/lookup/storage-types')
  return Promise.resolve([...STORAGE_TYPE_OPTS])
}

/** Rows from the Part_Type lookup table. */
export async function getPartTypes(): Promise<string[]> {
  // return apiGet<string[]>('/lookup/part-types')
  return Promise.resolve([...PART_TYPE_OPTS])
}

/** Tool type values (stored as VARCHAR(20) on Tool; treated as a lookup). */
export async function getToolTypes(): Promise<string[]> {
  // return apiGet<string[]>('/lookup/tool-types')
  return Promise.resolve([...TOOL_TYPE_OPTS])
}
