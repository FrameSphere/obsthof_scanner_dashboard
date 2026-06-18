import { supabase } from '@/lib/supabase'
import { Employee } from '@/lib/supabase'

export const revalidate = 60

export default async function EmployeesPage() {
  const { data: employees, error } = await supabase
    .from('employees')
    .select('*')
    .order('name')

  if (error) {
    return <div className="text-red-500">Fehler beim Laden der Mitarbeiter.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mitarbeiter</h1>
          <p className="text-gray-500 text-sm mt-1">{employees.length} registrierte Mitarbeiter</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr className="text-left text-gray-500">
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">NFC-Chip ID</th>
              <th className="px-6 py-4 font-medium">Registriert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(employees as Employee[]).map(emp => (
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-800">{emp.name}</td>
                <td className="px-6 py-4">
                  <code className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                    {emp.nfc_tag_id}
                  </code>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(emp.created_at).toLocaleDateString('de-DE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hinweis */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        💡 Neue Mitarbeiter werden direkt in Supabase angelegt. NFC-Chip ID = der Text auf dem Chip.
      </div>
    </div>
  )
}
