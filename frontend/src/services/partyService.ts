/**
 * partyService — manage donors and recipients (Party / Person / Organization).
 *
 * Wire format notes:
 *   - GET /api/party        returns GetPartyResponse[] (no `type` field yet; inferred from presence of individualEmail)
 *   - GET /api/party/{id}   returns GetPartyResponse with PII fields
 *   - POST endpoints return 201 void — we re-fetch to get the created record
 *   - `location` travels as a PostgreSQL composite string: "(street,city,state,zip,country)"
 *     The service layer parses it on read and serialises it on write.
 */

import { apiGet, apiPostVoid, apiPutVoid } from './api'
import type { components } from '../types/api'
import type {
  PartySummary,
  PartyDetail,
  PersonDetail,
  OrgDetail,
  CreatePersonRequest,
  CreateOrgRequest,
  UpdatePersonRequest,
  UpdateOrgRequest,
  AddressForm,
} from '../types/inventory'
import { parseLocation, formatLocation } from '../types/inventory'

type WireParty = components['schemas']['GetPartyResponse']

// ─── Wire → domain mapping ────────────────────────────────────────────────────

function wireToSummary(w: WireParty): PartySummary {
  // Infer type: persons have individualEmail, orgs have contactName/contactEmail.
  // Fall back to 'Person' until the backend adds an explicit type field.
  const type: 'Person' | 'Organization' =
    ('contactName' in w && (w.contactName != null || w.contactEmail != null))
      ? 'Organization'
      : 'Person'
  return { id: w.id, name: w.name ?? '', type }
}

function wireToDetail(w: WireParty): PartyDetail {
  const summary = wireToSummary(w)
  const location = parseLocation(w.location)
  if (summary.type === 'Organization') {
    const org: OrgDetail = {
      ...summary,
      type:         'Organization',
      contactName:  w.contactName  ?? null,
      contactEmail: w.contactEmail ?? null,
      location,
    }
    return org
  }
  const person: PersonDetail = {
    ...summary,
    type:     'Person',
    email:    w.individualEmail ?? null,
    location,
  }
  return person
}

// ─── Domain → wire mapping ────────────────────────────────────────────────────

function buildLocation(addr: Partial<AddressForm> | undefined): string | undefined {
  if (!addr) return undefined
  const { street = '', city = '', state = '', zipCode = '', country = '' } = addr
  if (!street && !city && !state && !zipCode && !country) return undefined
  return formatLocation({ street, city, state, zipCode, country })
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getParties(status?: 'donor' | 'recipient'): Promise<PartySummary[]> {
  const query = status ? `?status=${status}` : ''
  const raw = await apiGet<WireParty[]>(`/party${query}`)
  return raw.map(wireToSummary)
}

export async function getParty(id: number): Promise<PartyDetail> {
  const raw = await apiGet<WireParty>(`/party/${id}`)
  return wireToDetail(raw)
}

export async function createPerson(req: CreatePersonRequest): Promise<void> {
  await apiPostVoid('/party/person', {
    name:     req.name,
    email:    req.email,
    location: typeof req.location === 'string'
      ? req.location
      : buildLocation(req.location as Partial<AddressForm> | undefined),
  })
}

export async function createOrg(req: CreateOrgRequest): Promise<void> {
  await apiPostVoid('/party/organization', {
    name:         req.name,
    contactName:  req.contactName,
    contactEmail: req.contactEmail,
    location: typeof req.location === 'string'
      ? req.location
      : buildLocation(req.location as Partial<AddressForm> | undefined),
  })
}

export async function updatePerson(id: number, req: UpdatePersonRequest): Promise<void> {
  await apiPutVoid(`/party/person/${id}`, {
    name:     req.name,
    email:    req.email,
    location: typeof req.location === 'string'
      ? req.location
      : buildLocation(req.location as Partial<AddressForm> | undefined),
  })
}

export async function updateOrg(id: number, req: UpdateOrgRequest): Promise<void> {
  await apiPutVoid(`/party/organization/${id}`, {
    name:         req.name,
    contactName:  req.contactName,
    contactEmail: req.contactEmail,
    location: typeof req.location === 'string'
      ? req.location
      : buildLocation(req.location as Partial<AddressForm> | undefined),
  })
}

