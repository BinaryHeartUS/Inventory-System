/**
 * Part service — CRUD for Part assets.
 *
 * Endpoints (Javalin backend):
 *   GET    /api/parts                  → Part[]  (chapter filtering is enforced via JWT claims)
 *   GET    /api/parts/:id              → Part
 *   GET    /api/parts/:id/changelog    → PartChangelogEntry[]
 *   POST   /api/parts                  → Part   (body: Part)
 *   PUT    /api/parts/:id              → Part   (body: Part)
 *   DELETE /api/parts/:id              → 204
 */

import { apiGet, apiGetOrNull, apiDelete, apiPost, apiPutVoid, buildQuery } from "./api";
import type { InsertPartRequest, Part, PartChangelogResponse } from "../types/inventory";
import type { PartChangelogEntry } from "../types/changelog";
import { getChapters } from "./chapterService";

export interface PartListParams {
  pageKey: number;
  pageSize: number;
  search?: string;
  type?: string;
  /** "donated" | "purchased" */
  source?: string;
  /** When false, only parts not contained in a device are returned. */
  includeInDevice?: boolean;
  /** Chapter id to restrict to (within the user's access). */
  chapter?: number;
  donorId?: number;
}

export async function getParts(params: PartListParams): Promise<Part[]> {
  return apiGet<Part[]>(`/parts${buildQuery({ ...params })}`);
}

/** Filters for the per-type count endpoint (same as the list filters, without pagination). */
export type PartTypeCountParams = Omit<PartListParams, "pageKey" | "pageSize">;

export interface PartTypeCount {
  type: string;
  count: number;
}

/** Total part count per type for the given filters, so grouped views can show accurate totals. */
export async function getPartTypeCounts(params: PartTypeCountParams): Promise<PartTypeCount[]> {
  return apiGet<PartTypeCount[]>(`/parts/type-counts${buildQuery({ ...params })}`);
}

/** Returns null when no part with the given ID exists. */
export async function getPart(id: number): Promise<Part | null> {
  return apiGetOrNull<Part>(`/parts/${id}`);
}

export async function createPart(part: Part): Promise<Part> {
  // return apiPost<Part>('/parts', part)
  const chapters = await getChapters();
  const chapter = chapters.find((c) => c.id === part.chapterId);
  if (!chapter) throw new Error(`Unknown chapter: ${part.chapterId}`);
  const chapterId = chapter.id;
  const assetId = part.id > 0 ? part.id : undefined;

  const body: InsertPartRequest = {
    chapterId,
    id: assetId,
    type: part.type ?? undefined,
    description: part.description ?? undefined,
    wasPurchased: part.wasPurchased ?? undefined,
    containedIn: part.containedIn ?? undefined,
    acquisitionDate: part.acquisitionDate ?? undefined,
    value: part.value ?? undefined,
    donorId: part.donorId || undefined,
  };
  const newId = (await apiPost<{ id: number }>("/parts", body)).id;

  // Backend returns 201 with the new asset id; fetch the full record by id.
  return apiGet<Part>(`/parts/${newId}`);
}

export async function updatePart(id: number, updates: Part): Promise<Part> {
  await apiPutVoid(`/parts/${id}`, updates);
  return apiGet<Part>(`/parts/${id}`);
}

export async function deletePart(id: number): Promise<void> {
  return apiDelete(`/parts/${id}`);
}

export async function getPartsByDevice(deviceId: number): Promise<Part[]> {
  return apiGet<Part[]>(`/parts/device/${deviceId}`);
}

export async function getPartChangelog(id: number): Promise<PartChangelogEntry[]> {
  const raw = await apiGet<PartChangelogResponse[]>(`/parts/${id}/changelog`);
  return raw.map((e) => ({ ...e, assetId: e.partID ?? 0 }));
}
