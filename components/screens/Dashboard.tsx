'use client'

import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import DestinationCard from '@/components/DestinationCard'
import type { StatusFilter, DestinationStatus } from '@/lib/types'
import { STATUS_COLORS, STATUS_BG, SEASONS } from '@/lib/types'
import { colors } from '@/lib/colors'
import { PlusCircle, MapPin, X } from 'lucide-react'

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'sonho', label: 'Sonho' },
  { key: 'embreve', label: 'Em breve' },
  { key: 'planejando', label: 'Planejando' },
  { key: 'jafui', label: 'Já fui' },
]

function useCountUp(target: number, duration = 680) {
  const [value, setValue] = useState(0)
  const startRef = useRef(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    if (target === 0) { setValue(0); return }
    const start = startRef.current
    const diff = target - start
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + diff * eased))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
      else startRef.current = target
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

export default function Dashboard() {
  const { user, destinations, categoryFilter, seasonFilter, budgetMax, navigate, dispatch, loading, loadingDestinations } = useApp()

  const total = destinations.length
  const dreaming = destinations.filter(d => d.status === 'sonho').length
  const planning = destinations.filter(d => d.status === 'planejando').length
  const visited = destinations.filter(d => d.status === 'jafui').length

  const totalCount = useCountUp(total)
  const dreamCount = useCountUp(dreaming)
  const planCount = useCountUp(planning)
  const visitCount = useCountUp(visited)

  const hasFilters = categoryFilter !== 'todos' || seasonFilter !== 'Toda época' || budgetMax < 25000

  const filtered = destinations.filter(d => {
    if (categoryFilter !== 'todos' && d.status !== categoryFilter) return false
    if (seasonFilter !== 'Toda época' && d.season !== seasonFilter) return false
    if (budgetMax < 25000 && d.cost > budgetMax) return false
    return true
  })

  const getCategoryCount = (key: StatusFilter) =>
    key === 'todos' ? destinations.length : destinations.filter(d => d.status === key).length

  const clearFilters = () => {
    dispatch({ type: 'SET_CATEGORY_FILTER', payload: 'todos' })
    dispatch({ type: 'SET_SEASON_FILTER', payload: 'Toda época' })
    dispatch({ type: 'SET_BUDGET_MAX', payload: 25000 })
  }

  const firstName = user?.name?.split(' ')[0] || 'viajante'

  return (
    <main
      style={{
        maxWidth: 1180, margin: '0 auto',
        padding: 'clamp(22px,4vw,42px) clamp(16px,3vw,34px)',
        animation: 'boraFade .4s ease both',
      }}
    >
      {/* Greeting */}
      <h1
        style={{
          fontFamily: 'var(--font-bricolage), sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(30px,4.5vw,46px)',
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: 32,
          color: colors.ink,
        }}
      >
        Oi, {firstName}.{' '}
        <span style={{ color: colors.coral }}>pra onde a gente vai?</span>
      </h1>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 14,
          marginBottom: 28,
        }}
      >
        <StatCard value={totalCount} label="destinos" color={colors.ink} textColor="#fff" bg={colors.ink} />
        <StatCard value={dreamCount} label="sonhos" color={STATUS_COLORS.sonho} textColor={colors.ink} bg={STATUS_BG.sonho} />
        <StatCard value={planCount} label="planejando" color={STATUS_COLORS.planejando} textColor={colors.ink} bg={STATUS_BG.planejando} />
        <StatCard value={visitCount} label="já fui" color={STATUS_COLORS.jafui} textColor="#fff" bg={colors.ink} dark />
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        {FILTERS.map(f => {
          const active = categoryFilter === f.key
          const color = f.key === 'todos' ? colors.ink : STATUS_COLORS[f.key as DestinationStatus]
          const count = getCategoryCount(f.key)
          return (
            <button
              key={f.key}
              onClick={() => dispatch({ type: 'SET_CATEGORY_FILTER', payload: f.key })}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 30,
                border: `1.5px solid ${active ? color : colors.border}`,
                background: active ? color : '#fff',
                color: active ? (f.key === 'todos' ? '#fff' : colors.ink) : colors['text-soft'],
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {f.label}
              <span
                style={{
                  fontSize: 11, fontWeight: 700,
                  background: active ? 'rgba(255,255,255,.25)' : colors.border,
                  borderRadius: 10, padding: '1px 6px',
                  color: active ? (f.key === 'todos' ? '#fff' : colors.ink) : colors['text-soft'],
                }}
              >
                {count}
              </span>
            </button>
          )
        })}

        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 30,
              border: `1.5px solid ${colors.border}`, background: colors.paper,
              color: colors['text-soft'], fontSize: 12, fontWeight: 600, cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            <X size={12} />
            Limpar filtros
          </button>
        )}
      </div>

      {/* Season + budget filters */}
      <div
        style={{
          background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16,
          padding: '16px 20px', marginBottom: 24,
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 16,
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SEASONS.map(s => (
            <button
              key={s}
              onClick={() => dispatch({ type: 'SET_SEASON_FILTER', payload: s })}
              style={{
                padding: '5px 12px', borderRadius: 30,
                border: `1.5px solid ${seasonFilter === s ? colors.ink : colors.border}`,
                background: seasonFilter === s ? colors.ink : 'transparent',
                color: seasonFilter === s ? '#fff' : colors['text-soft'],
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto' }}>
          <span style={{ fontSize: 13, color: colors['text-soft'], whiteSpace: 'nowrap' }}>
            {budgetMax >= 25000 ? 'Qualquer orçamento' : `Até R$ ${budgetMax.toLocaleString('pt-BR')}`}
          </span>
          <input
            type="range" min={2000} max={25000} step={500}
            value={budgetMax}
            onChange={e => dispatch({ type: 'SET_BUDGET_MAX', payload: Number(e.target.value) })}
            style={{ accentColor: colors.coral, width: 120 }}
          />
        </div>
      </div>

      {/* Destination grid */}
      {!loading && loadingDestinations ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))',
            gap: 18,
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{ textAlign: 'center', padding: '80px 20px', color: colors['text-soft'] }}
          className="animate-bora-fade"
        >
          <MapPin size={40} style={{ color: colors['border-alt'], margin: '0 auto 16px' }} />
          <p style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: colors.ink }}>
            {destinations.length === 0 ? 'Nenhum destino ainda' : 'Nenhum destino com esses filtros'}
          </p>
          <p style={{ fontSize: 14 }}>
            {destinations.length === 0
              ? 'Adicione o primeiro lugar dos seus sonhos.'
              : 'Tente ajustar ou remover os filtros ativos.'}
          </p>
          {destinations.length === 0 ? (
            <button
              onClick={() => navigate('add')}
              style={{
                marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 8,
                background: colors.coral, color: '#fff', border: 'none',
                borderRadius: 12, padding: '10px 20px', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', boxShadow: '0 8px 18px -8px rgba(232,113,76,.8)',
              }}
            >
              <PlusCircle size={16} />
              Adicionar destino
            </button>
          ) : (
            <button
              onClick={clearFilters}
              style={{
                marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#fff', color: colors.ink, border: `1.5px solid ${colors.border}`,
                borderRadius: 12, padding: '9px 18px', fontSize: 13, fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <X size={14} />
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(265px, 1fr))',
            gap: 18,
          }}
        >
          {filtered.map((dest, i) => (
            <DestinationCard key={dest.id} destination={dest} index={i} />
          ))}
        </div>
      )}
    </main>
  )
}

const shimmer: React.CSSProperties = {
  background: 'linear-gradient(90deg, #EDE6DC 25%, #F5EFE7 50%, #EDE6DC 75%)',
  backgroundSize: '600px 100%',
  animation: 'boraShimmer 1.4s ease-in-out infinite',
  borderRadius: 8,
}

function SkeletonCard() {
  return (
    <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 20, overflow: 'hidden' }}>
      {/* Cover */}
      <div style={{ ...shimmer, height: 158, borderRadius: 0 }} />
      {/* Body */}
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Badge + title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ ...shimmer, width: 60, height: 20 }} />
          <div style={{ ...shimmer, width: 90, height: 20 }} />
        </div>
        {/* Title */}
        <div style={{ ...shimmer, width: '75%', height: 22 }} />
        {/* Country */}
        <div style={{ ...shimmer, width: '45%', height: 14 }} />
        {/* Progress bar */}
        <div style={{ ...shimmer, width: '100%', height: 6, borderRadius: 3 }} />
        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
          <div style={{ ...shimmer, width: 50, height: 14 }} />
          <div style={{ ...shimmer, width: 40, height: 14 }} />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  value, label, bg, textColor, dark = false,
}: {
  value: number
  label: string
  color: string
  bg: string
  textColor: string
  dark?: boolean
}) {
  return (
    <div
      style={{
        background: bg, borderRadius: 16,
        padding: '16px 20px',
        border: dark ? 'none' : `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-bricolage), sans-serif',
          fontWeight: 800, fontSize: 34,
          color: textColor,
          letterSpacing: '-0.02em',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, fontWeight: 500, color: dark ? 'rgba(255,255,255,.6)' : textColor, opacity: 0.75 }}>
        {label}
      </div>
    </div>
  )
}
