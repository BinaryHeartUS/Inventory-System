/**
 * Tool service — CRUD for Tool assets.
 *
 * Endpoints (Javalin backend):
 *   GET    /api/tools        → Tool[]
 *   GET    /api/tools/:id    → Tool
 *   POST   /api/tools        → Tool   (body: Tool)
 *   PUT    /api/tools/:id    → Tool   (body: Tool)
 *   DELETE /api/tools/:id    → 204
 */

// import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Tool } from '../types/inventory'
import { ALL_TOOLS } from '../data/mockData'

export async function getTools(): Promise<Tool[]> {
  // return apiGet<Tool[]>('/tools')
  return Promise.resolve([...ALL_TOOLS])
}

/** Returns null when no tool with the given ID exists. */
export async function getTool(id: number): Promise<Tool | null> {
  // return apiGet<Tool>(`/tools/${id}`)
  return Promise.resolve(ALL_TOOLS.find(t => t.id === id) ?? null)
}

export async function createTool(tool: Tool): Promise<Tool> {
  // return apiPost<Tool>('/tools', tool)
  ALL_TOOLS.push(tool)
  return Promise.resolve(tool)
}

export async function updateTool(id: number, updates: Tool): Promise<Tool> {
  // return apiPut<Tool>(`/tools/${id}`, updates)
  const idx = ALL_TOOLS.findIndex(t => t.id === id)
  if (idx !== -1) ALL_TOOLS[idx] = updates
  return Promise.resolve(updates)
}

export async function deleteTool(id: number): Promise<void> {
  // return apiDelete(`/tools/${id}`)
  const idx = ALL_TOOLS.findIndex(t => t.id === id)
  if (idx !== -1) ALL_TOOLS.splice(idx, 1)
}
