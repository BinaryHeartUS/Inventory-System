/**
 * Device service — CRUD for Desktop, Laptop, and Tablet assets.
 *
 * Endpoints (Javalin backend):
 *   GET    /api/devices        → AnyDevice[]  (chapter filtering is enforced via JWT claims)
 *   GET    /api/devices/:id    → AnyDevice
 *   POST   /api/devices        → AnyDevice   (body: AnyDevice)
 *   PUT    /api/devices/:id    → AnyDevice   (body: AnyDevice)
 *   DELETE /api/devices/:id    → 204
 */

import { apiGet, apiGetOrNull, apiPostVoid, apiPutVoid, apiDelete } from './api'
import type {
  AnyDevice,
  InsertDesktopRequest,
  InsertLaptopRequest,
  InsertTabletRequest,
  AvgTimeInInventoryResponse,
  CompletionRateResponse,
  ChapterActivityStatsResponse,
  DashboardCountsResponse,
  MonthlyCountPoint,
  MonthlyValuePoint,
} from '../types/inventory'
import type { DeviceChangelogEntry } from '../types/changelog'
import type { DeviceChangelogResponse } from "../types/inventory"
import { getChapters } from './chapterService'

export async function getDevices(): Promise<AnyDevice[]> {
  return apiGet<AnyDevice[]>('/devices')
}

/** Returns null when no device with the given ID exists. */
export async function getDevice(id: number): Promise<AnyDevice | null> {
  return apiGetOrNull<AnyDevice>(`/devices/${id}`)
}

export async function createDevice(device: AnyDevice): Promise<AnyDevice> {
  const chapters = await getChapters()
  const chapter = chapters.find(c => c.name === device.chapter)
  if (!chapter) throw new Error(`Unknown chapter: ${device.chapter}`)

  const chapterId = chapter.id
  const assetId = device.id > 0 ? device.id : undefined
  const common = {
    chapterId,
    assetId,
    manufacturer: device.manufacturer,
    model: device.model,
    year: device.year,
    status: device.status,
    cpu: device.cpu ?? undefined,
    ram: device.ram || undefined,
    ramGeneration: device.ramGeneration ?? undefined,
    storageAmount: device.storage || undefined,
    storageType: device.storageType ?? undefined,
    value: device.value ?? undefined,
    acquisitionDate: device.acquisitionDate ?? undefined,
    operatingSystem: device.operatingSystem ?? undefined,
  }

  if (device.type === 'Desktop') {
    const body: InsertDesktopRequest = {
      ...common,
      hasWifi: device.hasWifi ?? undefined,
    }
    await apiPostVoid('/devices/desktop', body)
  } else if (device.type === 'Laptop') {
    const body: InsertLaptopRequest = {
      ...common,
      includesCharger: device.includesCharger ?? undefined,
      designBatteryCapacity: device.designBatteryCapacity ?? undefined,
      actualBatteryCapacity: device.actualBatteryCapacity ?? undefined,
    }
    await apiPostVoid('/devices/laptop', body)
  } else if (device.type === 'Tablet') {
    const body: InsertTabletRequest = {
      ...common,
      includesCharger: device.includesCharger ?? undefined,
      workingBattery: device.workingBattery ?? undefined,
    }
    await apiPostVoid('/devices/tablet', body)
  } else {
    throw new TypeError('Unrecognized device type')
  }

  // Backend returns 201 with no body; fetch the created device by its ID.
  // If assetId was pre-assigned, use it; otherwise search for the newest matching record.
  if (assetId !== undefined) {
    return apiGet<AnyDevice>(`/devices/${assetId}`)
  }
  // Auto-generated: re-fetch device list and find the most recently added match
  const devices = await apiGet<AnyDevice[]>('/devices')
  const match = devices
    .filter(d => d.manufacturer === device.manufacturer && d.model === device.model && d.chapter === device.chapter)
    .at(-1)
  if (!match) throw new Error('Created device not found after insert')
  return match
}

export async function updateDevice(id: number, updates: AnyDevice): Promise<AnyDevice> {
  const chapters = await getChapters()
  const chapter = chapters.find(c => c.name === updates.chapter)
  if (!chapter) throw new Error(`Unknown chapter: ${updates.chapter}`)

  const common = {
    chapterId: chapter.id,
    assetId: id,
    manufacturer: updates.manufacturer,
    model: updates.model,
    year: updates.year,
    status: updates.status,
    cpu: updates.cpu ?? undefined,
    ram: updates.ram || undefined,
    ramGeneration: updates.ramGeneration ?? undefined,
    storageAmount: updates.storage || undefined,
    storageType: updates.storageType ?? undefined,
    value: updates.value ?? undefined,
    acquisitionDate: updates.acquisitionDate ?? undefined,
    operatingSystem: updates.operatingSystem ?? undefined,
    donorId: updates.donorId ?? undefined,
    recipientId: updates.recipientId ?? undefined,
  }

  if (updates.type === 'Desktop') {
    const body: InsertDesktopRequest = { ...common, hasWifi: updates.hasWifi ?? undefined }
    await apiPutVoid(`/devices/desktop/${id}`, body)
  } else if (updates.type === 'Laptop') {
    const body: InsertLaptopRequest = {
      ...common,
      includesCharger: updates.includesCharger ?? 'Unknown',
      designBatteryCapacity: updates.designBatteryCapacity ?? undefined,
      actualBatteryCapacity: updates.actualBatteryCapacity ?? undefined,
    }
    await apiPutVoid(`/devices/laptop/${id}`, body)
  } else if (updates.type === 'Tablet') {
    const body: InsertTabletRequest = {
      ...common,
      includesCharger: updates.includesCharger ?? 'Unknown',
      workingBattery: updates.workingBattery ?? undefined,
    }
    await apiPutVoid(`/devices/tablet/${id}`, body)
  } else {
    throw new TypeError('Unrecognized device type')
  }

  return apiGet<AnyDevice>(`/devices/${id}`)
}

export async function deleteDevice(id: number): Promise<void> {
  return apiDelete(`/devices/${id}`)
}

function chaptersParam(chapterIds: number[]): string {
  return chapterIds.length > 0 ? `?chapters=${chapterIds.join(',')}` : ''
}

function chaptersAndMonthsParam(chapterIds: number[], months: number): string {
  const parts: string[] = [`months=${months}`]
  if (chapterIds.length > 0) parts.push(`chapters=${chapterIds.join(',')}`)
  return `?${parts.join('&')}`
}

export async function getDashboardCounts(chapterIds: number[]): Promise<DashboardCountsResponse> {
  const params = chapterIds.length > 0 ? `?chapters=${chapterIds.join(',')}` : ''
  return apiGet<DashboardCountsResponse>(`/devices/stats/counts${params}`)
}

export async function getDeviceCount(
  type: 'desktop' | 'laptop' | 'tablet' | 'total',
  status: 'active' | 'not-started' | 'in-progress' | 'ready-to-donate' | 'donated',
  chapterIds: number[],
): Promise<number> {
  return apiGet<number>(`/devices/stats/count/${type}?status=${status}${chapterIds.length > 0 ? `&chapters=${chapterIds.join(',')}` : ''}`)
}

export async function getAvgTimeInInventory(chapterIds: number[]): Promise<AvgTimeInInventoryResponse> {
  return apiGet<AvgTimeInInventoryResponse>(`/devices/stats/avg-time${chaptersParam(chapterIds)}`)
}

export async function getCompletionRate(chapterIds: number[]): Promise<CompletionRateResponse> {
  return apiGet<CompletionRateResponse>(`/devices/stats/completion-rate${chaptersParam(chapterIds)}`)
}

export async function getChapterActivityStats(): Promise<ChapterActivityStatsResponse> {
  return apiGet<ChapterActivityStatsResponse>('/devices/stats/chapter-activity')
}

export async function getDevicesReceived(
  chapterIds: number[],
  months = 12,
): Promise<MonthlyCountPoint[]> {
  return apiGet<MonthlyCountPoint[]>(`/devices/stats/devices-received${chaptersAndMonthsParam(chapterIds, months)}`)
}

export async function getDevicesDonated(
  chapterIds: number[],
  months = 12,
): Promise<MonthlyCountPoint[]> {
  return apiGet<MonthlyCountPoint[]>(`/devices/stats/devices-donated${chaptersAndMonthsParam(chapterIds, months)}`)
}

export async function getDonatedDeviceValue(
  chapterIds: number[],
  months = 12,
): Promise<MonthlyValuePoint[]> {
  return apiGet<MonthlyValuePoint[]>(`/devices/stats/donated-value${chaptersAndMonthsParam(chapterIds, months)}`)
}

export async function getDeviceChangelog(id: number): Promise<DeviceChangelogEntry[]> {
  const raw = await apiGet<DeviceChangelogResponse[]>(`/devices/${id}/changelog`)
  return raw.map(e => ({ ...e, assetId: e.deviceID ?? 0 }))
}

