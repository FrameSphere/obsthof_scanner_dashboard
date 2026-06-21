import { supabase, EmployeeSummary, BucketScan } from '@/lib/supabase'

// Arbeitsdauer eines einzelnen Scans in Stunden (0 falls work_start/work_end fehlen)
function scanHours(scan: BucketScan): number {
  if (!scan.work_start || !scan.work_end) return 0
  const ms = new Date(scan.work_end).getTime() - new Date(scan.work_start).getTime()
  return ms > 0 ? ms / (1000 * 60 * 60) : 0
}
 
// Alle Mitarbeiter mit Eimer-Summen + Effizienz-Kennzahlen für einen Zeitraum
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
    const hours = scanHours(scan)
    const existing = map.get(scan.employee_id)
    if (existing) {
      existing.totalBuckets += scan.bucket_count
      existing.scanCount += 1
      existing.totalWorkHours += hours
    } else {
      map.set(scan.employee_id, {
        employee: scan.employees,
        totalBuckets: scan.bucket_count,
        scanCount: 1,
        lastScan: scan.scanned_at,
        totalWorkHours: hours,
        bucketsPerHour: null,
        minutesPerBucket: null,
      })
    }
  }

  const summaries = Array.from(map.values())
  for (const s of summaries) {
    if (s.totalWorkHours > 0) {
      s.bucketsPerHour = s.totalBuckets / s.totalWorkHours
      s.minutesPerBucket = (s.totalWorkHours * 60) / s.totalBuckets
    }
  }

  // Standard-Sortierung: Effizienz (Eimer/Stunde) vor reiner Gesamtmenge,
  // damit das Ranking wirklich "wer ist am schnellsten" zeigt.
  return summaries.sort((a, b) => {
    if (a.bucketsPerHour !== null && b.bucketsPerHour !== null) {
      return b.bucketsPerHour - a.bucketsPerHour
    }
    if (a.bucketsPerHour !== null) return -1
    if (b.bucketsPerHour !== null) return 1
    return b.totalBuckets - a.totalBuckets
  })
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

// Tages-Effizienz aus bereits geladenen Scans ableiten (kein zusätzlicher DB-Call).
// Liefert pro Tag: Eimer gesamt, Arbeitsstunden gesamt, Eimer/Stunde, Minuten/Eimer.
export type DailyEfficiency = {
  date: string
  totalBuckets: number
  totalHours: number
  bucketsPerHour: number | null
  minutesPerBucket: number | null
}

export function computeDailyEfficiency(scans: BucketScan[]): DailyEfficiency[] {
  const map = new Map<string, { buckets: number; hours: number }>()

  for (const scan of scans) {
    const day = scan.scanned_at.slice(0, 10)
    const hours = scanHours(scan)
    const existing = map.get(day)
    if (existing) {
      existing.buckets += scan.bucket_count
      existing.hours += hours
    } else {
      map.set(day, { buckets: scan.bucket_count, hours })
    }
  }

  return Array.from(map.entries())
    .map(([date, { buckets, hours }]) => ({
      date,
      totalBuckets: buckets,
      totalHours: hours,
      bucketsPerHour: hours > 0 ? buckets / hours : null,
      minutesPerBucket: hours > 0 ? (hours * 60) / buckets : null,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}