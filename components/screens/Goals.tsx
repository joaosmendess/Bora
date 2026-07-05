'use client'

import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import type { Destination, DestinationStatus } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS, STATUS_BG, COVER_GRADIENTS } from '@/lib/types'
import { GripVertical, ChevronDown } from 'lucide-react'
import { colors } from '@/lib/colors'

const COLUMNS: { status: DestinationStatus }[] = [
  { status: 'sonho' },
  { status: 'embreve' },
  { status: 'planejando' },
  { status: 'jafui' },
]

function GoalCard({
  destination: d,
  draggingId,
  onDragStart,
  onStatusChange,
}: {
  destination: Destination
  draggingId: string | null
  onDragStart: (id: string) => void
  onStatusChange: (id: string, status: DestinationStatus) => void
}) {
  const { navigate } = useApp()
  const [showPicker, setShowPicker] = useState(false)
  const isDragging = draggingId === d.id

  return (
    <div
      draggable
      onDragStart={() => onDragStart(d.id)}
      style={{
        background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 12,
        padding: '12px 14px', marginBottom: 8,
        transition: 'box-shadow .15s, opacity .15s',
        opacity: isDragging ? 0.4 : 1,
        display: 'flex', gap: 10, alignItems: 'flex-start',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!isDragging) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(43,38,34,.1)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '' }}
    >
      {/* Drag handle */}
      <div
        style={{ cursor: 'grab', color: colors['text-muted'], marginTop: 2, flexShrink: 0 }}
        title="Arraste para mover"
      >
        <GripVertical size={16} />
      </div>

      {/* Cover thumb */}
      <div
        onClick={() => navigate('detail', d)}
        style={{
          width: 40, height: 40, borderRadius: 8, flexShrink: 0, cursor: 'pointer',
          backgroundImage: (d.cover_photo && d.cover_photo.startsWith('http')) ? `url(${d.cover_photo})` : (d.cover_photo || COVER_GRADIENTS[0]),
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate('detail', d)}>
        <p style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: 14, color: colors.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {d.name}
        </p>
        <p style={{ fontSize: 12, color: colors['text-soft'] }}>{d.country}</p>
        {d.cost > 0 && <p style={{ fontSize: 12, fontWeight: 600, color: colors.ink, marginTop: 2 }}>R$ {d.cost.toLocaleString('pt-BR')}</p>}
      </div>

      {/* Mobile status picker */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button
          onClick={e => { e.stopPropagation(); setShowPicker(v => !v) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 2,
            background: STATUS_COLORS[d.status], color: '#fff',
            border: 'none', borderRadius: 6, padding: '3px 7px',
            fontSize: 10, fontWeight: 700, cursor: 'pointer',
            letterSpacing: '.06em', textTransform: 'uppercase',
          }}
        >
          {STATUS_LABELS[d.status]}
          <ChevronDown size={10} />
        </button>

        {showPicker && (
          <div
            style={{
              position: 'absolute', right: 0, top: 'calc(100% + 4px)',
              background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 10,
              boxShadow: '0 8px 20px rgba(43,38,34,.15)',
              overflow: 'hidden', zIndex: 10, minWidth: 120,
            }}
          >
            {COLUMNS.map(col => (
              <button
                key={col.status}
                onClick={e => { e.stopPropagation(); onStatusChange(d.id, col.status); setShowPicker(false) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 12px', border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600,
                  background: d.status === col.status ? STATUS_BG[col.status] : '#fff',
                  color: STATUS_COLORS[col.status],
                }}
              >
                {STATUS_LABELS[col.status]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Goals() {
  const { destinations, updateDestination, navigate } = useApp()
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [hoverCol, setHoverCol] = useState<DestinationStatus | null>(null)

  const handleDrop = async (status: DestinationStatus) => {
    if (!draggingId) return
    await updateDestination(draggingId, { status })
    setDraggingId(null)
    setHoverCol(null)
  }

  const handleStatusChange = async (id: string, status: DestinationStatus) => {
    await updateDestination(id, { status })
  }

  return (
    <main
      style={{
        maxWidth: 1320, margin: '0 auto',
        padding: 'clamp(22px,4vw,42px) clamp(16px,3vw,34px)',
        animation: 'boraFade .4s ease both',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
        <h1
          style={{
            fontFamily: 'var(--font-bricolage), sans-serif',
            fontWeight: 800, fontSize: 'clamp(24px,3.5vw,36px)',
            letterSpacing: '-0.03em', color: colors.ink,
          }}
        >
          Organizar destinos
        </h1>
        <p style={{ fontSize: 13, color: colors['text-muted'] }}>
          <span className="hidden-mobile">Arraste entre colunas · </span>
          Toque no status para mudar
        </p>
      </div>

      {destinations.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: colors['text-soft'] }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: colors.ink, marginBottom: 6 }}>Nenhum destino ainda</p>
          <p style={{ fontSize: 13, marginBottom: 16 }}>Adicione destinos para organizá-los aqui.</p>
          <button
            onClick={() => navigate('add')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: colors.coral, color: '#fff', border: 'none',
              borderRadius: 12, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 8px 18px -8px rgba(232,113,76,.8)',
            }}
          >
            Adicionar destino
          </button>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16, marginTop: 20,
        }}
      >
        {COLUMNS.map(col => {
          const colDests = destinations.filter(d => d.status === col.status)
          const isHover = hoverCol === col.status && draggingId !== null
          return (
            <div
              key={col.status}
              onDragOver={e => { e.preventDefault(); setHoverCol(col.status) }}
              onDragLeave={() => setHoverCol(null)}
              onDrop={() => handleDrop(col.status)}
              style={{
                background: isHover ? STATUS_COLORS[col.status] + '18' : STATUS_BG[col.status],
                border: `1.5px ${isHover ? 'solid' : 'dashed'} ${STATUS_COLORS[col.status]}${isHover ? '' : '60'}`,
                borderRadius: 16, padding: '16px 14px',
                minHeight: 200,
                transition: 'background .15s, border .15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span
                  style={{
                    fontSize: 13, fontWeight: 700,
                    color: STATUS_COLORS[col.status],
                    textTransform: 'uppercase', letterSpacing: '.1em',
                  }}
                >
                  {STATUS_LABELS[col.status]}
                </span>
                <span
                  style={{
                    background: STATUS_COLORS[col.status], color: '#fff',
                    borderRadius: 10, padding: '1px 8px', fontSize: 12, fontWeight: 700,
                  }}
                >
                  {colDests.length}
                </span>
              </div>

              {colDests.length === 0 && (
                <p style={{ fontSize: 13, color: colors['text-muted'], textAlign: 'center', padding: '20px 0', fontStyle: 'italic' }}>
                  {draggingId ? 'solte aqui' : 'nenhum destino'}
                </p>
              )}

              {colDests.map(d => (
                <GoalCard
                  key={d.id}
                  destination={d}
                  draggingId={draggingId}
                  onDragStart={setDraggingId}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )
        })}
      </div>
    </main>
  )
}
