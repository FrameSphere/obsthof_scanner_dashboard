type Props = {
  label: string
  value: string | number
  sub?: string
  icon: string
  color: 'green' | 'blue' | 'orange' | 'red'
}

const colors = {
  green: 'bg-green-50 text-green-700 border-green-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-red-50 text-red-700 border-red-200',
}

export default function StatCard({ label, value, sub, icon, color }: Props) {
  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-70">{label}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {sub && <div className="text-xs mt-1 opacity-60">{sub}</div>}
    </div>
  )
}
