import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { useMemo } from 'react'
import type { MonthlyCountPoint } from '../types/inventory'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMonthLabel(year: number, month: number): string {
  return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

// Generates the last N month keys ending at today
function lastNMonths(n: number): { year: number; month: number }[] {
  const keys: { year: number; month: number }[] = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    keys.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
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
  receivedData: MonthlyCountPoint[]
  donatedData: MonthlyCountPoint[]
  months?: number
  loading?: boolean
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

export default function ActivityChart({ receivedData, donatedData, months = 12, loading = false }: Props) {
  const skeletonKeys = lastNMonths(months)

  // Stable skeleton heights — fixed wave pattern
  const skeletonHeights = useMemo(
    () => skeletonKeys.map((_, i) => 25 + Math.abs(Math.sin(i * 0.8)) * 55),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [months]
  )

  const receivedByKey: Record<string, number> = {}
  for (const pt of receivedData) receivedByKey[`${pt.year}-${pt.month}`] = pt.count

  const donatedByKey: Record<string, number> = {}
  for (const pt of donatedData) donatedByKey[`${pt.year}-${pt.month}`] = pt.count

  const chartData: ChartPoint[] = skeletonKeys.map(({ year, month }) => ({
    month:    formatMonthLabel(year, month),
    received: receivedByKey[`${year}-${month}`] ?? 0,
    donated:  donatedByKey[`${year}-${month}`]  ?? 0,
  }))

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-4">
        Devices Received vs Donated — Last 12 Months
      </p>
      <div className="min-h-[320px]">
        {loading ? (
          <div className="h-[320px] flex items-end gap-2 px-2 pb-6 pt-4">
            {skeletonKeys.map(({ year, month }, i) => (
              <div key={`${year}-${month}`} className="flex-1 flex flex-col justify-end gap-1">
                <div className="w-full rounded-sm bg-slate-100 animate-pulse" style={{ height: `${skeletonHeights[i]}px` }} />
              </div>
            ))}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
          <LineChart data={chartData}>
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

