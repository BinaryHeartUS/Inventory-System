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

import { apiGet, apiPostVoid, apiPut, apiDelete } from './api'
import type { AnyDevice, InsertDesktopRequest, InsertLaptopRequest, InsertTabletRequest } from '../types/inventory'
import { ALL_DEVICES, CHAPTER_ID_MAP } from '../data/mockData'
import { getStoredAuth } from './authService'
import { getChapters } from './chapterService'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export async function getDevices(): Promise<AnyDevice[]> {
  if (!USE_MOCK) return apiGet<AnyDevice[]>('/devices')
  const auth = getStoredAuth()
  if (auth && auth.chapterIds.length > 0) {
    const names = new Set<string>(auth.chapterIds.map(id => CHAPTER_ID_MAP[id]).filter(Boolean))
    return Promise.resolve(ALL_DEVICES.filter(d => names.has(d.chapter ?? '')))
  }
  return Promise.resolve([...ALL_DEVICES])
}

/** Returns null when no device with the given ID exists. */
export async function getDevice(id: number): Promise<AnyDevice | null> {
  if (!USE_MOCK) return apiGet<AnyDevice>(`/devices/${id}`)
  return Promise.resolve(ALL_DEVICES.find(d => d.id === id) ?? null)
}

export async function createDevice(device: AnyDevice): Promise<AnyDevice> {
  if (USE_MOCK) {
    ALL_DEVICES.push(device)
    return Promise.resolve(device)
  }

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
    ram: device.ram,
    ramGeneration: device.ramGeneration ?? undefined,
    storageAmount: device.storage,
    storageType: device.storageType ?? undefined,
    value: device.value ?? undefined,
    acquisitionDate: device.acquisitionDate ?? undefined,
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
  if (!USE_MOCK) return apiPut<AnyDevice>(`/devices/${id}`, updates)
  const idx = ALL_DEVICES.findIndex(d => d.id === id)
  if (idx !== -1) ALL_DEVICES[idx] = updates
  return Promise.resolve(updates)
}

export async function deleteDevice(id: number): Promise<void> {
  if (!USE_MOCK) return apiDelete(`/devices/${id}`)
  const idx = ALL_DEVICES.findIndex(d => d.id === id)
  if (idx !== -1) ALL_DEVICES.splice(idx, 1)
}
