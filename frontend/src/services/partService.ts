/**
 * Part service — CRUD for Part assets.
 *
 * Endpoints (Javalin backend):
 *   GET    /api/parts        → Part[]
 *   GET    /api/parts/:id    → Part
 *   POST   /api/parts        → Part   (body: Part)
 *   PUT    /api/parts/:id    → Part   (body: Part)
 *   DELETE /api/parts/:id    → 204
 */

// import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Part } from '../types/inventory'
import { ALL_PARTS } from '../data/mockData'

export async function getParts(): Promise<Part[]> {
  // return apiGet<Part[]>('/parts')
  return Promise.resolve([...ALL_PARTS])
}

/** Returns null when no part with the given ID exists. */
export async function getPart(id: number): Promise<Part | null> {
  // return apiGet<Part>(`/parts/${id}`)
  return Promise.resolve(ALL_PARTS.find(p => p.id === id) ?? null)
}

export async function createPart(part: Part): Promise<Part> {
  // return apiPost<Part>('/parts', part)
  ALL_PARTS.push(part)
  return Promise.resolve(part)
}

export async function updatePart(id: number, updates: Part): Promise<Part> {
  // return apiPut<Part>(`/parts/${id}`, updates)
  const idx = ALL_PARTS.findIndex(p => p.id === id)
  if (idx !== -1) ALL_PARTS[idx] = updates
  return Promise.resolve(updates)
}

export async function deletePart(id: number): Promise<void> {
  // return apiDelete(`/parts/${id}`)
  const idx = ALL_PARTS.findIndex(p => p.id === id)
  if (idx !== -1) ALL_PARTS.splice(idx, 1)
}
