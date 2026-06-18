import { getEmployeeSummaries, getRecentScans } from '@/lib/queries'
import StatCard from '@/components/StatCard'
import BucketChart from '@/components/BucketChart'
import RecentScans from '@/components/RecentScans'

export const revalidate = 60

function todayRange() {
  const from = new Date(); from.setHours(0, 0, 0, 0)
  const to = new Date(); to.setHours(23, 59, 59, 999)
  return { from: from.toISOString(), to: to.toISOString() }
}

const sectionStyle = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '24px 28px',
}

const sectionTitleStyle = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--text-primary)',
  letterSpacing: '-0.01em',
  marginBottom: '20px',
  paddingBottom: '16px',
  borderBottom: '1px solid var(--border)',
}

export default async function DashboardPage() {
  const { from, to } = todayRange()
  const [summaries, recentScans] = await Promise.all([
    getEmployeeSummaries(from, to),
    getRecentScans(25),
  ])

  const totalBuckets = summaries.reduce((s, e) => s + e.totalBuckets, 0)
  const totalScans = summaries.reduce((s, e) => s + e.scanCount, 0)
  const topEmployee = summaries[0] ?? null

  const dateStr = new Date().toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div>
        <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
          {dateStr}
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Tagesübersicht
        </h1>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <StatCard label="Eimer heute" value={totalBuckets} />
        <StatCard label="Scans heute" value={totalScans} />
        <StatCard label="Aktive Mitarbeiter" value={summaries.length} />
        <StatCard
          label="Bester Mitarbeiter"
          value={topEmployee ? topEmployee.totalBuckets : '—'}
          sub={topEmployee?.employee.name}
        />
      </div>

      {/* Eimer-Ranking */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Eimer je Mitarbeiter — heute</div>
        <BucketChart summaries={summaries} />
      </div>

      {/* Letzte Scans */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Letzte Scans</div>
        <RecentScans scans={recentScans} />
      </div>

    </div>
  )
}
