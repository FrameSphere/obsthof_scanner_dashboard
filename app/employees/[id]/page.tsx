import { supabase } from '@/lib/supabase'
import { getEmployeeScans } from '@/lib/queries'
import { Employee } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DateRangePickerWrapper from '@/components/DateRangePickerWrapper'

export const revalidate = 60

function defaultRange() {
  const from = new Date(); from.setDate(from.getDate() - 29); from.setHours(0, 0, 0, 0)
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

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
}

export default async function EmployeeDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string; to?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const { from, to } = (sp.from && sp.to) ? sp as { from: string; to: string } : defaultRange()

  const { data: emp } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  if (!emp) notFound()
  const employee = emp as Employee

  const allScans = await getEmployeeScans(id, from, to)

  const totalBuckets = allScans.reduce((s, sc) => s + sc.bucket_count, 0)
  const avgPerScan = allScans.length > 0 ? (totalBuckets / allScans.length).toFixed(1) : '—'

  // Tages-Zusammenfassung für Chart
  const dailyMap = new Map<string, number>()
  allScans.forEach(sc => {
    const day = sc.scanned_at.slice(0, 10)
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + sc.bucket_count)
  })
  const dailyEntries = Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))

  const maxDay = Math.max(...dailyEntries.map(([, v]) => v), 1)

  const cardStyle = {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '8px', padding: '20px 24px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Breadcrumb */}
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
        <Link href="/employees" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Mitarbeiter
        </Link>
        {' / '}
        <span style={{ color: 'var(--text-primary)' }}>{employee.name}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '6px' }}>
            {employee.name}
          </h1>
          <code style={{
            background: 'var(--bg)', color: 'var(--text-secondary)', padding: '3px 10px',
            borderRadius: '4px', fontSize: '13px', border: '1px solid var(--border)',
          }}>
            {employee.nfc_tag_id}
          </code>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>
          Registriert {new Date(employee.created_at).toLocaleDateString('de-DE')}
        </div>
      </div>

      {/* Datumsfilter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          {formatRangeLabel(from, to)}
        </div>
        <DateRangePickerWrapper />
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Eimer im Zeitraum', value: totalBuckets },
          { label: 'Scans gesamt', value: allScans.length },
          { label: 'Ø Eimer pro Scan', value: avgPerScan },
        ].map(({ label, value }) => (
          <div key={label} style={cardStyle}>
            <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
              {label}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Tages-Chart */}
      {dailyEntries.length > 0 && (
        <div style={cardStyle}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
            Eimer je Tag
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px', overflowX: 'auto' }}>
            {dailyEntries.map(([date, count]) => (
              <div key={date} style={{ flex: '1 0 16px', minWidth: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '100%', position: 'relative', height: '60px', display: 'flex', alignItems: 'flex-end' }}>
                  <div style={{
                    width: '100%', background: 'var(--primary)',
                    height: `${(count / maxDay) * 60}px`,
                    borderRadius: '3px 3px 0 0', minHeight: '4px',
                  }} />
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {formatDate(date)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scan-Tabelle */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 600 }}>
          Alle Scans im Zeitraum
        </div>
        {allScans.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Keine Scans in diesem Zeitraum.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Zeitpunkt', 'Eimer'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '11px 24px',
                    fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--text-muted)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allScans.map((scan, i) => (
                <tr key={scan.id} style={{ borderBottom: i < allScans.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '13px 24px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                    {formatDateTime(scan.scanned_at)}
                  </td>
                  <td style={{ padding: '13px 24px' }}>
                    <span style={{
                      background: 'var(--green-soft)', color: 'var(--primary)',
                      fontWeight: 600, fontSize: '13px', padding: '2px 10px', borderRadius: '4px',
                    }}>
                      {scan.bucket_count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
