'use client'

import dynamic from 'next/dynamic'
import { useApp } from '@/contexts/AppContext'

const MaplibreMap = dynamic(() => import('./MaplibreMapInner'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: 440, borderRadius: 24,
        background: 'linear-gradient(135deg, #C8D8E8 0%, #D4E4D0 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '1.5px solid #C8B9A5',
        marginBottom: 12,
      }}
    >
      <span style={{ fontSize: 13, color: '#8A8178', fontWeight: 500 }}>Carregando mapa…</span>
    </div>
  ),
})

export default function MapView() {
  const { destinations, navigate } = useApp()

  return (
    <main
      style={{
        maxWidth: 1180, margin: '0 auto',
        padding: 'clamp(22px,4vw,42px) clamp(16px,3vw,34px)',
        animation: 'boraFade .4s ease both',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <h2
          style={{
            fontFamily: 'var(--font-bricolage), sans-serif',
            fontWeight: 800, fontSize: 'clamp(24px,3.5vw,36px)',
            letterSpacing: '-0.03em', color: '#2B2622',
          }}
        >
          Seus destinos no mapa
        </h2>
        {destinations.length > 0 && (
          <span style={{ fontSize: 14, color: '#8A8178', fontWeight: 500 }}>
            {destinations.length} destino{destinations.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <MaplibreMap destinations={destinations} navigate={navigate} />
    </main>
  )
}
