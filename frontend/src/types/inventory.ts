import type { components } from './api'

// ─── API wire-format types (auto-generated — run `npm run gen-types` to sync) ─
// These are the exact values the backend sends/receives over the wire.

export type ApiStatus        = components['schemas']['Status']
export type ApiChargerStatus = components['schemas']['ChargerStatus']
export type InsertDesktopRequest = components['schemas']['InsertDesktopRequest']
export type InsertLaptopRequest  = components['schemas']['InsertLaptopRequest']

// ─── Fixed display types (Status and ChargerStatus are still enums) ───────────

export type DeviceStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Ready To Donate'
  | 'Donated'
  | 'Scrapped'
  | 'Unknown'

export type ChargerStatus = 'Included' | 'Not Included' | 'Unknown'
export type WorkingBattery = 'Yes' | 'No' | 'Unknown'

// ─── API → Display mappers (fixed enums only) ─────────────────────────────────
// TypeScript will error here if the backend adds a new enum value and you
// re-generate api.d.ts, prompting you to add the missing display label.

export const API_TO_STATUS: Record<ApiStatus, DeviceStatus> = {
  NOT_STARTED:     'Not Started',
  IN_PROGRESS:     'In Progress',
  READY_TO_DONATE: 'Ready To Donate',
  DONATED:         'Donated',
  UNKNOWN:         'Unknown',
  // NOTE: SCRAPPED is missing from the OpenAPI spec due to a Javalin plugin bug
  SCRAPPED:        'Scrapped',
}

export const API_TO_CHARGER: Record<ApiChargerStatus, ChargerStatus> = {
  INCLUDED:     'Included',
  NOT_INCLUDED: 'Not Included',
  UNKNOWN:      'Unknown',
}

// ─── Base types (mirror Asset + Device tables) ────────────────────────────────

/** Fields shared by every device type — maps to the Asset + Device tables. */
export interface BaseDevice {
  id: number                      // Asset.ID (starts at 1000)
  manufacturer: string            // Manufacturer.Name (lookup table)
  model: string
  year: number
  cpu: string | null
  ram: number                     // GB — Device.RAM
  ramGeneration: string | null    // Ram_Generation.Name (lookup table)
  storage: number                 // GB — Device.Storage_Amount
  storageType: string | null      // Storage_Type.Name (lookup table)
  status: DeviceStatus
  chapter: string                 // resolved from Asset.Chapter_ID
  acquisitionDate: string | null  // Asset.Acquisition_Date (ISO date string YYYY-MM-DD)
  value: number | null            // Asset.Value (MONEY, optional)
}

// ─── Device subtypes ──────────────────────────────────────────────────────────

/** Maps to the Desktop table. */
export interface Desktop extends BaseDevice {
  type: 'Desktop'
  hasWifi: boolean | null
}

/** Maps to the Laptop table. */
export interface Laptop extends BaseDevice {
  type: 'Laptop'
  includesCharger: ChargerStatus
  designBatteryCapacity: number | null   // mWh
  actualBatteryCapacity: number | null   // mWh
  batteryHealth: number | null           // 0–1, computed column in DB
}

/** Maps to the Tablet table. */
export interface Tablet extends BaseDevice {
  type: 'Tablet'
  includesCharger: ChargerStatus
  workingBattery: WorkingBattery
}

export type AnyDevice = Desktop | Laptop | Tablet

// ─── Part ────────────────────────────────────────────────────────────────────

/** Maps to the Part + Asset tables. */
export interface Part {
  id: number                      // Asset.ID
  type: string                    // Part_Type.Name (lookup table)
  description: string
  wasPurchased: boolean           // inverse of Was_Donated in Part table
  containedIn: number | null      // Part.Contained_In → Device.ID
  chapter: string
  acquisitionDate: string | null  // Asset.Acquisition_Date (ISO date string YYYY-MM-DD)
  value: number | null            // Asset.Value (MONEY, optional)
}

// ─── Note ─────────────────────────────────────────────────────────────────────

/** Maps to the Note table. */
export interface Note {
  id: number                      // Note.ID
  text: string                    // Note.Text (max 500 chars)
  date: string                    // Note.Date (ISO 8601 timestamp string)
  assetId: number                 // Note.Asset_ID
}

// ─── Tool ─────────────────────────────────────────────────────────────────────

/** Maps to the Tool + Asset tables. */
export interface Tool {
  id: number                      // Asset.ID
  type: string                    // Tool_Type.Name (lookup table)
  description: string             // Tool.Description (max 500 chars)
  chapter: string
  acquisitionDate: string | null  // Asset.Acquisition_Date (ISO date string YYYY-MM-DD)
  value: number | null            // Asset.Value (MONEY, optional)
}
