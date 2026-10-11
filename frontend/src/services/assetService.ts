/**
 * Asset service — cross-cutting utilities that operate across all asset types.
 *
 * Because all asset types share the Asset table's ID sequence,
 * queries that span asset types belong here rather than in the individual services.
 *
 * Endpoints (Javalin backend):
 *   GET /api/assets/:id/exists  → boolean
 */

import { apiGet, apiGetOrNull } from "./api";
import type { AssetType, AssetTypeResponse } from "../types/inventory";

/**
 * Returns true if any asset already uses the given ID.
 * Used by the Add Asset modal to validate manually-entered IDs before submission.
 */
export async function checkAssetIdExists(id: number): Promise<boolean> {
  return apiGet<boolean>(`/assets/${id}/exists`);
}

export async function getAssetPath(id: number): Promise<string | null> {
  const response = await apiGetOrNull<AssetTypeResponse>(`/assets/${id}/type`);
  const type = response?.type as AssetType | undefined;
  if (type === "Device") return `/devices/${id}`;
  if (type === "Part") return `/parts/${id}`;
  if (type === "Tool") return `/tools/${id}`;
  if (type === "Misc") return `/misc/${id}`;
  return null;
}
