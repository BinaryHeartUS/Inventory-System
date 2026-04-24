/**
 * Device service — CRUD for Desktop, Laptop, and Tablet assets.
 *
 * Endpoints (Javalin backend):
 *   GET    /api/devices        → AnyDevice[]
 *   GET    /api/devices/:id    → AnyDevice
 *   POST   /api/devices        → AnyDevice   (body: AnyDevice)
 *   PUT    /api/devices/:id    → AnyDevice   (body: AnyDevice)
 *   DELETE /api/devices/:id    → 204
 */

// import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { AnyDevice } from '../types/inventory'
import { ALL_DEVICES } from '../data/mockData'

export async function getDevices(): Promise<AnyDevice[]> {
  // return apiGet<AnyDevice[]>('/devices')
  return Promise.resolve([...ALL_DEVICES])
}

/** Returns null when no device with the given ID exists. */
export async function getDevice(id: number): Promise<AnyDevice | null> {
  // return apiGet<AnyDevice>(`/devices/${id}`)
  return Promise.resolve(ALL_DEVICES.find(d => d.id === id) ?? null)
}

export async function createDevice(device: AnyDevice): Promise<AnyDevice> {
  // return apiPost<AnyDevice>('/devices', device)
  ALL_DEVICES.push(device)
  return Promise.resolve(device)
}

export async function updateDevice(id: number, updates: AnyDevice): Promise<AnyDevice> {
  // return apiPut<AnyDevice>(`/devices/${id}`, updates)
  const idx = ALL_DEVICES.findIndex(d => d.id === id)
  if (idx !== -1) ALL_DEVICES[idx] = updates
  return Promise.resolve(updates)
}

export async function deleteDevice(id: number): Promise<void> {
  // return apiDelete(`/devices/${id}`)
  const idx = ALL_DEVICES.findIndex(d => d.id === id)
  if (idx !== -1) ALL_DEVICES.splice(idx, 1)
}
