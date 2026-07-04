'use client'

import { useRef, useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import type { DestinationStatus } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS, SEASONS, COVER_GRADIENTS } from '@/lib/types'
import { uploadImage } from '@/lib/storage'
import { ArrowLeft, ImagePlus, Loader2 } from 'lucide-react'

export default function AddDestination() {
  const { navigate, addDestination, showToast } = useApp()
  const [name, setName] = useState('')
  const [country, setCountry] = useState('')
  const [status, setStatus] = useState<DestinationStatus>('sonho')
  const [cost, setCost] = useState('')
  const [season, setSeason] = useState('Toda época')
  const [dateLabel, setDateLabel] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [coverIndex, setCoverIndex] = useState(0)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const coverValue = coverUrl || COVER_GRADIENTS[coverIndex]

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadImage(file, 'covers')
    if (url) setCoverUrl(url)
    else showToast('Não foi possível enviar a imagem (máx. 5MB, JPG/PNG/WEBP/GIF).')
    setUploading(false)
  }

  const handleSubmit = async () => {
    if (!name.trim() || !country.trim()) return
    setSaving(true)

    // Geocode the destination silently (Nominatim, free, no key)
    let lat: number | null = null
    let lng: number | null = null
    try {
      const q = encodeURIComponent(`${name.trim()}, ${country.trim()}`)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8' } }
      )
      const data = await res.json()
      if (data[0]) {
        lat = parseFloat(data[0].lat)
        lng = parseFloat(data[0].lon)
      }
    } catch { /* geocoding optional */ }

    await addDestination({
      name: name.trim(),
      country: country.trim(),
      status,
      cost: cost ? Math.round(parseFloat(cost)) : 0,
      saved: 0,
      season,
      date_label: dateLabel || null,
      target_date: targetDate || null,
      rating: 0,
      memory: null,
      notes: null,
      cover_photo: coverValue,
      lat,
      lng,
    })
    navigate('dashboard')
  }

  return (
    <main
      style={{
        maxWidth: 720, margin: '0 auto',
        padding: 'clamp(22px,4vw,42px) clamp(16px,3vw,34px)',
        animation: 'boraFade .4s ease both',
      }}
    >
      <button
        onClick={() => navigate('dashboard')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#8A8178', fontSize: 14, fontWeight: 500, marginBottom: 24,
        }}
      >
        <ArrowLeft size={16} />
        Voltar para a lista
      </button>

      <h1
        style={{
          fontFamily: 'var(--font-bricolage), sans-serif',
          fontWeight: 800, fontSize: 'clamp(28px,4vw,40px)',
          letterSpacing: '-0.03em', color: '#2B2622', marginBottom: 28,
        }}
      >
        Pra onde dessa vez?
      </h1>

      <div style={{ background: '#fff', border: '1px solid #EFE6D7', borderRadius: 20, padding: '28px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Cover photo */}
        <div>
          <label style={labelStyle}>Foto de capa</label>

          {/* Preview */}
          <div
            style={{
              height: 140, borderRadius: 14, marginBottom: 12,
              backgroundImage: coverUrl ? `url(${coverUrl})` : coverValue,
              backgroundSize: 'cover', backgroundPosition: 'center',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
            }}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={28} style={{ color: '#fff', animation: 'spin 1s linear infinite' }} />
              </div>
            )}
            {!coverUrl && !uploading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,.8)' }}>
                <ImagePlus size={24} />
                <span style={{ fontSize: 12, fontWeight: 600 }}>Clique para fazer upload</span>
              </div>
            )}
            {coverUrl && !uploading && (
              <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,.5)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>
                <span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>Trocar foto</span>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {/* Gradient fallbacks */}
          {!coverUrl && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {COVER_GRADIENTS.map((grad, i) => (
                <button
                  key={i}
                  onClick={() => setCoverIndex(i)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, background: grad,
                    border: coverIndex === i ? '2.5px solid #2B2622' : '2.5px solid transparent',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
          )}
          {coverUrl && (
            <button onClick={() => { setCoverUrl(null) }} style={{ fontSize: 12, color: '#8A8178', background: 'none', border: 'none', cursor: 'pointer' }}>
              Remover foto e usar gradiente
            </button>
          )}
        </div>

        {/* Name */}
        <Field label="Nome do destino *">
          <input
            type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="ex: Tóquio, Lençóis Maranhenses..."
            style={inputStyle}
          />
        </Field>

        {/* Country */}
        <Field label="País *">
          <input
            type="text" value={country} onChange={e => setCountry(e.target.value)}
            placeholder="ex: Japão, Brasil..."
            style={inputStyle}
          />
        </Field>

        {/* Status */}
        <Field label="Status">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['sonho', 'embreve', 'planejando', 'jafui'] as DestinationStatus[]).map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                style={{
                  padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: 600,
                  background: status === s ? STATUS_COLORS[s] : '#F1E9DC',
                  color: status === s ? '#fff' : '#8A8178',
                  transition: 'all .15s',
                }}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </Field>

        {/* Cost */}
        <Field label="Custo estimado (R$)">
          <input
            type="number" value={cost} onChange={e => setCost(e.target.value)}
            placeholder="ex: 5000"
            style={inputStyle}
          />
        </Field>

        {/* Season */}
        <Field label="Melhor época">
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {SEASONS.map(s => (
              <button
                key={s}
                onClick={() => setSeason(s)}
                style={{
                  padding: '6px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  background: season === s ? '#2B2622' : '#F1E9DC',
                  color: season === s ? '#fff' : '#8A8178',
                  transition: 'all .15s',
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        {/* Date */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Período (ex: Out 2026)">
            <input
              type="text" value={dateLabel} onChange={e => setDateLabel(e.target.value)}
              placeholder="Out 2026"
              style={inputStyle}
            />
          </Field>
          <Field label="Data prevista">
            <input
              type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <button
            onClick={handleSubmit}
            disabled={saving || uploading || !name.trim() || !country.trim()}
            style={{
              flex: 1, padding: '12px 20px', borderRadius: 12, border: 'none',
              background: '#E8714C', color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: saving || uploading || !name.trim() || !country.trim() ? 'not-allowed' : 'pointer',
              opacity: saving || uploading || !name.trim() || !country.trim() ? .5 : 1,
              boxShadow: '0 8px 18px -8px rgba(232,113,76,.8)',
              transition: 'all .15s',
            }}
          >
            {saving ? 'Adicionando...' : 'Adicionar à lista'}
          </button>
          <button
            onClick={() => navigate('dashboard')}
            style={{
              padding: '12px 20px', borderRadius: 12,
              border: '1.5px solid #EFE6D7', background: '#fff',
              color: '#8A8178', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 11,
  border: '1.5px solid #EFE6D7', background: '#FBF9F4',
  fontSize: 14, color: '#2B2622', fontFamily: 'inherit',
}

const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: '#8A8178',
  textTransform: 'uppercase', letterSpacing: '.08em',
  display: 'block', marginBottom: 7,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}
