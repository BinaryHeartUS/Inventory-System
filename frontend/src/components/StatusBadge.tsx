import type { DeviceStatus } from '../types/inventory'

const STATUS_CONFIG: Record<DeviceStatus, { dot: string; badge: string }> = {
  'Not Started':    { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600' },
  'In Progress':    { dot: 'bg-amber-400', badge: 'bg-amber-50  text-amber-700' },
  'Ready To Donate':{ dot: 'bg-green-500', badge: 'bg-green-50  text-green-700' },
  'Donated':        { dot: 'bg-blue-500',  badge: 'bg-blue-50   text-blue-700'  },
  'Scrapped':       { dot: 'bg-red-400',   badge: 'bg-red-50    text-red-600'   },
  'Unknown':        { dot: 'bg-gray-300',  badge: 'bg-gray-100  text-gray-500'  },
}

export { STATUS_CONFIG }

export default function StatusBadge({ status }: { status: DeviceStatus }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  )
}
