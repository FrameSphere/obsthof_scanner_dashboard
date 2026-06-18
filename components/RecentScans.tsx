import { BucketScan } from '@/lib/supabase'

type Props = {
  scans: BucketScan[]
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('de-DE', {
    day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function RecentScans({ scans }: Props) {
  if (scans.length === 0) {
    return <div className="text-center text-gray-400 py-8">Keine Scans vorhanden</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-left text-gray-500">
            <th className="pb-3 font-medium">Mitarbeiter</th>
            <th className="pb-3 font-medium">Eimer</th>
            <th className="pb-3 font-medium">Uhrzeit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {scans.map(scan => (
            <tr key={scan.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 font-medium text-gray-800">
                {scan.employees?.name ?? scan.employee_id}
              </td>
              <td className="py-3">
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-semibold">
                  🧺 {scan.bucket_count}
                </span>
              </td>
              <td className="py-3 text-gray-500">{formatTime(scan.scanned_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
