import type { AnyDevice } from '../types/inventory'
import { DesktopRow, LaptopRow, TabletRow } from '../components/DeviceRow'

/** Dispatches to the correct row component based on device.type. */
export function renderDeviceRow(device: AnyDevice) {
  switch (device.type) {
    case 'Desktop':
      return <DesktopRow key={device.id} device={device} />
    case 'Laptop':
      return <LaptopRow key={device.id} device={device} />
    case 'Tablet':
      return <TabletRow key={device.id} device={device} />
  }
}

/** Column headers that match the DeviceRow layout. */
export const DEVICE_TABLE_HEADERS = [
  'ID', 'Type', 'Brand', 'Model', 'Year', 'CPU',
  'RAM', 'Storage', 'Status', 'Details', 'Chapter', 'Acquired',
]
