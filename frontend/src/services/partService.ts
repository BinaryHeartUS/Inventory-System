/**
 * Part service — CRUD for Part assets.
 *
 * Endpoints (Javalin backend):
 *   GET    /api/assets/parts       → Part[]  (chapter filtering is enforced via JWT claims)
 *   GET    /api/assets/parts/:id   → Part
 *   POST   /api/assets/parts       → Part   (body: Part)
 *   PUT    /api/assets/parts/:id   → Part   (body: Part)
 *   DELETE /api/assets/parts/:id   → 204
 */

import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Part } from '../types/inventory'

export async function getParts(): Promise<Part[]> {
  return apiGet<Part[]>('/assets/parts')
}

/** Returns null when no part with the given ID exists. */
export async function getPart(id: number): Promise<Part | null> {
  return apiGet<Part>(`/assets/parts/${id}`)
}

export async function createPart(part: Part): Promise<Part> {
  return apiPost<Part>('/assets/parts', part)
}

export async function updatePart(id: number, updates: Part): Promise<Part> {
  return apiPut<Part>(`/assets/parts/${id}`, updates)
}

export async function deletePart(id: number): Promise<void> {
  return apiDelete(`/assets/parts/${id}`)
}
