import { apiGet, apiPost } from './api'
import type { ChapterSummary } from '../types/inventory'
import { CHAPTERS as MOCK_CHAPTERS } from '../data/mockData'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export async function getChapters(): Promise<ChapterSummary[]> {
  if (!USE_MOCK) return apiGet<ChapterSummary[]>('/chapters')
  // Mock: assign stable IDs matching mockData.ts so the rest of the mock layer works
  return Promise.resolve(
    MOCK_CHAPTERS.map((name, i) => ({ id: i + 1, name }))
  )
}

export async function createChapter(name: string): Promise<ChapterSummary> {
  return apiPost<ChapterSummary>('/chapters', { name })
}
