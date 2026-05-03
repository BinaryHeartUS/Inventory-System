/**
 * Asset service — cross-cutting utilities that operate across all asset types.
 *
 * Because all devices, parts, and tools share the Asset table's ID sequence,
 * queries that span asset types belong here rather than in the individual services.
 *
 * Endpoints (Javalin backend):
 *   GET /api/assets/:id/exists  → boolean
 */

import { apiGet } from './api'

/**
 * Returns true if any asset (device, part, or tool) already uses the given ID.
 * Used by the Add Asset modal to validate manually-entered IDs before submission.
 */
export async function checkAssetIdExists(id: number): Promise<boolean> {
  return apiGet<boolean>(`/assets/${id}/exists`)
}
