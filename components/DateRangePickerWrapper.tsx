'use client'
import { Suspense } from 'react'
import DateRangePicker from './DateRangePicker'

export default function DateRangePickerWrapper() {
  return (
    <Suspense fallback={
      <div style={{ height: '36px', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
        Lade Filter…
      </div>
    }>
      <DateRangePicker />
    </Suspense>
  )
}
