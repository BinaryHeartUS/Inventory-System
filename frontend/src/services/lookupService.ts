/**
 * Lookup service — canonical option lists for all dropdown/combo fields.
 *
 * Endpoint:
 *   GET /api/lookup → LookupResponse (all option lists in one request)
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

interface LookupResponse {
  deviceStatuses: DeviceStatus[]
  chargerStatuses: ChargerStatus[]
  workingBatteryOpts: WorkingBattery[]
  manufacturers: string[]
  ramGenerations: string[]
  storageTypes: string[]
  partTypes: string[]
  toolTypes: string[]
}

export async function getAllLookups(): Promise<LookupResponse> {
  if (!USE_MOCK) return apiGet<LookupResponse>('/lookup')
  return Promise.resolve({
    deviceStatuses: [...DEVICE_STATUSES],
    chargerStatuses: [...CHARGER_STATUSES],
    workingBatteryOpts: [...WORKING_BATTERY_OPTS],
    manufacturers: [...MANUFACTURER_OPTS],
    ramGenerations: [...RAM_GEN_OPTS],
    storageTypes: [...STORAGE_TYPE_OPTS],
    partTypes: [...PART_TYPE_OPTS],
    toolTypes: [...TOOL_TYPE_OPTS],
  })
}
