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

// Letzte Scans — optional auf Zeitraum eingeschränkt
export async function getRecentScans(limit = 20, from?: string, to?: string): Promise<BucketScan[]> {
  let query = supabase
    .from('bucket_scans')
    .select('*, employees(*)')
    .order('scanned_at', { ascending: false })
    .limit(limit)

  if (from) query = query.gte('scanned_at', from)
  if (to) query = query.lte('scanned_at', to)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

// Tages-Verlauf (Eimer pro Tag) für Chart — optional auf Zeitraum eingeschränkt
export async function getDailyTotals(from?: string, to?: string): Promise<{ date: string; total: number }[]> {
  let query = supabase
    .from('bucket_scans')
    .select('bucket_count, scanned_at')
    .order('scanned_at', { ascending: true })

  if (from) query = query.gte('scanned_at', from)
  if (to) query = query.lte('scanned_at', to)

  const { data, error } = await query
  if (error) throw error
  if (!data) return []

  const totals = new Map<string, number>()
  for (const scan of data) {
    const day = scan.scanned_at.slice(0, 10)
    totals.set(day, (totals.get(day) ?? 0) + scan.bucket_count)
  }

  return Array.from(totals.entries()).map(([date, total]) => ({ date, total }))
}

// Einzelner Mitarbeiter — Scans in einem Zeitraum
export async function getEmployeeScans(employeeId: string, from: string, to: string): Promise<BucketScan[]> {
  const { data, error } = await supabase
    .from('bucket_scans')
    .select('*')
    .eq('employee_id', employeeId)
    .gte('scanned_at', from)
    .lte('scanned_at', to)
    .order('scanned_at', { ascending: false })

  if (error) throw error
  return data ?? []
}