import type { AnyDevice, Note, Part, Tool } from '../types/inventory'

export const CHAPTERS = ['Austin', 'Houston', 'Dallas', 'San Antonio'] as const
export type ChapterName = typeof CHAPTERS[number]

// ─── Devices ──────────────────────────────────────────────────────────────────

export const ALL_DEVICES: AnyDevice[] = [
  // ── Austin ──────────────────────────────────────────────────────────────────
  { id: 1000, type: 'Laptop',  manufacturer: 'Dell',      model: 'Latitude 5420',    year: 2021, cpu: 'i5-1135G7',         ram: 16, ramGeneration: 'DDR4',    storage: 256,  storageType: 'SSD',           status: 'Ready To Donate', chapter: 'Austin',      acquisitionDate: '2026-04-22', value: null,   includesCharger: 'Included',     designBatteryCapacity: 68000, actualBatteryCapacity: 53720, batteryHealth: 0.79 },
  { id: 1001, type: 'Desktop', manufacturer: 'HP',        model: 'ProDesk 400 G6',   year: 2020, cpu: 'i7-10700',          ram: 32, ramGeneration: 'DDR4',    storage: 512,  storageType: 'SSD',           status: 'In Progress',     chapter: 'Austin',      acquisitionDate: '2026-04-21', value: null,   hasWifi: false },
  { id: 1004, type: 'Desktop', manufacturer: 'Apple',     model: 'iMac 21.5"',       year: 2019, cpu: 'i5-8500',           ram: 8,  ramGeneration: 'DDR4',    storage: 1024, storageType: 'HDD',           status: 'Scrapped',        chapter: 'Austin',      acquisitionDate: '2026-04-18', value: null,   hasWifi: true },
  { id: 1008, type: 'Laptop',  manufacturer: 'HP',        model: 'EliteBook 840 G8', year: 2021, cpu: 'i5-1145G7',         ram: 16, ramGeneration: 'DDR4',    storage: 512,  storageType: 'SSD',           status: 'Not Started',     chapter: 'Austin',      acquisitionDate: '2026-04-23', value: null,   includesCharger: 'Not Included', designBatteryCapacity: 56000, actualBatteryCapacity: null, batteryHealth: null },
  { id: 1009, type: 'Tablet',  manufacturer: 'Samsung',   model: 'Galaxy Tab S6',    year: 2020, cpu: null,                ram: 6,  ramGeneration: null,       storage: 128,  storageType: 'Flash Storage', status: 'Donated',         chapter: 'Austin',      acquisitionDate: '2026-04-10', value: null,   includesCharger: 'Included',     workingBattery: 'Yes' },
  // ── Houston ─────────────────────────────────────────────────────────────────
  { id: 1002, type: 'Tablet',  manufacturer: 'Apple',     model: 'iPad 9th Gen',     year: 2021, cpu: null,                ram: 3,  ramGeneration: null,       storage: 64,   storageType: 'Flash Storage', status: 'Donated',         chapter: 'Houston',     acquisitionDate: '2026-04-20', value: null,   includesCharger: 'Included',     workingBattery: 'Yes' },
  { id: 1005, type: 'Laptop',  manufacturer: 'Lenovo',    model: 'IdeaPad 3',        year: 2020, cpu: 'Ryzen 3 3250U',     ram: 8,  ramGeneration: 'DDR4',    storage: 256,  storageType: 'SSD',           status: 'Ready To Donate', chapter: 'Houston',     acquisitionDate: '2026-04-17', value: null,   includesCharger: 'Included',     designBatteryCapacity: 45000, actualBatteryCapacity: 38700, batteryHealth: 0.86 },
  { id: 1010, type: 'Desktop', manufacturer: 'Dell',      model: 'OptiPlex 7080',    year: 2021, cpu: 'i7-10700',          ram: 16, ramGeneration: 'DDR4',    storage: 512,  storageType: 'SSD',           status: 'Not Started',     chapter: 'Houston',     acquisitionDate: '2026-04-23', value: null,   hasWifi: true },
  { id: 1011, type: 'Laptop',  manufacturer: 'Acer',      model: 'Aspire 5',         year: 2022, cpu: 'i5-1235U',          ram: 12, ramGeneration: 'DDR4',    storage: 512,  storageType: 'SSD',           status: 'In Progress',     chapter: 'Houston',     acquisitionDate: '2026-04-16', value: null,   includesCharger: 'Not Included', designBatteryCapacity: 57000, actualBatteryCapacity: 52200, batteryHealth: 0.92 },
  // ── Dallas ───────────────────────────────────────────────────────────────────
  { id: 1003, type: 'Laptop',  manufacturer: 'Lenovo',    model: 'ThinkPad T14',     year: 2022, cpu: 'Ryzen 5 Pro 5650U', ram: 16, ramGeneration: 'DDR4',    storage: 512,  storageType: 'SSD',           status: 'Not Started',     chapter: 'Dallas',      acquisitionDate: '2026-04-19', value: null,   includesCharger: 'Not Included', designBatteryCapacity: 57000, actualBatteryCapacity: 50160, batteryHealth: 0.88 },
  { id: 1006, type: 'Desktop', manufacturer: 'Lenovo',    model: 'ThinkCentre M70q', year: 2021, cpu: 'i5-10400T',         ram: 16, ramGeneration: 'DDR4',    storage: 256,  storageType: 'SSD',           status: 'Ready To Donate', chapter: 'Dallas',      acquisitionDate: '2026-04-14', value: null,   hasWifi: false },
  { id: 1012, type: 'Tablet',  manufacturer: 'Apple',     model: 'iPad Air 4th Gen', year: 2020, cpu: null,                ram: 4,  ramGeneration: null,       storage: 64,   storageType: 'Flash Storage', status: 'In Progress',     chapter: 'Dallas',      acquisitionDate: '2026-04-21', value: null,   includesCharger: 'Not Included', workingBattery: 'No' },
  // ── San Antonio ─────────────────────────────────────────────────────────────
  { id: 1007, type: 'Laptop',  manufacturer: 'Microsoft', model: 'Surface Laptop 3', year: 2020, cpu: 'i5-1035G7',         ram: 8,  ramGeneration: 'LPDDR4x', storage: 256,  storageType: 'SSD',           status: 'Donated',         chapter: 'San Antonio', acquisitionDate: '2026-04-12', value: null,   includesCharger: 'Included',     designBatteryCapacity: 45800, actualBatteryCapacity: 39000, batteryHealth: 0.85 },
  { id: 1013, type: 'Desktop', manufacturer: 'HP',        model: 'EliteDesk 800 G6', year: 2020, cpu: 'i5-10500',          ram: 16, ramGeneration: 'DDR4',    storage: 512,  storageType: 'SSD',           status: 'Not Started',     chapter: 'San Antonio', acquisitionDate: '2026-04-23', value: null,   hasWifi: false },
  { id: 1014, type: 'Laptop',  manufacturer: 'Dell',      model: 'XPS 13',           year: 2021, cpu: 'i7-1165G7',         ram: 16, ramGeneration: 'LPDDR4x', storage: 512,  storageType: 'SSD',           status: 'Ready To Donate', chapter: 'San Antonio', acquisitionDate: '2026-04-15', value: null,   includesCharger: 'Included',     designBatteryCapacity: 52000, actualBatteryCapacity: 48360, batteryHealth: 0.93 },
]

// ─── Parts ────────────────────────────────────────────────────────────────────

export const ALL_PARTS: Part[] = [
  { id: 2000, type: 'SODIMM',  description: 'DDR4 8GB stick',   chapter: 'Austin',      wasPurchased: false, containedIn: null, acquisitionDate: '2026-04-22', value: null },
  { id: 2001, type: 'M.2 SSD', description: '256GB NVMe drive', chapter: 'Houston',     wasPurchased: true,  containedIn: null, acquisitionDate: '2026-04-20', value: 39.99 },
  { id: 2002, type: 'HDD',     description: 'SATA 1TB 2.5"',    chapter: 'Dallas',      wasPurchased: false, containedIn: null, acquisitionDate: '2026-04-18', value: null },
  { id: 2003, type: 'SODIMM',  description: 'DDR4 16GB stick',  chapter: 'Austin',      wasPurchased: true,  containedIn: null, acquisitionDate: '2026-04-15', value: 24.99 },
  { id: 2004, type: 'Charger', description: 'Dell 65W USB-C',   chapter: 'Houston',     wasPurchased: true,  containedIn: null, acquisitionDate: '2026-04-12', value: 18.50 },
  { id: 2005, type: 'HDD',     description: 'SATA 500GB 3.5"',  chapter: 'San Antonio', wasPurchased: false, containedIn: null, acquisitionDate: '2026-04-10', value: null },
]

// ─── Tools ────────────────────────────────────────────────────────────────────

export const ALL_TOOLS: Tool[] = [
  { id: 3000, type: 'Screwdriver Set', description: 'Phillips and flathead set',       chapter: 'Austin',      acquisitionDate: '2026-04-15', value: null  },
  { id: 3001, type: 'Anti-Static Mat', description: 'Grounding mat for workbench',     chapter: 'Houston',     acquisitionDate: '2026-04-10', value: null  },
  { id: 3002, type: 'Thermal Paste',   description: 'Arctic MX-4 4g tube',            chapter: 'Dallas',      acquisitionDate: '2026-04-08', value: 8.99  },
  { id: 3003, type: 'Heat Gun',        description: '300W adjustable heat gun',        chapter: 'Austin',      acquisitionDate: '2026-03-20', value: null  },
  { id: 3004, type: 'USB Flash Drive', description: 'Ventoy bootable 32GB drive',      chapter: 'San Antonio', acquisitionDate: '2026-04-01', value: 12.00 },
]

// ─── Notes ────────────────────────────────────────────────────────────────────
// TODO: Replace with GET /api/devices/:id/notes endpoint.
// Notes are stored in the Note table keyed by Asset_ID.

export const ALL_NOTES: Note[] = [
  { id: 4000, assetId: 1000, date: '2026-04-22T10:15:00Z', text: 'Device received from donor. All ports functional. Minor cosmetic scratches on lid.' },
  { id: 4001, assetId: 1000, date: '2026-04-22T14:30:00Z', text: 'Wiped and reinstalled OS. Battery at 79% health — acceptable for donation.' },
  { id: 4002, assetId: 1000, date: '2026-04-23T09:00:00Z', text: 'Passed all diagnostics. Marked ready to donate.' },
  { id: 4003, assetId: 1001, date: '2026-04-21T11:00:00Z', text: 'Received from corporate surplus. No monitor included.' },
  { id: 4004, assetId: 1001, date: '2026-04-21T16:45:00Z', text: 'RAM upgrade needed — currently 32 GB but one stick is failing. Ordered replacement.' },
  { id: 4005, assetId: 1003, date: '2026-04-19T08:30:00Z', text: 'Donated by local business. Missing charger, will source one.' },
  { id: 4006, assetId: 1005, date: '2026-04-17T13:00:00Z', text: 'Good condition. Battery holds charge well at 86%.' },
  { id: 4007, assetId: 1005, date: '2026-04-17T15:20:00Z', text: 'Pre-loaded with LibreOffice and Chromium. Ready for pickup.' },
]
