import type { DeviceStatus } from '../types/inventory'
import { STATUS_CONFIG } from '../utils/brandColors'

export { STATUS_CONFIG }
export default function StatusBadge({ status, size = 'sm' }: { status: DeviceStatus | null | undefined; size?: 'sm' | 'lg' }) {
  const cfg = status ? STATUS_CONFIG[status] : undefined
  if (!cfg) return null
  if (size === 'lg') {
    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${cfg.badge}`}>
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
