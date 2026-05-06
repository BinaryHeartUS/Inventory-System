import type { AnyDevice } from '../types/inventory'
import { DesktopRow, LaptopRow, TabletRow } from '../components/DeviceRow'

/** Dispatches to the correct row component based on device.type. */
export function renderDeviceRow(device: AnyDevice, exclude?: string[], onSelect?: (id: number) => void) {
  switch (device.type) {
    case 'Desktop':
      return <DesktopRow key={device.id} device={device} exclude={exclude} onSelect={onSelect} />
    case 'Laptop':
      return <LaptopRow key={device.id} device={device} exclude={exclude} onSelect={onSelect} />
    case 'Tablet':
      return <TabletRow key={device.id} device={device} exclude={exclude} onSelect={onSelect} />
  }
}

/** Column headers that match the DeviceRow layout. */
export const DEVICE_TABLE_HEADERS = [
  'ID', 'Type', 'Brand', 'Model', 'Year', 'CPU', 'OS',
  'RAM', 'Storage', 'Status', 'Details', 'Chapter', 'Acquired',
]
