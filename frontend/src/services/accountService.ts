/**
 * accountService — create, list, and delete volunteer accounts.
 *
 * Real API:
 *   GET    /api/accounts        → AccountSummary[]
 *   POST   /api/accounts        → AccountSummary   (chapter-admin or admin)
 *   DELETE /api/accounts/:id    → 204             (admin only)
 */

import { apiGet, apiPost, apiDelete, apiPostVoid, apiPutVoid } from "./api";
import type { AccountSummary, CreateAccountRequest } from "../types/inventory";

export async function getAccounts(): Promise<AccountSummary[]> {
  return apiGet<AccountSummary[]>("/accounts");
}

export async function createAccount(request: CreateAccountRequest): Promise<AccountSummary> {
  return apiPost<AccountSummary>("/accounts", request);
}

export async function deleteAccount(id: number): Promise<void> {
  return apiDelete(`/accounts/${id}`);
}

export async function addAccountRole(id: number, chapterId: number, role: string): Promise<void> {
  return apiPostVoid(`/accounts/${id}/roles`, { chapterId, role });
}

export async function updateAccountRole(
  id: number,
  chapterId: number,
  role: string
): Promise<void> {
  return apiPutVoid(`/accounts/${id}/roles/${chapterId}`, { role });
}

export async function removeAccountRole(id: number, chapterId: number): Promise<void> {
  return apiDelete(`/accounts/${id}/roles/${chapterId}`);
}

export async function updatePassword(
  id: number,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  return apiPutVoid(`/accounts/${id}`, { currentPassword, newPassword });
}
