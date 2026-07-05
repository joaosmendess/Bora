'use client'

import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import type { Destination } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS, COVER_GRADIENTS } from '@/lib/types'
import { colors } from '@/lib/colors'
import { Calendar, Heart, Check } from 'lucide-react'

interface Props {
  destination: Destination
  index?: number
}

export default function DestinationCard({ destination, index = 0 }: Props) {
  const { user, navigate, toggleVote } = useApp()
  const [heartAnimating, setHeartAnimating] = useState(false)

  const hasVoted = destination.votes?.some(v => v.profile_id === user?.id)
  const voteCount = destination.votes?.length || 0
  const statusColor = STATUS_COLORS[destination.status]
  const coverBg = destination.cover_photo || COVER_GRADIENTS[index % COVER_GRADIENTS.length]
  const isVisited = destination.status === 'jafui'
  const savingsPct = destination.cost > 0 ? Math.min(100, Math.round((destination.saved / destination.cost) * 100)) : 0

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setHeartAnimating(true)
    await toggleVote(destination.id)
    setTimeout(() => setHeartAnimating(false), 450)
  }

  return (
    <div
      onClick={() => navigate('detail', destination)}
      className="group cursor-pointer"
      style={{
        background: '#fff', border: `1px solid ${colors.border}`,
        borderRadius: 20, overflow: 'hidden',
        animation: `boraPop .5s cubic-bezier(.2,.8,.2,1) ${index * 0.05}s both`,
        transition: 'transform .2s, box-shadow .2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 22px 40px -24px rgba(15,23,42,.45)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = ''
        ;(e.currentTarget as HTMLElement).style.boxShadow = ''
      }}
    >
      {/* Cover */}
      <div style={{ height: 158, position: 'relative', backgroundImage: coverBg.startsWith('http') ? `url(${coverBg})` : coverBg, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Diagonal texture overlay */}
        <div
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,.04) 0, rgba(255,255,255,.04) 1px, transparent 1px, transparent 8px)',
          }}
        />
        {/* Gradient overlay bottom */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,.7) 0%, transparent 60%)' }} />

        {/* Status pill */}
        <div
          style={{
            position: 'absolute', top: 12, left: 12,
            background: statusColor, color: '#fff',
            borderRadius: 30, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, letterSpacing: '.08em',
            textTransform: 'uppercase',
          }}
        >
          {STATUS_LABELS[destination.status]}
        </div>

        {/* Vote button */}
        <button
          onClick={handleVote}
          style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(255,255,255,.2)',
            backdropFilter: 'blur(4px)',
            border: 'none', borderRadius: 30,
            padding: '5px 10px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            color: '#fff', fontSize: 12, fontWeight: 600,
          }}
        >
          <Heart
            size={14}
            fill={hasVoted ? '#fff' : 'transparent'}
            stroke="#fff"
            style={{
              animation: heartAnimating ? 'boraHeart .45s ease both' : 'none',
            }}
          />
          {voteCount > 0 && voteCount}
        </button>

        {/* Visited stamp — an ink-stamp seal, echoing the dashed radar rings on the login hero */}
        {isVisited && (
          <div
            style={{
              position: 'absolute', bottom: 14, right: 14,
              width: 72, height: 72, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,.85)',
              outline: '1px solid rgba(255,255,255,.4)', outlineOffset: 4,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              transform: 'rotate(-16deg)',
              animation: 'boraStamp .55s cubic-bezier(.3,1.4,.5,1) both',
            }}
          >
            <Check size={16} strokeWidth={3} style={{ color: 'rgba(255,255,255,.9)' }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,.9)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
              Visitado
            </span>
          </div>
        )}

        {/* Name */}
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
          <h3
            style={{
              fontFamily: 'var(--font-bricolage), sans-serif',
              fontWeight: 800, fontSize: 23, color: '#fff',
              letterSpacing: '-0.02em', lineHeight: 1.1,
            }}
          >
            {destination.name}
          </h3>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', marginTop: 2 }}>
            {destination.country}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Row 1: country + cost */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: colors['text-soft'], fontWeight: 500 }}>{destination.country}</span>
          {destination.cost > 0 && (
            <span style={{ fontSize: 13, fontWeight: 700, color: colors.ink }}>
              R$ {destination.cost.toLocaleString('pt-BR')}
            </span>
          )}
        </div>

        {/* Row 2: date + avatars */}
        {(destination.target_date || destination.date_label) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={12} style={{ color: colors['text-soft'], flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: colors['text-soft'] }}>
              {destination.date_label || destination.target_date}
            </span>
          </div>
        )}

        {/* Savings bar */}
        {!isVisited && destination.cost > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: colors['text-soft'], letterSpacing: '.06em', textTransform: 'uppercase' }}>cofrinho</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: colors.ink }}>
                R$ {destination.saved.toLocaleString('pt-BR')}
              </span>
            </div>
            <div style={{ height: 4, background: colors.border, borderRadius: 2, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%', borderRadius: 2,
                  background: colors.coral,
                  width: `${savingsPct}%`,
                  animation: 'boraGrow .85s cubic-bezier(.2,.8,.2,1) both',
                  transformOrigin: 'left',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
