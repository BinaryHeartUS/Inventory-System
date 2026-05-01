import { apiGet, apiPost } from './api'
import type { ChapterSummary } from '../types/inventory'

export async function getChapters(): Promise<ChapterSummary[]> {
  return apiGet<ChapterSummary[]>('/chapters')
}

export async function createChapter(name: string): Promise<ChapterSummary> {
  return apiPost<ChapterSummary>('/chapters', { name })
}
