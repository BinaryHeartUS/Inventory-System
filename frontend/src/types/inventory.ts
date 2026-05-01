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
export type LoginRequest             = components["schemas"]["LoginRequest"]
export type PostNoteRequest          = components["schemas"]["PostNoteRequest"]
export type UpdateAffiliationRequest = components["schemas"]["UpdateAffiliationRequest"]
export type Note                     = components["schemas"]["NoteResponse"]
export type Part                     = components["schemas"]["PartResponse"]
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
  | "workingBattery" | "includesCharger"
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
}

// --- Tool ---------------------------------------------------------------------
export interface Tool {
  id: number
  acquisitionDate: string | null
  value: number | null
  description: string
  chapterId: number
  donorId: number | null
}
