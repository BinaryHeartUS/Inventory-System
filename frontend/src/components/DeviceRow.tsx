import { useNavigate } from 'react-router-dom'
import type { AnyDevice, Desktop, Laptop, Tablet } from '../types/inventory'
import StatusBadge from './StatusBadge'
/**
 * Renders the columns shared by every device type.
 * Subtype components inject their own cells via the `extraCells` slot,
 * which is placed between the Status and Chapter columns.
 * Clicking any row navigates to /devices/:id.
 */
export function DeviceRow({
  device,
  extraCells,
}: {
  device: AnyDevice
  extraCells: React.ReactNode
}) {
  const navigate = useNavigate()
  return (
    <tr
      className="hover:bg-slate-50 transition-colors cursor-pointer"
      onClick={() => navigate(`/devices/${device.id}`)}
    >
      <td className="px-5 py-5 font-mono text-xs text-slate-400">{device.id}</td>
      <td className="px-5 py-5">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
          device.type === 'Desktop' ? 'bg-blue-50 text-blue-600' :
          device.type === 'Laptop'  ? 'bg-indigo-50 text-indigo-600' :
                                      'bg-violet-50 text-violet-600'
        }`}>
          {device.type}
        </span>
      </td>
      <td className="px-5 py-5 text-slate-700 whitespace-nowrap">{device.manufacturer}</td>
      <td className="px-5 py-5 text-slate-900 whitespace-nowrap">{device.model}</td>
      <td className="px-5 py-5 text-slate-500">{device.year}</td>
      <td className="px-5 py-5 text-slate-500 text-sm">{device.cpu ?? '—'}</td>
      <td className="px-5 py-5 text-slate-500 whitespace-nowrap">
        {device.ram} GB{device.ramGeneration ? ` ${device.ramGeneration}` : ''}
      </td>
      <td className="px-5 py-5 text-slate-500 whitespace-nowrap">
        {device.storage} GB{device.storageType
          ? <span className={device.storageType.includes('SSD') ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}> ({device.storageType})</span>
          : ''}
      </td>
      <td className="px-5 py-5">
        <StatusBadge status={device.status} />
      </td>
      {extraCells}
      <td className="px-5 py-5 text-slate-500">{device.chapter}</td>
      <td className="px-5 py-5 text-slate-400 whitespace-nowrap">
        {device.acquisitionDate ?? '—'}
      </td>
    </tr>
  )
}

export function DesktopRow({ device }: { device: Desktop }) {
  return (
    <DeviceRow
      device={device}
      extraCells={
        <td className="px-5 py-5 text-sm text-slate-500 whitespace-nowrap">
          Wi-Fi:{' '}
          <span className={`font-medium ${
            device.hasWifi === null ? 'text-slate-400' : device.hasWifi ? 'text-green-600' : 'text-red-500'
          }`}>
            {device.hasWifi === null ? '—' : device.hasWifi ? 'Yes' : 'No'}
          </span>
        </td>
      }
    />
  )
}

export function LaptopRow({ device }: { device: Laptop }) {
  const healthPct =
    device.batteryHealth !== null ? Math.round(device.batteryHealth * 100) : null
  const healthColor =
    healthPct === null
      ? 'text-slate-400'
      : healthPct >= 80
        ? 'text-green-600'
        : healthPct >= 50
          ? 'text-amber-600'
          : 'text-red-500'

  return (
    <DeviceRow
      device={device}
      extraCells={
        <td className="px-5 py-5 text-sm whitespace-nowrap space-y-1">
          <div className="text-slate-500">
            Charger:{' '}
            <span className="font-medium text-slate-700">{device.includesCharger}</span>
          </div>
          <div className="text-slate-500">
            Battery:{' '}
            <span className={`font-medium ${healthColor}`}>
              {healthPct !== null ? `${healthPct}%` : '—'}
            </span>
          </div>
        </td>
      }
    />
  )
}

export function TabletRow({ device }: { device: Tablet }) {
  return (
    <DeviceRow
      device={device}
      extraCells={
        <td className="px-5 py-5 text-sm whitespace-nowrap space-y-1">
          <div className="text-slate-500">
            Charger:{' '}
            <span className="font-medium text-slate-700">{device.includesCharger}</span>
          </div>
          <div className="text-slate-500">
            Battery:{' '}
            <span className="font-medium text-slate-700">{device.workingBattery}</span>
          </div>
        </td>
      }
    />
  )
}
