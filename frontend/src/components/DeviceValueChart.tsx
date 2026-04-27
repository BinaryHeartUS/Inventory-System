import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { AnyDevice } from '../types/inventory'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function monthKey(iso: string): string {
  return iso.slice(0, 7)
}

function formatMonthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function lastNMonths(n: number): string[] {
  const keys: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChartPoint {
  month: string
  value: number
}

interface Props {
  devices: AnyDevice[]
  months?: number
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-md px-4 py-3 text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: payload[0].color }} />
        <span className="text-slate-500">Value donated:</span>
        <span className="font-semibold text-slate-800">{formatCurrency(payload[0].value)}</span>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DeviceValueChart({ devices, months = 12 }: Props) {
  const keys = lastNMonths(months)

  const valueByMonth: Record<string, number> = {}
  keys.forEach(k => { valueByMonth[k] = 0 })

  devices.forEach(d => {
    if (d.status === 'Donated' && d.donatedDate && d.value != null) {
      const k = monthKey(d.donatedDate)
      if (k in valueByMonth) valueByMonth[k] += d.value
    }
  })

  const data: ChartPoint[] = keys.map(k => ({
    month: formatMonthLabel(k),
    value: valueByMonth[k],
  }))

  const totalValue = devices
    .filter(d => d.status === 'Donated' && d.value != null)
    .reduce((sum, d) => sum + d.value!, 0)

  const hasData = data.some(p => p.value > 0)

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-baseline justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Value of Donated Devices — Last 12 Months
        </p>
        <span className="text-lg font-extrabold text-emerald-600">{formatCurrency(totalValue)}</span>
      </div>

      {!hasData ? (
        <div className="flex items-center justify-center min-h-[220px]">
          <p className="text-sm text-slate-300 italic">No value data recorded yet</p>
        </div>
      ) : (
        <div className="min-h-[220px]">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={48}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
