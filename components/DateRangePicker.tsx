'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

type Preset = {
  label: string
  key: string
  getRange: () => { from: string; to: string }
}

function toISO(date: Date, endOfDay = false) {
  const d = new Date(date)
  if (endOfDay) { d.setHours(23, 59, 59, 999) } else { d.setHours(0, 0, 0, 0) }
  return d.toISOString()
}

function localDate(daysAgo = 0) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d
}

function toInputValue(iso: string) {
  return iso.slice(0, 10)
}

const PRESETS: Preset[] = [
  { label: 'Heute', key: 'today', getRange: () => ({ from: toISO(localDate(0)), to: toISO(localDate(0), true) }) },
  { label: 'Gestern', key: 'yesterday', getRange: () => ({ from: toISO(localDate(1)), to: toISO(localDate(1), true) }) },
  { label: 'Letzte 7 Tage', key: '7d', getRange: () => ({ from: toISO(localDate(6)), to: toISO(localDate(0), true) }) },
  { label: 'Letzte 30 Tage', key: '30d', getRange: () => ({ from: toISO(localDate(29)), to: toISO(localDate(0), true) }) },
  { label: 'Dieser Monat', key: 'month', getRange: () => { const d = new Date(); d.setDate(1); return { from: toISO(d), to: toISO(localDate(0), true) } } },
]

export default function DateRangePicker() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const [activePreset, setActivePreset] = useState<string>('today')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  // Beim ersten Laden: falls keine Params → heute setzen
  useEffect(() => {
    if (!params.get('from')) {
      applyPreset(PRESETS[0])
    } else {
      const from = params.get('from')!
      const to = params.get('to')!
      const matched = PRESETS.find(p => {
        const r = p.getRange()
        return r.from.slice(0, 10) === from.slice(0, 10) && r.to.slice(0, 10) === to.slice(0, 10)
      })
      if (matched) { setActivePreset(matched.key) }
      else { setActivePreset('custom'); setCustomFrom(from.slice(0, 10)); setCustomTo(to.slice(0, 10)); setShowCustom(true) }
    }
  }, [])

  function applyPreset(preset: Preset) {
    const { from, to } = preset.getRange()
    setActivePreset(preset.key)
    setShowCustom(false)
    const sp = new URLSearchParams(params.toString())
    sp.set('from', from)
    sp.set('to', to)
    router.push(`${pathname}?${sp.toString()}`)
  }

  function applyCustom() {
    if (!customFrom || !customTo) return
    const from = toISO(new Date(customFrom))
    const to = toISO(new Date(customTo), true)
    setActivePreset('custom')
    const sp = new URLSearchParams(params.toString())
    sp.set('from', from)
    sp.set('to', to)
    router.push(`${pathname}?${sp.toString()}`)
  }

  const btnBase: React.CSSProperties = {
    padding: '6px 14px', fontSize: '13px', fontWeight: 500,
    border: '1px solid var(--border)', borderRadius: '6px',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
  }

  const activeStyle: React.CSSProperties = {
    ...btnBase, background: 'var(--primary)', color: 'white', border: '1px solid var(--primary)',
  }

  const inactiveStyle: React.CSSProperties = {
    ...btnBase, background: 'var(--surface)', color: 'var(--text-secondary)',
  }

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px', fontSize: '13px', border: '1px solid var(--border)',
    borderRadius: '6px', fontFamily: 'inherit', color: 'var(--text-primary)',
    background: 'var(--surface)', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      {PRESETS.map(preset => (
        <button
          key={preset.key}
          onClick={() => applyPreset(preset)}
          style={activePreset === preset.key ? activeStyle : inactiveStyle}
        >
          {preset.label}
        </button>
      ))}

      <button
        onClick={() => { setShowCustom(v => !v); setActivePreset('custom') }}
        style={activePreset === 'custom' ? activeStyle : inactiveStyle}
      >
        Benutzerdefiniert
      </button>

      {showCustom && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '4px' }}>
          <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} style={inputStyle} />
          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>bis</span>
          <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} style={inputStyle} />
          <button onClick={applyCustom} style={{
            ...btnBase, background: 'var(--accent)', color: 'white',
            border: '1px solid var(--accent)', fontWeight: 600,
          }}>
            Anwenden
          </button>
        </div>
      )}
    </div>
  )
}
