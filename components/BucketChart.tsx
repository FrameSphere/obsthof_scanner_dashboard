import { EmployeeSummary } from '@/lib/supabase'
import Link from 'next/link'

type Props = { summaries: EmployeeSummary[] }

export default function BucketChart({ summaries }: Props) {
  if (summaries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
        Keine Daten für diesen Zeitraum
      </div>
    )
  }

  const max = Math.max(...summaries.map(s => s.totalBuckets))

  return (
    <div>
      {summaries.map(({ employee, totalBuckets, scanCount }, i) => (
        <div key={employee.id} style={{
          display: 'grid',
          gridTemplateColumns: '160px 1fr 100px',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 0',
          borderBottom: i < summaries.length - 1 ? '1px solid var(--border)' : 'none',
        }}>
          <Link href={`/employees/${employee.id}`} style={{
            color: 'var(--text-primary)',
            fontWeight: 500,
            textDecoration: 'none',
            fontSize: '14px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {employee.name}
          </Link>

          <div style={{ background: 'var(--bg)', borderRadius: '3px', height: '8px', overflow: 'hidden' }}>
            <div style={{
              width: `${(totalBuckets / max) * 100}%`,
              height: '100%',
              background: 'var(--primary)',
              borderRadius: '3px',
              transition: 'width 0.4s ease',
            }} />
          </div>

          <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{totalBuckets}</span> Eimer &nbsp;·&nbsp; {scanCount}x
          </div>
        </div>
      ))}
    </div>
  )
}
