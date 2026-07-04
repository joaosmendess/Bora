'use client'

import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { Destination, Screen } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/types'

// [lat, lng] format
const COORDS: Record<string, [number, number]> = {
  'japão': [36, 138], 'tokyo': [35.7, 139.7], 'tóquio': [35.7, 139.7],
  'brasil': [-14, -51], 'rio de janeiro': [-22.9, -43.2], 'são paulo': [-23.5, -46.6],
  'paris': [48.9, 2.35], 'france': [46, 2], 'franca': [46, 2],
  'itália': [42.5, 12.5], 'italy': [42.5, 12.5], 'roma': [41.9, 12.5], 'veneza': [45.4, 12.3],
  'new york': [40.7, -74], 'eua': [37, -95], 'estados unidos': [37, -95], 'los angeles': [34, -118.2],
  'argentina': [-34, -64], 'buenos aires': [-34.6, -58.4],
  'portugal': [39.5, -8], 'lisboa': [38.7, -9.1],
  'espanha': [40, -4], 'barcelona': [41.4, 2.2], 'madrid': [40.4, -3.7],
  'grécia': [39.1, 21.8], 'atenas': [37.9, 23.7], 'santorini': [36.4, 25.4],
  'tailândia': [15, 101], 'bangkok': [13.8, 100.5], 'bali': [-8.4, 115.2],
  'austrália': [-25, 133], 'sydney': [-33.9, 151.2],
  'canadá': [56, -96], 'toronto': [43.7, -79.4], 'vancouver': [49.3, -123.1],
  'méxico': [23, -102], 'cancun': [21.2, -86.9],
  'peru': [-9.2, -75], 'machu picchu': [-13.2, -72.5], 'lima': [-12, -77],
  'colômbia': [4, -72], 'cartagena': [10.4, -75.5],
  'chile': [-30, -71], 'santiago': [-33.5, -70.7],
  'marrocos': [32, -5], 'marrakech': [31.6, -8],
  'egito': [26, 30], 'cairo': [30.1, 31.2],
  'quênia': [-1, 37], 'nairóbi': [-1.3, 36.8],
  'índia': [20, 77], 'nova delhi': [28.6, 77.2], 'mumbai': [19.1, 72.9],
  'china': [35, 105], 'pequim': [39.9, 116.4], 'xangai': [31.2, 121.5],
  'coreia do sul': [37, 128], 'seoul': [37.6, 126.9],
  'islândia': [65, -18], 'reykjavik': [64.1, -22],
  'noruega': [60, 8], 'oslo': [59.9, 10.7],
  'suíça': [47, 8], 'zurique': [47.4, 8.5],
  'alemanha': [51, 10], 'berlim': [52.5, 13.4],
  'reino unido': [55, -3], 'londres': [51.5, -0.1],
  'holanda': [52.3, 5.3], 'amsterdam': [52.4, 4.9],
  'irlanda': [53, -8], 'dublin': [53.3, -6.3],
  'turquia': [39, 35], 'istanbul': [41.0, 29], 'capadócia': [38.7, 34.8],
  'indonesia': [-5, 113], 'vietnã': [14, 108], 'hoi an': [15.9, 108.3],
  'filipinas': [12, 122], 'singapura': [1.35, 103.8],
  'dubai': [25.2, 55.3], 'emirados árabes': [24, 54],
  'áfrica do sul': [-29, 25], 'cape town': [-33.9, 18.4],
  'tanzânia': [-6, 35], 'zanzibar': [-6.2, 39.4],
  'maldivas': [3.2, 73], 'cuba': [22, -80], 'havana': [23.1, -82.4],
  'croácia': [45.1, 15.2], 'dubrovnik': [42.6, 18.1], 'split': [43.5, 16.4],
  'hungria': [47.2, 19.5], 'budapeste': [47.5, 19.1],
  'república tcheca': [50, 15.5], 'praga': [50.1, 14.4],
  'áustria': [47.5, 14], 'viena': [48.2, 16.4],
  'polônia': [51.9, 19.1], 'varsóvia': [52.2, 21],
  'suécia': [62, 15], 'estocolmo': [59.3, 18.1],
  'dinamarca': [56, 10], 'copenhague': [55.7, 12.6],
  'finlândia': [64, 26], 'helsinki': [60.2, 25],
}

function getCoords(dest: Destination): [number, number] | null {
  // Prefer geocoded coordinates stored in the database
  if (dest.lat != null && dest.lng != null) return [dest.lat, dest.lng]

  // Fallback: fuzzy match against built-in dictionary
  const key = dest.country.toLowerCase()
  for (const [k, v] of Object.entries(COORDS)) {
    if (key.includes(k) || k.includes(key)) return v
  }
  const nameKey = dest.name.toLowerCase()
  for (const [k, v] of Object.entries(COORDS)) {
    if (nameKey.includes(k) || k.includes(nameKey)) return v
  }
  return null
}

interface Props {
  destinations: Destination[]
  navigate: (screen: Screen, dest?: Destination) => void
}

export default function MaplibreMapInner({ destinations, navigate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const rafRef = useRef<number>(0)
  const spinningRef = useRef(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [hoveredDest, setHoveredDest] = useState<Destination | null>(null)

  // Init globe
  useEffect(() => {
    if (!containerRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [20, 20],
      zoom: 1.5,
      attributionControl: false,
    })

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: false }),
      'bottom-right'
    )
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      'bottom-left'
    )

    // Stop auto-spin on interaction
    const stopSpin = () => {
      spinningRef.current = false
      cancelAnimationFrame(rafRef.current)
    }
    map.on('mousedown', stopSpin)
    map.on('touchstart', stopSpin)

    map.on('load', () => {
      // Globe projection (fallback for older versions)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(map as any).setProjection({ type: 'globe' })
      } catch { /* already set or not supported */ }

      // Sky atmosphere — warm blue, no space/stars
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(map as any).setFog({
          'color': 'rgba(200, 230, 245, 0.5)',
          'high-color': 'rgba(80, 160, 220, 0.9)',
          'horizon-blend': 0.04,
          'space-color': '#5BA8D4',
          'star-intensity': 0,
        })
      } catch { /* not supported */ }

      // Colorful country fills (Natural Earth, MAPCOLOR7)
      try {
        map.addSource('ne-countries', {
          type: 'geojson',
          data: 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson',
        })

        // Insert below labels but above water/land base
        const firstSymbolId = map.getStyle().layers.find(l => l.type === 'symbol')?.id

        map.addLayer({
          id: 'ne-country-fills',
          type: 'fill',
          source: 'ne-countries',
          paint: {
            'fill-color': [
              'match', ['get', 'MAPCOLOR7'],
              1, '#F4B353',
              2, '#E8714C',
              3, '#2FA39A',
              4, '#88B86A',
              5, '#A882D4',
              6, '#5B96E8',
              7, '#E8708A',
              '#D4C9BA',
            ],
            'fill-opacity': 0.78,
          },
        } as maplibregl.FillLayerSpecification, firstSymbolId)

        map.addLayer({
          id: 'ne-country-borders',
          type: 'line',
          source: 'ne-countries',
          paint: {
            'line-color': 'rgba(255,255,255,0.55)',
            'line-width': 0.6,
          },
        } as maplibregl.LineLayerSpecification, firstSymbolId)
      } catch (e) {
        console.warn('Country fills unavailable:', e)
      }

      setMapLoaded(true)

      // Gentle auto-spin
      const spin = () => {
        if (!spinningRef.current || !mapRef.current) return
        const c = map.getCenter()
        map.setCenter([c.lng - 0.12, c.lat])
        rafRef.current = requestAnimationFrame(spin)
      }
      spin()
    })

    mapRef.current = map

    return () => {
      spinningRef.current = false
      cancelAnimationFrame(rafRef.current)
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Sync markers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const map = mapRef.current

    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    destinations.forEach(dest => {
      const coords = getCoords(dest)
      if (!coords) return
      const [lat, lng] = coords
      const color = STATUS_COLORS[dest.status]

      const el = document.createElement('div')
      el.style.cssText = 'cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:3px;'

      const label = document.createElement('div')
      label.textContent = dest.name
      label.style.cssText = [
        'white-space:nowrap',
        'background:rgba(251,247,239,.96)',
        'color:#2B2622',
        'font-size:11px',
        'font-weight:700',
        'padding:3px 9px',
        'border-radius:8px',
        'box-shadow:0 1px 8px rgba(43,38,34,.2)',
        'pointer-events:none',
        "font-family:'Plus Jakarta Sans',system-ui,sans-serif",
        'transition:transform .12s,box-shadow .12s',
        'will-change:transform',
      ].join(';')

      const pinWrap = document.createElement('div')
      pinWrap.style.cssText = 'transition:transform .12s;will-change:transform;'
      pinWrap.innerHTML = `
        <svg width="28" height="34" viewBox="0 0 28 34" fill="none" xmlns="http://www.w3.org/2000/svg" style="display:block;filter:drop-shadow(0 2px 8px ${color}90)">
          <path d="M14 2C7.9 2 3 6.9 3 13C3 21.5 14 32 14 32C14 32 25 21.5 25 13C25 6.9 20.1 2 14 2Z" fill="${color}" stroke="white" stroke-width="2.2"/>
          <circle cx="14" cy="12" r="5" fill="rgba(255,255,255,0.38)"/>
          <circle cx="11.5" cy="9.5" r="2" fill="rgba(255,255,255,0.22)"/>
        </svg>
      `

      el.appendChild(label)
      el.appendChild(pinWrap)

      el.addEventListener('mouseenter', () => {
        setHoveredDest(dest)
        pinWrap.style.transform = 'scale(1.22) translateY(-2px)'
        label.style.transform = 'scale(1.06)'
        label.style.boxShadow = '0 3px 14px rgba(43,38,34,.25)'
      })
      el.addEventListener('mouseleave', () => {
        setHoveredDest(null)
        pinWrap.style.transform = 'scale(1)'
        label.style.transform = 'scale(1)'
        label.style.boxShadow = '0 1px 8px rgba(43,38,34,.2)'
      })
      el.addEventListener('click', () => navigate('detail', dest))

      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([lng, lat])
        .addTo(map)

      markersRef.current.push(marker)
    })
  }, [mapLoaded, destinations, navigate])

  const unmapped = destinations.filter(d => !getCoords(d)).length

  return (
    <>
      <style>{`
        .maplibregl-ctrl-group {
          border-radius: 12px !important;
          box-shadow: 0 2px 12px rgba(0,0,0,.25) !important;
          overflow: hidden;
          border: none !important;
        }
        .maplibregl-ctrl-group button {
          background: rgba(251,247,239,.9) !important;
          backdrop-filter: blur(8px);
        }
        .maplibregl-ctrl-group button:hover {
          background: rgba(251,247,239,1) !important;
        }
        .maplibregl-ctrl-attrib {
          font-size: 10px !important;
          background: rgba(251,247,239,.7) !important;
          border-radius: 6px !important;
        }
        .maplibregl-ctrl-attrib a { color: #8A8178 !important; }
      `}</style>

      {/* Globe */}
      <div
        style={{
          borderRadius: 24, overflow: 'hidden',
          border: '1.5px solid #7BBEDD',
          boxShadow: '0 12px 40px -8px rgba(60,120,180,.25)',
          marginBottom: 12,
          background: 'radial-gradient(ellipse at 50% 35%, #A8D8EE 0%, #5BA8D4 50%, #3A80B0 100%)',
        }}
      >
        <div ref={containerRef} style={{ height: 500 }} />
      </div>

      {/* Hint */}
      {mapLoaded && (
        <p style={{ fontSize: 11, color: '#B0A898', marginBottom: 10, fontWeight: 500 }}>
          Arraste para girar · scroll para zoom · clique num pin para abrir
        </p>
      )}

      {/* Hover info card */}
      <div style={{ minHeight: 58, marginBottom: 16 }}>
        {hoveredDest ? (
          <div
            style={{
              padding: '12px 16px', background: '#fff',
              border: `1.5px solid ${STATUS_COLORS[hoveredDest.status]}45`,
              borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: `0 4px 16px -4px ${STATUS_COLORS[hoveredDest.status]}28`,
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: STATUS_COLORS[hoveredDest.status] + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[hoveredDest.status] }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#2B2622' }}>{hoveredDest.name}</div>
              <div style={{ fontSize: 12, color: '#8A8178', marginTop: 2 }}>
                {hoveredDest.country}
                <span style={{ margin: '0 5px', opacity: 0.35 }}>·</span>
                {STATUS_LABELS[hoveredDest.status]}
                {hoveredDest.date_label && (
                  <><span style={{ margin: '0 5px', opacity: 0.35 }}>·</span>{hoveredDest.date_label}</>
                )}
              </div>
            </div>
            {hoveredDest.cost > 0 && (
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2B2622', flexShrink: 0 }}>
                R$ {hoveredDest.cost.toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        ) : (
          <p style={{ fontSize: 12, color: '#B0A898', fontWeight: 500, paddingTop: 6 }}>
            Passe o mouse sobre um pin para ver os detalhes
          </p>
        )}
      </div>

      {unmapped > 0 && (
        <p style={{ fontSize: 12, color: '#B0A898', marginBottom: 14 }}>
          {unmapped} destino{unmapped !== 1 ? 's' : ''} sem localização — verifique a grafia do campo País
        </p>
      )}

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#B0A898', textTransform: 'uppercase', letterSpacing: '.06em' }}>
          Status
        </span>
        {(['sonho', 'embreve', 'planejando', 'jafui'] as const).map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s], boxShadow: `0 0 0 2.5px ${STATUS_COLORS[s]}30` }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#8A8178' }}>{STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>
    </>
  )
}
