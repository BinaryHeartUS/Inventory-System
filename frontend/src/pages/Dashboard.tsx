import { useEffect, useState } from 'react'

interface StatCardProps {
  label: string
  count: number | null
}

function StatCard({ label, count }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-1">{count ?? '—'}</p>
    </div>
  )
}

export default function Dashboard() {
  const [desktopCount, setDesktopCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/devices/count/desktop')
      .then((res) => res.json())
      .then((data: number) => setDesktopCount(data))
      .catch(() => setDesktopCount(null))
  }, [])

  const stats = [
    { label: 'Desktops', count: desktopCount },
    { label: 'Laptops', count: null },
    { label: 'Tablets', count: null },
    { label: 'Parts', count: null },
    { label: 'Ready to Donate', count: null },
    { label: 'Donated', count: null },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map(({ label, count }) => (
          <StatCard key={label} label={label} count={count} />
        ))}
      </div>
    </div>
  )
}
