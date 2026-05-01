/**
 * Tool service — CRUD for Tool assets.
 *
 * Endpoints (Javalin backend):
 *   GET    /api/tools        → Tool[]  (chapter filtering is enforced via JWT claims)
 *   GET    /api/tools/:id    → Tool
 *   POST   /api/tools        → Tool   (body: Tool)
 *   PUT    /api/tools/:id    → Tool   (body: Tool)
 *   DELETE /api/tools/:id    → 204
 */

import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Tool } from '../types/inventory'

export async function getTools(): Promise<Tool[]> {
  return apiGet<Tool[]>('/tools')
}

/** Returns null when no tool with the given ID exists. */
export async function getTool(id: number): Promise<Tool | null> {
  return apiGet<Tool>(`/tools/${id}`)
}

export async function createTool(tool: Tool): Promise<Tool> {
  return apiPost<Tool>('/tools', tool)
}

export async function updateTool(id: number, updates: Tool): Promise<Tool> {
  return apiPut<Tool>(`/tools/${id}`, updates)
}

export async function deleteTool(id: number): Promise<void> {
  return apiDelete(`/tools/${id}`)
}
