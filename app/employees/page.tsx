import { supabase } from '@/lib/supabase'
import { Employee } from '@/lib/supabase'
import Link from 'next/link'
import CreateEmployeeButton from '@/components/CreateEmployeeButton'

export const revalidate = 60

export default async function EmployeesPage() {
  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .order('name')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Verwaltung
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Mitarbeiter
          </h1>
        </div>
        <CreateEmployeeButton />
      </div>

      {/* Tabelle */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
        {error ? (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--red)' }}>
            Fehler beim Laden der Mitarbeiter.
          </div>
        ) : (employees as Employee[]).length === 0 ? (
          <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            Noch keine Mitarbeiter angelegt.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                {['Name', 'NFC-Chip ID', 'Registriert', ''].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '12px 20px',
                    fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: 'var(--text-muted)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(employees as Employee[]).map((emp, i) => (
                <tr key={emp.id} style={{ borderBottom: i < employees.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {emp.name}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <code style={{
                      background: 'var(--bg)', color: 'var(--text-secondary)',
                      padding: '3px 8px', borderRadius: '4px', fontSize: '13px',
                      border: '1px solid var(--border)',
                    }}>
                      {emp.nfc_tag_id}
                    </code>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                    {new Date(emp.created_at).toLocaleDateString('de-DE')}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <Link href={`/employees/${emp.id}`} style={{
                      color: 'var(--accent)', fontSize: '13px', fontWeight: 500,
                      textDecoration: 'none',
                    }}>
                      Details
                    </Link>
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
