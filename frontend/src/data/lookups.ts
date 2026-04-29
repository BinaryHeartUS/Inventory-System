/**
 * Shared option lists for dropdown and combo fields.
 *
 * TODO: Replace each constant with a fetch from the corresponding API endpoint
 * once the backend lookup-table endpoints are available:
 *
 *   GET /api/lookup/manufacturer   → string[]   (Manufacturer table)
 *   GET /api/lookup/ram-generation → string[]   (Ram_Generation table)
 *   GET /api/lookup/storage-type   → string[]   (Storage_Type table)
 *   GET /api/lookup/part-type      → string[]   (Part_Type table)
 *
 * Load these in a shared React context or per-component useEffect so the
 * dropdowns always reflect the canonical values stored server-side.
 */

import type { ChargerStatus, DeviceStatus, WorkingBattery } from '../types/inventory'

// ─── Fixed enums ──────────────────────────────────────────────────────────────

export const DEVICE_STATUSES: DeviceStatus[] = [
  'Not Started',
  'In Progress',
  'Ready To Donate',
  'Donated',
  'Scrapped',
  'Unknown',
]

export const CHARGER_STATUSES: ChargerStatus[] = ['Included', 'Not Included', 'Unknown']

export const WORKING_BATTERY_OPTS: WorkingBattery[] = ['Yes', 'No', 'Unknown']

export const WIFI_OPTS = ['Yes', 'No', 'Unknown'] as const

// ─── Lookup-table rows (replace with API calls) ───────────────────────────────

/** Manufacturer.Name — from the Manufacturer lookup table. */
export const MANUFACTURER_OPTS: string[] = [
  'Acer', 'Apple', 'Dell', 'HP', 'Lenovo', 'Microsoft', 'Samsung',
]

/** Ram_Generation.Name — from the Ram_Generation lookup table. */
export const RAM_GEN_OPTS: string[] = ['DDR4', 'DDR5', 'LPDDR4', 'LPDDR4x', 'LPDDR5']

/** Storage_Type.Name — from the Storage_Type lookup table. */
export const STORAGE_TYPE_OPTS: string[] = ['SSD', 'HDD', 'NVMe SSD', 'eMMC']

/** Part_Type.Name — from the Part_Type lookup table. */
export const PART_TYPE_OPTS: string[] = [
  'SODIMM', 'DIMM', 'M.2 SSD', 'SATA SSD', 'HDD', 'Charger', 'Battery',
  'Display', 'Keyboard', 'Motherboard', 'PSU', 'GPU', 'USB Flash Drive',
]

/**
 * Tool.Type — VARCHAR(20) stored directly on the Tool row (no FK yet, but treated as a
 * lookup so the field behaves consistently with Manufacturer / Part_Type).
 * TODO: GET /api/lookup/tool-type once a Tool_Type table is added to the schema.
 */
export const TOOL_TYPE_OPTS: string[] = [
  'Screwdriver Set', 'Anti-Static Mat', 'Thermal Paste', 'Heat Gun',
  'USB Flash Drive', 'Anti-Static Gloves', 'Tweezers', 'Pry Tool Set',
  'Soldering Iron', 'Multimeter',
]
