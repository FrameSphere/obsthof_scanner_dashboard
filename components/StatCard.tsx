type Props = {
  label: string
  value: string | number
  sub?: string
  trend?: string
}

export default function StatCard({ label, value, sub, trend }: Props) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '20px 24px',
    }}>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '12px' }}>
        {label}
      </div>
      <div style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '6px' }}>
          {sub}
        </div>
      )}
      {trend && (
        <div style={{ fontSize: '12px', color: 'var(--accent)', marginTop: '6px', fontWeight: 500 }}>
          {trend}
        </div>
      )}
    </div>
  )
}
