/**
 * Asset service — cross-cutting utilities that operate across all asset types.
 *
 * Because all devices, parts, and tools share the Asset table's ID sequence,
 * queries that span asset types belong here rather than in the individual services.
 *
 * Endpoints (Javalin backend):
 *   GET /api/assets/:id/exists  → boolean
 */

// import { apiGet } from './api'
import { getDevice } from './deviceService'
import { getPart } from './partService'
import { getTool } from './toolService'

/**
 * Returns true if any asset (device, part, or tool) already uses the given ID.
 * Used by the Add Asset modal to validate manually-entered IDs before submission.
 *
 * TODO: Replace with a single GET /api/assets/:id/exists call for efficiency —
 * the mock implementation fans out to three separate lookups.
 */
export async function checkAssetIdExists(id: number): Promise<boolean> {
  // return apiGet<boolean>(`/assets/${id}/exists`)
  const [device, part, tool] = await Promise.all([
    getDevice(id),
    getPart(id),
    getTool(id),
  ])
  return device !== null || part !== null || tool !== null
}
