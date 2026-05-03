import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { useMemo } from 'react'
import type { AnyDevice } from '../types/inventory'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function monthKey(iso: string): string {
  // Returns 'YYYY-MM' from an ISO date string
  return iso.slice(0, 7)
}

function formatMonthLabel(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

// Generates the last N month keys ending at today
function lastNMonths(n: number): string[] {
  const keys: string[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return keys
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChartPoint {
  month: string      // display label
  received: number
  donated: number
}

interface Props {
  devices: AnyDevice[]
  months?: number
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-md px-4 py-3 text-xs">
      <p className="font-semibold text-slate-700 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-semibold text-slate-800">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ActivityChart({ devices, months = 12 }: Props) {
  const keys = lastNMonths(months)

  // Stable skeleton heights — fixed wave pattern
  const skeletonHeights = useMemo(
    () => keys.map((_, i) => 25 + Math.abs(Math.sin(i * 0.8)) * 55),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [months]
  )

  const receivedByMonth: Record<string, number> = {}
  const donatedByMonth:  Record<string, number> = {}
  keys.forEach(k => { receivedByMonth[k] = 0; donatedByMonth[k] = 0 })

  devices.forEach(d => {
    if (d.acquisitionDate) {
      const k = monthKey(d.acquisitionDate)
      if (k in receivedByMonth) receivedByMonth[k]++
    }
    if (d.donatedDate) {
      const k = monthKey(d.donatedDate)
      if (k in donatedByMonth) donatedByMonth[k]++
    }
  })

  const data: ChartPoint[] = keys.map(k => ({
    month:    formatMonthLabel(k),
    received: receivedByMonth[k],
    donated:  donatedByMonth[k],
  }))

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
        Devices Received vs Donated — Last 12 Months
      </p>
      <div className="min-h-[320px]">
        {devices.length === 0 ? (
          <div className="h-[320px] flex items-end gap-2 px-2 pb-6 pt-4">
            {keys.map((k, i) => (
              <div key={k} className="flex-1 flex flex-col justify-end gap-1">
                <div className="w-full rounded-sm bg-slate-100 animate-pulse" style={{ height: `${skeletonHeights[i]}px` }} />
              </div>
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={24}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="circle"
              iconSize={10}
              wrapperStyle={{ fontSize: 13, fontWeight: 500, paddingTop: 16, color: '#475569' }}
            />
            <Line type="monotone" dataKey="received" name="Received" stroke="#6366f1" strokeWidth={2} dot={{ r: 3, fill: '#6366f1' }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="donated"  name="Donated"  stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3, fill: '#0ea5e9' }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
