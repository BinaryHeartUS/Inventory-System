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

import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { AnyDevice } from '../types/inventory'
import { ALL_DEVICES, CHAPTER_ID_MAP } from '../data/mockData'
import { getStoredAuth } from './authService'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export async function getDevices(): Promise<AnyDevice[]> {
  if (!USE_MOCK) return apiGet<AnyDevice[]>('/devices')
  const auth = getStoredAuth()
  if (auth && auth.chapterIds.length > 0) {
    const names = new Set<string>(auth.chapterIds.map(id => CHAPTER_ID_MAP[id]).filter(Boolean))
    return Promise.resolve(ALL_DEVICES.filter(d => names.has(d.chapter)))
  }
  return Promise.resolve([...ALL_DEVICES])
}

/** Returns null when no device with the given ID exists. */
export async function getDevice(id: number): Promise<AnyDevice | null> {
  if (!USE_MOCK) return apiGet<AnyDevice>(`/devices/${id}`)
  return Promise.resolve(ALL_DEVICES.find(d => d.id === id) ?? null)
}

export async function createDevice(device: AnyDevice): Promise<AnyDevice> {
  if (device.type === 'Desktop') {
    return apiPost<AnyDevice>('/devices/desktop', device)
  }
  if (device.type === 'Laptop') {
    return apiPost<AnyDevice>('/devices/laptop', device)
  }
  if (device.type === 'Tablet') {
    return apiPost<AnyDevice>('/devices/tablet', device)
  }
  throw new TypeError('Unrecognized device type')
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
