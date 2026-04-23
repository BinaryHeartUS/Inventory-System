import type { components } from './api'

// ─── API wire-format types (auto-generated — run `npm run gen-types` to sync) ─
// These are the exact values the backend sends/receives over the wire.

export type ApiStatus        = components['schemas']['Status']
export type ApiChargerStatus = components['schemas']['ChargerStatus']
export type ApiManufacturer  = components['schemas']['Manufacturer']
export type ApiRamGeneration = components['schemas']['RamGeneration']
export type ApiStorageType   = components['schemas']['StorageType']
export type InsertDesktopRequest = components['schemas']['InsertDesktopRequest']
export type InsertLaptopRequest  = components['schemas']['InsertLaptopRequest']

// ─── Display types (human-readable labels used in UI components) ──────────────
// These are the getDatabaseValue() strings from the backend enums.
// When consuming real API responses, use the API_TO_* maps below to convert.

export type DeviceStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Ready To Donate'
  | 'Donated'
  | 'Scrapped'
  | 'Unknown'

export type ChargerStatus = 'Included' | 'Not Included' | 'Unknown'
export type WorkingBattery = 'Yes' | 'No' | 'Unknown'
export type RamGeneration = 'DDR2' | 'DDR3' | 'DDR4' | 'DDR5' | 'Unknown'
export type StorageType = 'SSD' | 'HDD' | 'Flash Storage' | 'Unknown'
export type Manufacturer =
  | 'Dell' | 'HP' | 'Lenovo' | 'Apple' | 'Asus' | 'Acer'
  | 'Microsoft' | 'Toshiba' | 'Samsung' | 'Cooler Master' | 'Zotac' | 'Unknown'
export type PartType =
  | 'SODIMM' | 'DIMM' | 'M2 SSD' | 'SATA SSD' | 'HDD' | 'CPU' | 'GPU' | 'Other'

// ─── API → Display mappers ────────────────────────────────────────────────────
// TypeScript will error here if the backend adds a new enum value and you
// re-generate api.d.ts, prompting you to add the missing display label.

export const API_TO_STATUS: Record<ApiStatus, DeviceStatus> = {
  NOT_STARTED:    'Not Started',
  IN_PROGRESS:    'In Progress',
  READY_TO_DONATE:'Ready To Donate',
  DONATED:        'Donated',
  UNKNOWN:        'Unknown',
  SCRAPPED:       'Scrapped',
}

export const API_TO_CHARGER: Record<ApiChargerStatus, ChargerStatus> = {
  INCLUDED:     'Included',
  NOT_INCLUDED: 'Not Included',
  UNKNOWN:      'Unknown',
}

export const API_TO_MANUFACTURER: Record<ApiManufacturer, Manufacturer> = {
  DELL:        'Dell',
  HP:          'HP',
  LENOVO:      'Lenovo',
  APPLE:       'Apple',
  ASUS:        'Asus',
  ACER:        'Acer',
  MICROSOFT:   'Microsoft',
  TOSHIBA:     'Toshiba',
  SAMSUNG:     'Samsung',
  COOLERMASTER:'Cooler Master',
  ZOTAC:       'Zotac',
  UNKNOWN:     'Unknown',
}

export const API_TO_RAM_GENERATION: Record<ApiRamGeneration, RamGeneration> = {
  DDR2:    'DDR2',
  DDR3:    'DDR3',
  DDR4:    'DDR4',
  DDR5:    'DDR5',
  UNKNOWN: 'Unknown',
}

export const API_TO_STORAGE_TYPE: Record<ApiStorageType, StorageType> = {
  SSD:           'SSD',
  HDD:           'HDD',
  FLASH_STORAGE: 'Flash Storage',
  UNKNOWN:       'Unknown',
}

// ─── Base types (mirror Asset + Device tables) ────────────────────────────────

/** Fields shared by every device type — maps to the Asset + Device tables. */
export interface BaseDevice {
  id: number                      // Asset.ID (starts at 1000)
  manufacturer: Manufacturer
  model: string
  year: number
  cpu: string | null
  ram: number                     // GB — Device.RAM
  ramGeneration: RamGeneration | null
  storage: number                 // GB — Device.Storage_Amount
  storageType: StorageType | null
  status: DeviceStatus
  chapter: string                 // resolved from Asset.Chapter_ID
  acquisitionDate: string | null  // Asset.Acquisition_Date
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
  type: PartType
  description: string
  wasPurchased: boolean           // inverse of Was_Donated in Part table
  containedIn: number | null      // Part.Contained_In → Device.ID
  chapter: string
  acquisitionDate: string | null
}
