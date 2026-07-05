'use client'

import { useApp } from '@/contexts/AppContext'
import type { Destination } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/types'
import { Calendar, Check, ArrowLeft } from 'lucide-react'
import { colors } from '@/lib/colors'

function getDaysLeft(targetDate: string | null): number | null {
  if (!targetDate) return null
  return Math.ceil((new Date(targetDate).getTime() - Date.now()) / 86400000)
}

function DaysDisplay({ days }: { days: number | null }) {
  if (days === null) return null
  if (days > 0) {
    const color = days <= 60 ? colors.coral : colors.teal
    return (
      <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 24, color }}>
        {days} {days === 1 ? 'dia' : 'dias'}
      </span>
    )
  }
  if (days === 0) return (
    <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 24, color: colors.coral }}>
      hoje!
    </span>
  )
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 22, color: colors.green }}>
      vivida <Check size={18} strokeWidth={3} />
    </span>
  )
}

function AgendaRow({ destination: d, index }: { destination: Destination; index: number }) {
  const { navigate } = useApp()
  const days = getDaysLeft(d.target_date)

  return (
    <button
      onClick={() => navigate('detail', d)}
      style={{
        display: 'flex',
        alignItems: 'center', gap: 16,
        background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 14,
        padding: '16px 20px', cursor: 'pointer', textAlign: 'left', width: '100%',
        animation: `boraFade .4s ease ${index * 0.06}s both`,
        transition: 'box-shadow .15s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(43,38,34,.08)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '' }}
    >
      {/* Date / countdown */}
      <div style={{ minWidth: 100, flexShrink: 0 }}>
        <DaysDisplay days={days} />
        {d.target_date && (
          <p style={{ fontSize: 12, color: colors['text-soft'], marginTop: 2 }}>
            {new Date(d.target_date).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
          </p>
        )}
      </div>

      <div style={{ width: 1, height: 40, background: colors.border, flexShrink: 0 }} />

      {/* Mini thumb */}
      <div
        style={{
          width: 48, height: 48, borderRadius: 10, flexShrink: 0,
          backgroundImage: (d.cover_photo && d.cover_photo.startsWith('http')) ? `url(${d.cover_photo})` : (d.cover_photo || `linear-gradient(135deg, ${colors.coral}, ${colors['coral-light']})`),
          backgroundSize: 'cover', backgroundPosition: 'center',
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: 17, color: colors.ink, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {d.name}
        </h3>
        <p style={{ fontSize: 13, color: colors['text-soft'] }}>{d.country}</p>
      </div>

      <div
        style={{
          background: STATUS_COLORS[d.status], color: '#fff',
          borderRadius: 30, padding: '3px 10px',
          fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
          flexShrink: 0,
        }}
      >
        {STATUS_LABELS[d.status]}
      </div>
    </button>
  )
}

export default function Agenda() {
  const { destinations, navigate } = useApp()

  const upcoming = destinations
    .filter(d => d.status !== 'jafui' && d.target_date)
    .sort((a, b) => new Date(a.target_date!).getTime() - new Date(b.target_date!).getTime())

  const visited = destinations.filter(d => d.status === 'jafui')

  const noDateCount = destinations.filter(d => d.status !== 'jafui' && !d.target_date).length

  return (
    <main
      style={{
        maxWidth: 860, margin: '0 auto',
        padding: 'clamp(22px,4vw,42px) clamp(16px,3vw,34px)',
        animation: 'boraFade .4s ease both',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-bricolage), sans-serif',
          fontWeight: 800, fontSize: 'clamp(24px,3.5vw,36px)',
          letterSpacing: '-0.03em', color: colors.ink, marginBottom: 28,
        }}
      >
        Agenda de viagens
      </h1>

      {upcoming.length > 0 && (
        <section style={{ marginBottom: 36 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: colors['text-soft'], textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>
            Próximas viagens
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {upcoming.map((d, i) => <AgendaRow key={d.id} destination={d} index={i} />)}
          </div>
        </section>
      )}

      {visited.length > 0 && (
        <section>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: colors['text-soft'], textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>
            Já vividas
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {visited.map((d, i) => <AgendaRow key={d.id} destination={d} index={i} />)}
          </div>
        </section>
      )}

      {upcoming.length === 0 && visited.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: colors['text-soft'] }}>
          <Calendar size={40} style={{ color: colors['border-alt'], margin: '0 auto 16px' }} />
          <p style={{ fontSize: 16, fontWeight: 600, color: colors.ink, marginBottom: 6 }}>
            Nenhuma viagem com data marcada
          </p>
          <p style={{ fontSize: 14, marginBottom: 20 }}>
            Abra um destino e defina uma data prevista para ele aparecer aqui.
          </p>
          <button
            onClick={() => navigate('dashboard')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#fff', border: `1.5px solid ${colors.border}`, borderRadius: 12,
              padding: '9px 18px', fontSize: 13, fontWeight: 600, color: colors.ink,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} />
            Ver destinos
          </button>
        </div>
      )}

      {noDateCount > 0 && (upcoming.length > 0 || visited.length > 0) && (
        <p style={{ fontSize: 13, color: colors['text-muted'], marginTop: 24, textAlign: 'center' }}>
          {noDateCount} destino{noDateCount !== 1 ? 's' : ''} sem data definida {noDateCount !== 1 ? 'estão' : 'está'} oculto{noDateCount !== 1 ? 's' : ''}.
        </p>
      )}
    </main>
  )
}
