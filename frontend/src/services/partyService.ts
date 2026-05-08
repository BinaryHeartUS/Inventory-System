/**
 * partyService — manage donors and recipients (Party / Person / Organization).
 *
 * API endpoints:
 *   GET    /api/party              → PartySummary[]   (name-only; all authenticated users)
 *   GET    /api/party?status=donor → PartySummary[]   (optional filter)
 *   GET    /api/party/{id}         → PartyDetail       (full PII; admins only)
 *   POST   /api/party/person       → PersonDetail
 *   POST   /api/party/organization → OrgDetail
 *   PUT    /api/party/person/{id}  → PersonDetail
 *   PUT    /api/party/organization/{id} → OrgDetail
 */

import { apiGet, apiPost, apiPut } from './api'
import type {
  PartySummary,
  PartyDetail,
  PersonDetail,
  OrgDetail,
  CreatePersonRequest,
  CreateOrgRequest,
  UpdatePersonRequest,
  UpdateOrgRequest,
} from '../types/inventory'

export async function getParties(status?: 'donor' | 'recipient'): Promise<PartySummary[]> {
  const query = status ? `?status=${status}` : ''
  return apiGet<PartySummary[]>(`/party${query}`)
}

export async function getParty(id: number): Promise<PartyDetail> {
  return apiGet<PartyDetail>(`/party/${id}`)
}

export async function createPerson(req: CreatePersonRequest): Promise<PersonDetail> {
  return apiPost<PersonDetail>('/party/person', req)
}

export async function createOrg(req: CreateOrgRequest): Promise<OrgDetail> {
  return apiPost<OrgDetail>('/party/organization', req)
}

export async function updatePerson(id: number, req: UpdatePersonRequest): Promise<PersonDetail> {
  return apiPut<PersonDetail>(`/party/person/${id}`, req)
}

export async function updateOrg(id: number, req: UpdateOrgRequest): Promise<OrgDetail> {
  return apiPut<OrgDetail>(`/party/organization/${id}`, req)
}
