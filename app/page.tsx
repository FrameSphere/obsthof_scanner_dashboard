import { getEmployeeSummaries, getRecentScans } from '@/lib/queries'
import StatCard from '@/components/StatCard'
import BucketChart from '@/components/BucketChart'
import RecentScans from '@/components/RecentScans'

export const revalidate = 60 // Seite jede Minute neu laden

function todayRange() {
  const from = new Date()
  from.setHours(0, 0, 0, 0)
  const to = new Date()
  to.setHours(23, 59, 59, 999)
  return { from: from.toISOString(), to: to.toISOString() }
}

export default async function DashboardPage() {
  const { from, to } = todayRange()

  const [summaries, recentScans] = await Promise.all([
    getEmployeeSummaries(from, to),
    getRecentScans(20),
  ])

  const totalBuckets = summaries.reduce((sum, s) => sum + s.totalBuckets, 0)
  const totalScans = summaries.reduce((sum, s) => sum + s.scanCount, 0)
  const topEmployee = summaries[0] ?? null

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Heutige Übersicht</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('de-DE', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      {/* Kennzahlen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Eimer heute"
          value={totalBuckets}
          icon="🧺"
          color="green"
        />
        <StatCard
          label="Scans heute"
          value={totalScans}
          icon="📡"
          color="blue"
        />
        <StatCard
          label="Aktive Mitarbeiter"
          value={summaries.length}
          icon="👷"
          color="orange"
        />
        <StatCard
          label="Top Mitarbeiter"
          value={topEmployee ? topEmployee.totalBuckets : '—'}
          sub={topEmployee?.employee.name}
          icon="🏆"
          color="red"
        />
      </div>

      {/* Eimer pro Mitarbeiter */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Eimer pro Mitarbeiter — heute
        </h2>
        <BucketChart summaries={summaries} />
      </div>

      {/* Letzte Scans */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Letzte Scans
        </h2>
        <RecentScans scans={recentScans} />
      </div>

    </div>
  )
}
