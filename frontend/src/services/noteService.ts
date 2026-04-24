/**
 * Note service — CRUD for asset notes.
 *
 * Notes are attached to any asset (device, part, or tool) via Asset_ID.
 * The max text length is 500 characters (Note table constraint).
 *
 * Endpoints (Javalin backend):
 *   GET    /api/assets/:assetId/notes  → Note[]
 *   POST   /api/assets/:assetId/notes  → Note   (body: { text: string })
 *   PUT    /api/notes/:id              → Note   (body: { text: string })
 *   DELETE /api/notes/:id              → 204
 */

// import { apiGet, apiPost, apiPut, apiDelete } from './api'
import type { Note } from '../types/inventory'
import { ALL_NOTES } from '../data/mockData'

export async function getNotesByAsset(assetId: number): Promise<Note[]> {
  // return apiGet<Note[]>(`/assets/${assetId}/notes`)
  return Promise.resolve(
    ALL_NOTES
      .filter(n => n.assetId === assetId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  )
}

export async function createNote(assetId: number, text: string): Promise<Note> {
  // return apiPost<Note>(`/assets/${assetId}/notes`, { text })
  const note: Note = { id: Date.now(), assetId, date: new Date().toISOString(), text }
  ALL_NOTES.push(note)
  return Promise.resolve(note)
}

export async function updateNote(id: number, text: string): Promise<Note> {
  // return apiPut<Note>(`/notes/${id}`, { text })
  const idx = ALL_NOTES.findIndex(n => n.id === id)
  if (idx !== -1) ALL_NOTES[idx] = { ...ALL_NOTES[idx], text }
  return Promise.resolve(ALL_NOTES[idx] ?? { id, assetId: 0, date: new Date().toISOString(), text })
}

export async function deleteNote(id: number): Promise<void> {
  // return apiDelete(`/notes/${id}`)
  const idx = ALL_NOTES.findIndex(n => n.id === id)
  if (idx !== -1) ALL_NOTES.splice(idx, 1)
}
