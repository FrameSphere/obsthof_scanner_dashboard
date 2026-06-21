import { BucketScan } from '@/lib/supabase'

type Props = { scans: BucketScan[] }

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

function workHours(scan: BucketScan): number | null {
  if (!scan.work_start || !scan.work_end) return null
  const ms = new Date(scan.work_end).getTime() - new Date(scan.work_start).getTime()
  return ms > 0 ? ms / (1000 * 60 * 60) : null
}

export default function RecentScans({ scans }: Props) {
  if (scans.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
        Noch keine Scans vorhanden
      </div>
    )
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border)' }}>
          {['Mitarbeiter', 'Eimer', 'Arbeitszeit', 'Eimer/Std.', 'Erfasst'].map(h => (
            <th key={h} style={{
              textAlign: 'left',
              padding: '0 0 12px',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
            }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {scans.map((scan, i) => {
          const hours = workHours(scan)
          const rate = hours !== null ? scan.bucket_count / hours : null
          return (
            <tr key={scan.id} style={{ borderBottom: i < scans.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <td style={{ padding: '13px 0', fontWeight: 500, color: 'var(--text-primary)' }}>
                {scan.employees?.name ?? '—'}
              </td>
              <td style={{ padding: '13px 0' }}>
                <span style={{
                  display: 'inline-block',
                  background: 'var(--green-soft)',
                  color: 'var(--primary)',
                  fontWeight: 600,
                  fontSize: '13px',
                  padding: '2px 10px',
                  borderRadius: '4px',
                }}>
                  {scan.bucket_count}
                </span>
              </td>
              <td style={{ padding: '13px 0', color: 'var(--text-secondary)', fontSize: '13px' }}>
                {scan.work_start && scan.work_end
                  ? `${formatTime(scan.work_start)} – ${formatTime(scan.work_end)}`
                  : '—'}
              </td>
              <td style={{ padding: '13px 0', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600 }}>
                {rate !== null ? rate.toFixed(1) : '—'}
              </td>
              <td style={{ padding: '13px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                {formatDateTime(scan.scanned_at)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
