import { EmployeeSummary } from '@/lib/supabase'

type Props = {
  summaries: EmployeeSummary[]
}

export default function BucketChart({ summaries }: Props) {
  if (summaries.length === 0) {
    return (
      <div className="text-center text-gray-400 py-12">
        Noch keine Daten für diesen Zeitraum
      </div>
    )
  }

  const max = Math.max(...summaries.map(s => s.totalBuckets))

  return (
    <div className="space-y-3">
      {summaries.map(({ employee, totalBuckets, scanCount }) => (
        <div key={employee.id}>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-gray-700">{employee.name}</span>
            <span className="text-gray-500">
              {totalBuckets} Eimer · {scanCount} Scans
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
            <div
              className="h-6 rounded-full bg-green-500 transition-all duration-500 flex items-center px-2"
              style={{ width: `${(totalBuckets / max) * 100}%` }}
            >
              <span className="text-white text-xs font-bold">{totalBuckets}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
