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

interface LookupResponse {
  deviceStatuses: DeviceStatus[]
  chargerStatuses: ChargerStatus[]
  workingBatteryOpts: WorkingBattery[]
  manufacturers: string[]
  ramGenerations: string[]
  storageTypes: string[]
  partTypes: string[]
}

export async function getAllLookups(): Promise<LookupResponse> {
  return apiGet<LookupResponse>('/lookup')
}
