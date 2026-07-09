/**
 * Note service — CRUD for asset notes.
 *
 * Notes are attached to any asset (device, part, or tool) via Asset_ID.
 * The max text length is 500 characters (Note table constraint).
 *
 * Endpoints (Javalin backend):
 *   GET    /api/assets/:assetId/notes       → Note[]
 *   POST   /api/assets/:assetId/notes       → Note   (body: { text: string })
 *   PUT    /api/assets/:assetId/notes/:noteId → void   (body: { text: string })
 *   DELETE /api/notes/:id                    → 204
 */

import { apiGet, apiPost, apiPutVoid, apiDelete } from "./api";
import type { Note } from "../types/inventory";

export async function getNotesByAsset(assetId: number): Promise<Note[]> {
  return apiGet<Note[]>(`/assets/${assetId}/notes`);
}

export async function createNote(assetId: number, text: string): Promise<Note> {
  return apiPost<Note>(`/assets/${assetId}/notes`, { text });
}

export async function updateNote(assetId: number, noteId: number, text: string): Promise<void> {
  return apiPutVoid(`/assets/${assetId}/notes/${noteId}`, { text });
}

export async function deleteNote(id: number): Promise<void> {
  return apiDelete(`/notes/${id}`);
}
