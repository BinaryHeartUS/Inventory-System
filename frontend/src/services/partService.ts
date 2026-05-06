/**
 * Part service — CRUD for Part assets.
 *
 * Endpoints (Javalin backend):
 *   GET    /api/parts       → Part[]  (chapter filtering is enforced via JWT claims)
 *   GET    /api/parts/:id   → Part
 *   POST   /api/parts       → Part   (body: Part)
 *   PUT    /api/parts/:id   → Part   (body: Part)
 *   DELETE /api/parts/:id   → 204
 */

import { apiGet, apiPut, apiDelete, apiPostVoid } from './api'
import type { InsertPartRequest, Part } from '../types/inventory'
import { getChapters } from './chapterService'

/** Convert ISO date string (YYYY-MM-DD) to Java Date object format */
function stringToDate(dateStr: string | undefined | null) {
  if (!dateStr) return undefined
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return undefined
  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    date: date.getDate(),
    day: date.getDay(),
    time: date.getTime(),
    timezoneOffset: date.getTimezoneOffset(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds(),
  }
}

export async function getParts(): Promise<Part[]> {
  return apiGet<Part[]>('/parts')
}

/** Returns null when no part with the given ID exists. */
export async function getPart(id: number): Promise<Part | null> {
  return apiGet<Part>(`/parts/${id}`)
}

export async function createPart(part: Part): Promise<Part> {
  // return apiPost<Part>('/parts', part)
  const chapters = await getChapters()
  const chapter = chapters.find(c => c.id === part.chapterId)
  if (!chapter) throw new Error(`Unknown chapter: ${part.chapterId}`)
  const chapterId = chapter.id
  const assetId = part.id > 0 ? part.id : undefined
  
  const body: InsertPartRequest = {
    chapterId,
    id: assetId,
    type: part.type ?? undefined,
    description: part.description ?? undefined,
    wasPurchased: part.wasPurchased ?? undefined,
    containedIn: part.containedIn ?? undefined,
    acquisitionDate: stringToDate(part.acquisitionDate),
    value: part.value ?? undefined,
    donorId: part.donorId ?? undefined
  }
  await apiPostVoid('/parts', body)

  if (assetId !== undefined) {
    return apiGet<Part>(`/parts/${assetId}`)
  }
  // Auto-generated: re-fetch device list and find the most recently added match
  const parts = await apiGet<Part[]>('/parts')
  const match = parts
    .filter(p => p.chapterId === part.chapterId && p.description === part.description)
    .at(-1)
  if (!match) throw new Error('Created part not found after insert')
  return match
}

export async function updatePart(id: number, updates: Part): Promise<Part> {
  return apiPut<Part>(`/parts/${id}`, updates)
}

export async function deletePart(id: number): Promise<void> {
  return apiDelete(`/parts/${id}`)
}

export async function getPartsByDevice(deviceId: number): Promise<Part[]> {
  return apiGet<Part[]>(`/parts/device/${deviceId}`)
}
