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

import { apiGet, apiGetOrNull, apiPutVoid, apiDelete, apiPost, buildQuery } from "./api";
import type { InsertToolRequest, Tool, ToolChangelogResponse, IdResponse } from "../types/inventory";
import type { ToolChangelogEntry } from "../types/changelog";
import { getChapters } from "./chapterService";

export interface ToolListParams {
  pageKey: number;
  pageSize: number;
  search?: string;
  /** Chapter id to restrict to (within the user's access). */
  chapter?: number;
  donorId?: number;
}

export async function getTools(params: ToolListParams): Promise<Tool[]> {
  return apiGet<Tool[]>(`/tools${buildQuery({ ...params })}`);
}

/** Returns null when no tool with the given ID exists. */
export async function getTool(id: number): Promise<Tool | null> {
  return apiGetOrNull<Tool>(`/tools/${id}`);
}

export async function createTool(tool: Tool): Promise<Tool> {
  const chapters = await getChapters();
  const chapter = chapters.find((c) => c.id === tool.chapterId);
  if (!chapter) throw new Error(`Unknown chapter: ${tool.chapterId}`);
  const chapterId = chapter.id;
  const assetId = tool.id > 0 ? tool.id : undefined;

  const body: InsertToolRequest = {
    chapterId,
    assetId,
    description: tool.description ?? undefined,
    acquisitionDate: tool.acquisitionDate ?? undefined,
    value: tool.value ?? undefined,
    donorId: tool.donorId || undefined,
  };
  const newId = (await apiPost<IdResponse>("/tools", body)).id;

  // Backend returns 201 with the new asset id; fetch the full record by id.
  return apiGet<Tool>(`/tools/${newId}`);
}

export async function deleteTool(id: number): Promise<void> {
  return apiDelete(`/tools/${id}`);
}

export async function updateTool(id: number, updates: Tool): Promise<Tool> {
  const body: InsertToolRequest = {
    chapterId: updates.chapterId,
    assetId: updates.id,
    description: updates.description ?? undefined,
    acquisitionDate: updates.acquisitionDate ?? undefined,
    value: updates.value ?? undefined,
    donorId: updates.donorId || undefined,
  };
  await apiPutVoid(`/tools/${id}`, body);
  return apiGet<Tool>(`/tools/${id}`);
}

export async function getToolChangelog(id: number): Promise<ToolChangelogEntry[]> {
  const raw = await apiGet<ToolChangelogResponse[]>(`/tools/${id}/changelog`);
  return raw.map((e) => ({ ...e, assetId: e.toolID ?? 0 }));
}
