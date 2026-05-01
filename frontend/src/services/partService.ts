/**
 * Part service — CRUD for Part assets.
 *
 * Endpoints (Javalin backend):
 *   GET    /api/parts        → Part[]  (chapter filtering is enforced via JWT claims)
 *   GET    /api/parts/:id    → Part
 *   POST   /api/parts        → Part   (body: Part)
 *   PUT    /api/parts/:id    → Part   (body: Part)
 *   DELETE /api/parts/:id    → 204
 */

import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Part } from '../types/inventory'

export async function getParts(): Promise<Part[]> {
  return apiGet<Part[]>('/parts')
}

/** Returns null when no part with the given ID exists. */
export async function getPart(id: number): Promise<Part | null> {
  return apiGet<Part>(`/parts/${id}`)
}

export async function createPart(part: Part): Promise<Part> {
  return apiPost<Part>('/parts', part)
}

export async function updatePart(id: number, updates: Part): Promise<Part> {
  return apiPut<Part>(`/parts/${id}`, updates)
}

export async function deletePart(id: number): Promise<void> {
  return apiDelete(`/parts/${id}`)
}
