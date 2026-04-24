import type { DeviceStatus } from '../types/inventory'

const STATUS_CONFIG: Record<DeviceStatus, { dot: string; badge: string; badgeDark: string }> = {
  'Not Started':    { dot: 'bg-slate-400', badge: 'bg-slate-100 text-slate-600', badgeDark: 'bg-slate-500/30 text-slate-200' },
  'In Progress':    { dot: 'bg-amber-400', badge: 'bg-amber-50  text-amber-700', badgeDark: 'bg-amber-400/25 text-amber-200' },
  'Ready To Donate':{ dot: 'bg-green-500', badge: 'bg-green-50  text-green-700', badgeDark: 'bg-green-500/25 text-green-200' },
  'Donated':        { dot: 'bg-blue-500',  badge: 'bg-blue-50   text-blue-700',  badgeDark: 'bg-blue-500/25  text-blue-200'  },
  'Scrapped':       { dot: 'bg-red-400',   badge: 'bg-red-50    text-red-600',   badgeDark: 'bg-red-400/25   text-red-200'   },
  'Unknown':        { dot: 'bg-gray-300',  badge: 'bg-gray-100  text-gray-500',  badgeDark: 'bg-gray-500/30  text-gray-300'  },
}

export { STATUS_CONFIG }

export default function StatusBadge({ status, size = 'sm' }: { status: DeviceStatus; size?: 'sm' | 'lg' }) {
  const cfg = STATUS_CONFIG[status]
  if (size === 'lg') {
    return (
      <span className={`inline-flex items-center gap-2 px-4 rounded-lg text-sm font-semibold whitespace-nowrap self-stretch ${cfg.badgeDark}`}>
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
        {status}
      </span>
    )
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${cfg.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  )
}
