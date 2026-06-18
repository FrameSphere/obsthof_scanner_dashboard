import { getEmployeeSummaries, getRecentScans } from '@/lib/queries'
import StatCard from '@/components/StatCard'
import BucketChart from '@/components/BucketChart'
import RecentScans from '@/components/RecentScans'
import DateRangePickerWrapper from '@/components/DateRangePickerWrapper'

export const revalidate = 60

function defaultRange() {
  const from = new Date(); from.setHours(0, 0, 0, 0)
  const to = new Date(); to.setHours(23, 59, 59, 999)
  return { from: from.toISOString(), to: to.toISOString() }
}

function formatRangeLabel(from: string, to: string) {
  const f = new Date(from)
  const t = new Date(to)
  const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
  if (f.toDateString() === t.toDateString()) {
    return f.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  }
  return `${f.toLocaleDateString('de-DE', opts)} – ${t.toLocaleDateString('de-DE', opts)}`
}

const sectionStyle = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: '8px', padding: '24px 28px',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const sp = await searchParams
  const { from, to } = (sp.from && sp.to) ? sp as { from: string; to: string } : defaultRange()

  const [summaries, recentScans] = await Promise.all([
    getEmployeeSummaries(from, to),
    getRecentScans(25, from, to),
  ])

  const totalBuckets = summaries.reduce((s, e) => s + e.totalBuckets, 0)
  const totalScans = summaries.reduce((s, e) => s + e.scanCount, 0)
  const topEmployee = summaries[0] ?? null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
            {formatRangeLabel(from, to)}
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Übersicht
          </h1>
        </div>
        <DateRangePickerWrapper />
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <StatCard label="Eimer gesamt" value={totalBuckets} />
        <StatCard label="Scans gesamt" value={totalScans} />
        <StatCard label="Aktive Mitarbeiter" value={summaries.length} />
        <StatCard
          label="Bester Mitarbeiter"
          value={topEmployee ? topEmployee.totalBuckets : '—'}
          sub={topEmployee?.employee.name}
        />
      </div>

      {/* Ranking */}
      <div style={sectionStyle}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          Eimer je Mitarbeiter
        </div>
        <BucketChart summaries={summaries} />
      </div>

      {/* Letzte Scans */}
      <div style={sectionStyle}>
        <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          Scans im gewählten Zeitraum
        </div>
        <RecentScans scans={recentScans} />
      </div>

    </div>
  )
}
