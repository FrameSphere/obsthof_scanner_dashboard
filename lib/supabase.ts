import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// MARK: - Typen
export type Employee = {
  id: string
  name: string
  nfc_tag_id: string
  created_at: string
}

export type BucketScan = {
  id: string
  employee_id: string
  bucket_count: number
  work_start: string | null
  work_end: string | null
  scanned_at: string
  employees?: Employee
}

export type EmployeeSummary = {
  employee: Employee
  totalBuckets: number
  scanCount: number
  lastScan: string | null
  totalWorkHours: number
  bucketsPerHour: number | null
  minutesPerBucket: number | null
}
