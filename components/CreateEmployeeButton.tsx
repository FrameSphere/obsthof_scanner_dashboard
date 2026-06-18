'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function CreateEmployeeButton() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [nfcId, setNfcId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit() {
    if (!name.trim() || !nfcId.trim()) { setError('Alle Felder ausfüllen.'); return }
    setLoading(true); setError('')
    const { error: err } = await supabase.from('employees').insert({ name: name.trim(), nfc_tag_id: nfcId.trim() })
    setLoading(false)
    if (err) { setError(err.message); return }
    setOpen(false); setName(''); setNfcId('')
    router.refresh()
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', fontSize: '14px',
    border: '1px solid var(--border)', borderRadius: '6px',
    background: 'var(--bg)', color: 'var(--text-primary)',
    outline: 'none', fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block', fontSize: '12px', fontWeight: 600,
    color: 'var(--text-secondary)', marginBottom: '6px',
    letterSpacing: '0.04em', textTransform: 'uppercase' as const,
  }

  return (
    <>
      <button onClick={() => setOpen(true)} style={{
        background: 'var(--primary)', color: 'white',
        border: 'none', borderRadius: '6px', padding: '9px 18px',
        fontSize: '14px', fontWeight: 600, cursor: 'pointer',
        fontFamily: 'inherit',
      }}>
        Mitarbeiter anlegen
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50,
        }} onClick={() => setOpen(false)}>
          <div style={{
            background: 'white', borderRadius: '10px', padding: '32px',
            width: '420px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '24px', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Neuer Mitarbeiter
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Name</label>
              <input style={inputStyle} placeholder="z. B. Hans Müller" value={name} onChange={e => setName(e.target.value)} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>NFC-Chip ID</label>
              <input style={inputStyle} placeholder="z. B. MA-004" value={nfcId} onChange={e => setNfcId(e.target.value)} />
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Der Text der mit NFC Tools auf den Chip geschrieben wurde.
              </div>
            </div>

            {error && (
              <div style={{ background: 'var(--red-soft)', color: 'var(--red)', borderRadius: '6px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setOpen(false)} style={{
                background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
                padding: '9px 16px', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
                color: 'var(--text-secondary)',
              }}>
                Abbrechen
              </button>
              <button onClick={handleSubmit} disabled={loading} style={{
                background: 'var(--primary)', color: 'white', border: 'none',
                borderRadius: '6px', padding: '9px 18px', fontSize: '14px',
                fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
              }}>
                {loading ? 'Speichern…' : 'Anlegen'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
