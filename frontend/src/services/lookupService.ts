/**
 * Lookup service — canonical option lists for all dropdown/combo fields.
 *
 * Endpoints:
 *   GET    /api/lookup                    → LookupResponse
 *   POST   /api/lookup/manufacturers      → 201 (Admin only)
 *   POST   /api/lookup/ram-generations    → 201 (Admin only)
 *   POST   /api/lookup/storage-types      → 201 (Admin only)
 *   POST   /api/lookup/part-types         → 201 (Admin only)
 *   POST   /api/lookup/operating-systems  → 201 (Admin only)
 *   DELETE /api/lookup/manufacturers/{n}  → 204 (Admin only)
 *   DELETE /api/lookup/ram-generations/{n}→ 204 (Admin only)
 *   DELETE /api/lookup/storage-types/{n}  → 204 (Admin only)
 *   DELETE /api/lookup/part-types/{n}     → 204 (Admin only)
 *   DELETE /api/lookup/operating-systems/{n} → 204 (Admin only)
 *
 * Chapter lookups are handled by chapterService / ChapterContext.
 */

import { apiGet, apiPostVoid, apiDelete } from "./api";
import type { LookupResponse } from "../types/inventory";

export async function getAllLookups(): Promise<LookupResponse> {
  return apiGet<LookupResponse>("/lookup");
}

export async function addManufacturer(name: string): Promise<void> {
  return apiPostVoid("/lookup/manufacturers", { name });
}

export async function addRamGeneration(name: string): Promise<void> {
  return apiPostVoid("/lookup/ram-generations", { name });
}

export async function addStorageType(name: string): Promise<void> {
  return apiPostVoid("/lookup/storage-types", { name });
}

export async function addPartType(name: string): Promise<void> {
  return apiPostVoid("/lookup/part-types", { name });
}

export async function deleteManufacturer(name: string): Promise<void> {
  return apiDelete(`/lookup/manufacturers/${encodeURIComponent(name)}`);
}

export async function deleteRamGeneration(name: string): Promise<void> {
  return apiDelete(`/lookup/ram-generations/${encodeURIComponent(name)}`);
}

export async function deleteStorageType(name: string): Promise<void> {
  return apiDelete(`/lookup/storage-types/${encodeURIComponent(name)}`);
}

export async function deletePartType(name: string): Promise<void> {
  return apiDelete(`/lookup/part-types/${encodeURIComponent(name)}`);
}

export async function addOperatingSystem(name: string): Promise<void> {
  return apiPostVoid("/lookup/operating-systems", { name });
}

export async function deleteOperatingSystem(name: string): Promise<void> {
  return apiDelete(`/lookup/operating-systems/${encodeURIComponent(name)}`);
}
