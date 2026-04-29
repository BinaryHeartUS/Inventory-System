import type { components } from './api'

// ─── Auth ─────────────────────────────────────────────────────────────────────
// The generated schemas mark String fields as optional (Java strings are nullable),
// but the backend always returns them. Required<> tightens the aliases here.
export type ChapterSummary  = Required<components['schemas']['ChapterSummary']>
export type ChapterRole     = Required<components['schemas']['ChapterRole']>
export type LoginResponse   = Required<Omit<components['schemas']['LoginResponse'],  'chapterRoles'>> & { chapterRoles: ChapterRole[] }
export type AccountSummary  = Required<Omit<components['schemas']['AccountSummary'], 'chapterRoles'>> & { chapterRoles: ChapterRole[] }

// ─── API wire-format types (auto-generated — run `npm run gen-types` to sync) ─
// These are the exact values the backend sends/receives over the wire.

export type InsertDesktopRequest = components['schemas']['InsertDesktopRequest']
export type InsertLaptopRequest  = components['schemas']['InsertLaptopRequest']

// ─── Display types ────────────────────────────────────────────────────────────

export type DeviceStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Ready To Donate'
  | 'Donated'
  | 'Scrapped'
  | 'Unknown'

export type ChargerStatus = 'Included' | 'Not Included' | 'Unknown'
export type WorkingBattery = 'Yes' | 'No' | 'Unknown'

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
  donatedDate: string | null      // Device.Donated_Date — set when status transitions to Donated
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

export type GetDeviceResponse = components['schemas']['GetDeviceResponse']
export type AnyDevice = Desktop | Laptop | Tablet;

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
