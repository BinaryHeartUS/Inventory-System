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
  | "workingBattery" | "includesCharger" | "operatingSystem"
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

/** Lightweight summary returned by GET /api/party for all authenticated users. */
export interface PartySummary {
  id:   number
  name: string
  type: 'Person' | 'Organization'
}

/** Full person record returned by GET /api/party/{id} (admins only). */
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

export interface CreatePersonRequest {
  name:      string
  email?:    string
  location?: Partial<AddressForm>
}

export interface CreateOrgRequest {
  name:          string
  contactName?:  string
  contactEmail?: string
  location?:     Partial<AddressForm>
}

export type UpdatePersonRequest = CreatePersonRequest
export type UpdateOrgRequest    = CreateOrgRequest
