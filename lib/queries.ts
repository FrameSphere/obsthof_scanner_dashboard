import { supabase, EmployeeSummary, BucketScan } from '@/lib/supabase'

// Alle Mitarbeiter mit Eimer-Summen für einen Zeitraum
export async function getEmployeeSummaries(from: string, to: string): Promise<EmployeeSummary[]> {
  const { data: scans, error } = await supabase
    .from('bucket_scans')
    .select('*, employees(*)')
    .gte('scanned_at', from)
    .lte('scanned_at', to)
    .order('scanned_at', { ascending: false })

  if (error) throw error
  if (!scans) return []

  // Gruppieren nach Mitarbeiter
  const map = new Map<string, EmployeeSummary>()
  for (const scan of scans as BucketScan[]) {
    if (!scan.employees) continue
    const existing = map.get(scan.employee_id)
    if (existing) {
      existing.totalBuckets += scan.bucket_count
      existing.scanCount += 1
    } else {
      map.set(scan.employee_id, {
        employee: scan.employees,
        totalBuckets: scan.bucket_count,
        scanCount: 1,
        lastScan: scan.scanned_at,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalBuckets - a.totalBuckets)
}

// Letzte N Scans
export async function getRecentScans(limit = 20): Promise<BucketScan[]> {
  const { data, error } = await supabase
    .from('bucket_scans')
    .select('*, employees(*)')
    .order('scanned_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

// Tages-Verlauf (Eimer pro Tag) für Chart
export async function getDailyTotals(days = 14): Promise<{ date: string; total: number }[]> {
  const from = new Date()
  from.setDate(from.getDate() - days)

  const { data, error } = await supabase
    .from('bucket_scans')
    .select('bucket_count, scanned_at')
    .gte('scanned_at', from.toISOString())
    .order('scanned_at', { ascending: true })

  if (error) throw error
  if (!data) return []

  const totals = new Map<string, number>()
  for (const scan of data) {
    const day = scan.scanned_at.slice(0, 10)
    totals.set(day, (totals.get(day) ?? 0) + scan.bucket_count)
  }

  return Array.from(totals.entries()).map(([date, total]) => ({ date, total }))
}
