import type { components } from "./api"

// Re-export every generated schema so the rest of the app imports from one place.
// Run `npm run gen-types` to regenerate api.d.ts when the backend changes.
export type { components }
export type AddAffiliationRequest    = components["schemas"]["AddAffiliationRequest"]
export type CreateAccountRequest     = components["schemas"]["CreateAccountRequest"]
export type CreateChapterRequest     = components["schemas"]["CreateChapterRequest"]
export type InsertDesktopRequest     = components["schemas"]["InsertDesktopRequest"]
export type InsertLaptopRequest      = components["schemas"]["InsertLaptopRequest"]
export type InsertTabletRequest      = components["schemas"]["InsertTabletRequest"]
export type InsertToolRequest        = components["schemas"]["InsertToolRequest"]
export type InsertPartRequest        = components["schemas"]["InsertPartRequest"]
export type LoginRequest             = components["schemas"]["LoginRequest"]
export type PostNoteRequest          = components["schemas"]["PostNoteRequest"]
export type UpdateAffiliationRequest = components["schemas"]["UpdateAffiliationRequest"]
export type Note = Omit<components["schemas"]["NoteResponse"], "text" | "date"> & {
  text: string
  date: string
}
export type Part = Omit<
  components["schemas"]["PartResponse"],
  "type" | "description" | "containedIn" | "acquisitionDate" | "value" | "donorId"
> & {
  type: string
  description: string
  containedIn: number | null
  acquisitionDate: string | null
  value: number | null
  donorId: number | null
}
export type LookupResponse           = Required<components["schemas"]["LookupResponse"]>

// These types have all fields always populated by the backend. Required<> strips
// the optionality introduced by the Java -> OpenAPI -> TypeScript conversion.
export type ChapterRole    = Required<components["schemas"]["ChapterRole"]>
export type ChapterSummary = Required<components["schemas"]["ChapterSummary"]>
export type AccountSummary = Required<Omit<components["schemas"]["AccountSummary"], "chapterRoles">> & { chapterRoles: ChapterRole[] }
export type LoginResponse  = Required<Omit<components["schemas"]["LoginResponse"],  "chapterRoles">> & { chapterRoles: ChapterRole[] }

// --- Narrow display-only string unions ----------------------------------------
// The backend returns these as plain `string`; these unions let the UI render
// them safely without widening the generated wire types.
export type DeviceStatus   = "Not Started" | "In Progress" | "Ready To Donate" | "Donated" | "Scrapped" | "Unknown"
export type ChargerStatus  = "Included" | "Not Included" | "Unknown"
export type WorkingBattery = "Yes" | "No" | "Unknown"

// --- AnyDevice ----------------------------------------------------------------
// Extends the generated GetDeviceResponse, making optional fields explicitly
// nullable (string | null) to match what the DB / mock data can hold.
export type GetDeviceResponse = components["schemas"]["GetDeviceResponse"]
export type AnyDevice = Omit<
  GetDeviceResponse,
  | "value" | "cpu" | "ramGeneration" | "storageType" | "donatedDate" | "acquisitionDate"
  | "hasWifi" | "designBatteryCapacity" | "actualBatteryCapacity" | "batteryHealth"
  | "workingBattery" | "includesCharger" | "operatingSystem" | "donorId"
> & {
  value: number | null
  cpu?: string | null
  ramGeneration?: string | null
  storageType?: string | null
  donatedDate?: string | null
  acquisitionDate?: string | null
  hasWifi?: boolean | null
  designBatteryCapacity?: number | null
  actualBatteryCapacity?: number | null
  batteryHealth?: number | null
  workingBattery?: string | null
  includesCharger?: string | null
  operatingSystem?: string | null
  donorId?: number | null
}

// --- Dashboard stat response types ------------------------------------------
export type AvgTimeInInventoryResponse    = Required<components["schemas"]["AvgTimeInInventoryResponse"]> & { avgDays: number | null }
export type CompletionRateResponse        = components["schemas"]["CompletionRateResponse"]
export type DashboardCountsResponse       = components["schemas"]["DashboardCountsResponse"]
export type ChapterActivityStatsResponse  = components["schemas"]["ChapterActivityStatsResponse"]
export type MonthlyCountPoint             = components["schemas"]["MonthlyCountPoint"]
export type MonthlyValuePoint             = components["schemas"]["MonthlyValuePoint"]

// --- Tool ---------------------------------------------------------------------
export type Tool = Omit<
  components["schemas"]["GetToolResponse"],
  "acquisitionDate" | "value" | "description" | "donorId"
> & {
  acquisitionDate: string | null
  value: number | null
  description: string
  donorId: number | null
}

// --- Party (donor / recipient) -----------------------------------------------

export interface AddressForm {
  street:  string
  city:    string
  state:   string
  zipCode: string
  country: string
}

// --- Party location helpers --------------------------------------------------
// PostgreSQL composite format: (street,city,state,zip_code,country)
// e.g. "(123 Main St,Terre Haute,IN,47803,USA)"

/** Serialize structured address fields into a PostgreSQL composite string. */
export function formatLocation(a: Partial<AddressForm>): string {
  return `(${a.street ?? ''},${a.city ?? ''},${a.state ?? ''},${a.zipCode ?? ''},${a.country ?? ''})`
}

/** Parse a PostgreSQL composite location string into structured fields.
 *  Returns null if the string is empty, null, or malformed. */
export function parseLocation(raw: string | null | undefined): AddressForm | null {
  if (!raw) return null
  // Strip surrounding parens
  const inner = raw.replace(/^\(/, '').replace(/\)$/, '')
  const parts = inner.split(',')
  if (parts.length < 5) return null
  const [street, city, state, zipCode, ...rest] = parts
  const country = rest.join(',') // country may contain a comma theoretically
  const result: AddressForm = {
    street:  street.trim(),
    city:    city.trim(),
    state:   state.trim(),
    zipCode: zipCode.trim(),
    country: country.trim(),
  }
  // Return null if all fields are empty (no address provided)
  if (Object.values(result).every(v => v === '')) return null
  return result
}

/** Lightweight summary returned by GET /api/party for all authenticated users. */
export interface PartySummary {
  id:   number
  name: string
  type: 'Person' | 'Organization'
}

/** Full person record returned by GET /api/party/{id} (admins only).
 *  `location` is kept as a parsed AddressForm for UI convenience; the service
 *  layer handles serialization to/from the PostgreSQL composite string. */
export interface PersonDetail extends PartySummary {
  type:      'Person'
  email?:    string | null
  location?: AddressForm | null
}

/** Full organization record returned by GET /api/party/{id} (admins only). */
export interface OrgDetail extends PartySummary {
  type:          'Organization'
  contactName?:  string | null
  contactEmail?: string | null
  location?:     AddressForm | null
}

export type PartyDetail = PersonDetail | OrgDetail

/** Wire shapes sent to POST /api/party/person and PUT /api/party/person/{id}. */
export interface CreatePersonRequest {
  name:      string
  email?:    string
  location?: string   // PostgreSQL composite: "(street,city,state,zip,country)"
}

/** Wire shapes sent to POST /api/party/organization and PUT /api/party/organization/{id}. */
export interface CreateOrgRequest {
  name:          string
  contactName?:  string
  contactEmail?: string
  location?:     string
}

export type UpdatePersonRequest = CreatePersonRequest
export type UpdateOrgRequest    = CreateOrgRequest
