/**
 * accountService — create, list, and delete volunteer accounts.
 *
 * Real API:
 *   GET    /api/accounts        → AccountSummary[]
 *   POST   /api/accounts        → AccountSummary   (chapter-admin or admin)
 *   DELETE /api/accounts/:id    → 204             (admin only)
 */

import { apiGet, apiPost, apiDelete, apiPostVoid, apiPutVoid } from './api'
import type { ChapterRole } from '../types/inventory'

export interface AccountSummary {
  id: number
  username: string
  name: string
  chapterRoles: ChapterRole[]
}

export interface CreateAccountRequest {
  name: string
  username: string
  password: string
  chapterId: number
  role: string
}

export async function getAccounts(): Promise<AccountSummary[]> {
  return apiGet<AccountSummary[]>('/accounts')
}

export async function createAccount(request: CreateAccountRequest): Promise<AccountSummary> {
  return apiPost<AccountSummary>('/accounts', request)
}

export async function deleteAccount(id: number): Promise<void> {
  return apiDelete(`/accounts/${id}`)
}

export async function addAccountRole(id: number, chapterId: number, role: string): Promise<void> {
  return apiPostVoid(`/accounts/${id}/roles`, { chapterId, role })
}

export async function updateAccountRole(id: number, chapterId: number, role: string): Promise<void> {
  return apiPutVoid(`/accounts/${id}/roles/${chapterId}`, { role })
}

export async function removeAccountRole(id: number, chapterId: number): Promise<void> {
  return apiDelete(`/accounts/${id}/roles/${chapterId}`)
}

export async function updatePassword(id: number, newPassword: string): Promise<void> {
  return apiPutVoid(`/accounts/${id}`, { newPassword })
}
