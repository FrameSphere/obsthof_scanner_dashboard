import { EmployeeSummary } from '@/lib/supabase'
import Link from 'next/link'

type Props = { summaries: EmployeeSummary[] }

function formatRate(value: number | null) {
  if (value === null) return '—'
  return value.toFixed(1)
}

function formatMinutes(value: number | null) {
  if (value === null) return '—'
  return `${value.toFixed(1)} min`
}

export default function EfficiencyChart({ summaries }: Props) {
  if (summaries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
        Keine Daten für diesen Zeitraum
      </div>
    )
  }

  const withRate = summaries.filter(s => s.bucketsPerHour !== null)
  const maxRate = Math.max(...withRate.map(s => s.bucketsPerHour as number), 1)

  return (
    <div>
      {/* Tabellenkopf */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '32px 160px 1fr 90px 90px 90px',
        gap: '16px',
        padding: '0 0 12px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        borderBottom: '1px solid var(--border)',
        marginBottom: '4px',
      }}>
        <div>#</div>
        <div>Mitarbeiter</div>
        <div>Eimer/Std.</div>
        <div style={{ textAlign: 'right' }}>Eimer</div>
        <div style={{ textAlign: 'right' }}>Min/Eimer</div>
        <div style={{ textAlign: 'right' }}>Std. ges.</div>
      </div>

      {summaries.map(({ employee, totalBuckets, bucketsPerHour, minutesPerBucket, totalWorkHours }, i) => (
        <div key={employee.id} style={{
          display: 'grid',
          gridTemplateColumns: '32px 160px 1fr 90px 90px 90px',
          alignItems: 'center',
          gap: '16px',
          padding: '12px 0',
          borderBottom: i < summaries.length - 1 ? '1px solid var(--border)' : 'none',
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 700,
            color: i === 0 && bucketsPerHour !== null ? 'var(--accent)' : 'var(--text-muted)',
          }}>
            {i + 1}
          </div>

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

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'var(--bg)', borderRadius: '3px', height: '8px', flex: 1, overflow: 'hidden' }}>
              <div style={{
                width: bucketsPerHour !== null ? `${(bucketsPerHour / maxRate) * 100}%` : '0%',
                height: '100%',
                background: 'var(--primary)',
                borderRadius: '3px',
                transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', minWidth: '34px' }}>
              {formatRate(bucketsPerHour)}
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{totalBuckets}</span>
          </div>

          <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {formatMinutes(minutesPerBucket)}
          </div>

          <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {totalWorkHours > 0 ? totalWorkHours.toFixed(1) : '—'}
          </div>
        </div>
      ))}

      {withRate.length === 0 && (
        <div style={{ marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          Für diesen Zeitraum liegen noch keine Arbeitszeiten vor — Effizienzwerte erscheinen, sobald Scans mit Start-/Endzeit vom Chip vorliegen.
        </div>
      )}
    </div>
  )
}
