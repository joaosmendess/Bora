'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Plus, Trash2, Plane, BedDouble, Utensils, MapPin,
  ShoppingBag, Star, Circle, Pencil, Check, X, CalendarDays,
} from 'lucide-react'
import type { ItineraryCategory } from '@/lib/types'
import { colors } from '@/lib/colors'

interface IItem {
  id: string
  day_id: string
  position: number
  time: string | null
  title: string
  category: ItineraryCategory
}

interface IDay {
  id: string
  destination_id: string
  position: number
  label: string
  items: IItem[]
}

const CATS: { key: ItineraryCategory; Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string; label: string }[] = [
  { key: 'atracao',     Icon: MapPin,      color: colors.teal, label: 'Passeio' },
  { key: 'alimentacao', Icon: Utensils,    color: colors.coral, label: 'Alimentação' },
  { key: 'transporte',  Icon: Plane,       color: colors.blue, label: 'Transporte' },
  { key: 'hospedagem',  Icon: BedDouble,   color: colors.purple, label: 'Hospedagem' },
  { key: 'compras',     Icon: ShoppingBag, color: colors.pink, label: 'Compras' },
  { key: 'destaque',    Icon: Star,        color: colors.golden, label: 'Destaque' },
  { key: 'outros',      Icon: Circle,      color: colors['text-soft'], label: 'Outros' },
]

function getCat(cat: ItineraryCategory) {
  return CATS.find(c => c.key === cat) ?? CATS[CATS.length - 1]
}

export default function ItinerarySection({ destinationId }: { destinationId: string }) {
  const [days, setDays] = useState<IDay[]>([])
  const [loading, setLoading] = useState(true)
  const [addingItem, setAddingItem] = useState<string | null>(null)
  const [newTime, setNewTime] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newCat, setNewCat] = useState<ItineraryCategory>('atracao')
  const [editingDay, setEditingDay] = useState<string | null>(null)
  const [editingLabel, setEditingLabel] = useState('')
  const titleInputRef = useRef<HTMLInputElement>(null)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('itinerary_days')
      .select('*, items:itinerary_items(*)')
      .eq('destination_id', destinationId)
      .order('position')
    if (data) {
      setDays(data.map(d => ({
        ...d,
        items: (d.items ?? []).sort((a: IItem, b: IItem) => a.position - b.position),
      })))
    }
    setLoading(false)
  }, [destinationId])

  useEffect(() => { load() }, [load])

  async function addDay() {
    const position = days.length
    const label = `Dia ${position + 1}`
    const { data } = await supabase
      .from('itinerary_days')
      .insert({ destination_id: destinationId, position, label })
      .select()
      .single()
    if (data) setDays(p => [...p, { ...data, items: [] }])
  }

  async function deleteDay(dayId: string) {
    await supabase.from('itinerary_days').delete().eq('id', dayId)
    setDays(p => p.filter(d => d.id !== dayId))
  }

  async function saveDayLabel(dayId: string) {
    const label = editingLabel.trim()
    if (!label) { setEditingDay(null); return }
    await supabase.from('itinerary_days').update({ label }).eq('id', dayId)
    setDays(p => p.map(d => d.id === dayId ? { ...d, label } : d))
    setEditingDay(null)
  }

  function openAdd(dayId: string) {
    setAddingItem(dayId)
    setNewTime('')
    setNewTitle('')
    setNewCat('atracao')
    setTimeout(() => titleInputRef.current?.focus(), 60)
  }

  function closeAdd() {
    setAddingItem(null)
    setNewTime('')
    setNewTitle('')
  }

  async function addItem(dayId: string) {
    if (!newTitle.trim()) return
    const day = days.find(d => d.id === dayId)
    const position = day?.items.length ?? 0
    const { data } = await supabase
      .from('itinerary_items')
      .insert({
        day_id: dayId,
        destination_id: destinationId,
        position,
        time: newTime.trim() || null,
        title: newTitle.trim(),
        category: newCat,
      })
      .select()
      .single()
    if (data) {
      setDays(p => p.map(d =>
        d.id === dayId ? { ...d, items: [...d.items, data] } : d
      ))
      setNewTitle('')
      setNewTime('')
      setTimeout(() => titleInputRef.current?.focus(), 60)
    }
  }

  async function deleteItem(dayId: string, itemId: string) {
    await supabase.from('itinerary_items').delete().eq('id', itemId)
    setDays(p => p.map(d =>
      d.id === dayId ? { ...d, items: d.items.filter(i => i.id !== itemId) } : d
    ))
  }

  if (loading) return null

  const totalItems = days.reduce((s, d) => s + d.items.length, 0)

  return (
    <section style={{ marginTop: 28 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: colors['text-soft'], textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Roteiro
          </span>
          {totalItems > 0 && (
            <span style={{ fontSize: 12, color: colors['text-muted'], background: colors['tab-bg'], borderRadius: 6, padding: '2px 8px' }}>
              {days.length} {days.length === 1 ? 'dia' : 'dias'} · {totalItems} {totalItems === 1 ? 'atividade' : 'atividades'}
            </span>
          )}
        </div>
        <button
          onClick={addDay}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: colors.coral, color: '#fff',
            border: 'none', borderRadius: 10, padding: '7px 14px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 12px -4px rgba(232,113,76,.55)',
            transition: 'opacity .15s',
          }}
        >
          <Plus size={14} />
          Adicionar dia
        </button>
      </div>

      {/* Empty state */}
      {days.length === 0 && (
        <div
          style={{
            background: '#fff', border: `1.5px dashed ${colors['border-alt']}`, borderRadius: 16,
            padding: '44px 24px', textAlign: 'center',
          }}
        >
          <CalendarDays size={34} style={{ margin: '0 auto 12px', color: colors['border-muted'] }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: colors['text-soft'], marginBottom: 5 }}>Nenhum dia no roteiro ainda</p>
          <p style={{ fontSize: 13, color: colors['text-muted'] }}>Clique em &quot;Adicionar dia&quot; pra começar a planejar</p>
        </div>
      )}

      {/* Day cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {days.map((day, dayIndex) => (
          <div
            key={day.id}
            style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, overflow: 'hidden' }}
          >
            {/* Day header */}
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '13px 18px',
                background: colors['input-bg'],
                borderBottom: day.items.length > 0 || addingItem === day.id ? `1px solid ${colors['tab-bg']}` : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span
                  style={{
                    background: colors.coral, color: '#fff',
                    borderRadius: 7, padding: '2px 9px',
                    fontSize: 12, fontWeight: 800, letterSpacing: '.04em',
                    flexShrink: 0,
                  }}
                >
                  {dayIndex + 1}
                </span>

                {editingDay === day.id ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      autoFocus
                      value={editingLabel}
                      onChange={e => setEditingLabel(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveDayLabel(day.id)
                        if (e.key === 'Escape') setEditingDay(null)
                      }}
                      style={{
                        border: `1.5px solid ${colors.coral}`, borderRadius: 8, padding: '4px 10px',
                        fontSize: 14, fontWeight: 600, color: colors.ink,
                        background: '#fff', fontFamily: 'inherit', outline: 'none',
                        width: 200,
                      }}
                    />
                    <button
                      onClick={() => saveDayLabel(day.id)}
                      style={{ background: colors.teal, color: '#fff', border: 'none', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingDay(null)}
                      style={{ background: 'none', border: `1px solid ${colors.border}`, borderRadius: 7, padding: '5px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: colors['text-soft'] }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingDay(day.id); setEditingLabel(day.label) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 600, color: colors.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {day.label}
                    </span>
                    <Pencil size={12} style={{ color: colors['text-faint'], flexShrink: 0 }} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {day.items.length > 0 && (
                  <span style={{ fontSize: 12, color: colors['text-muted'] }}>
                    {day.items.length} {day.items.length === 1 ? 'atividade' : 'atividades'}
                  </span>
                )}
                <button
                  onClick={() => deleteDay(day.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors['border-muted'], padding: '4px', display: 'flex', alignItems: 'center', borderRadius: 6 }}
                  title="Remover dia"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Item list */}
            {day.items.length > 0 && (
              <div>
                {day.items.map((item, i) => {
                  const cat = getCat(item.category)
                  const { Icon } = cat
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 18px',
                        borderBottom: i < day.items.length - 1 ? '1px solid #F7F3EE' : 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: cat.color + '1A',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={14} style={{ color: cat.color }} />
                      </div>

                      {item.time && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: colors['text-soft'], minWidth: 44, flexShrink: 0 }}>
                          {item.time}
                        </span>
                      )}

                      <span style={{ flex: 1, fontSize: 14, color: colors.ink, fontWeight: 500, minWidth: 0 }}>
                        {item.title}
                      </span>

                      <button
                        onClick={() => deleteItem(day.id, item.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors['border-muted'], padding: '4px', flexShrink: 0, display: 'flex', alignItems: 'center', borderRadius: 6 }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Add item form / button */}
            <div style={{ padding: '8px 14px 12px' }}>
              {addingItem === day.id ? (
                <div
                  style={{
                    background: colors.paper,
                    border: '1.5px solid rgba(232,113,76,.25)',
                    borderRadius: 12,
                    padding: '12px 14px',
                  }}
                >
                  {/* Category selector */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                    {CATS.map(c => (
                      <button
                        key={c.key}
                        onClick={() => setNewCat(c.key)}
                        title={c.label}
                        style={{
                          width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: newCat === c.key ? c.color + '20' : colors['tab-bg'],
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          outline: newCat === c.key ? `2px solid ${c.color}` : 'none',
                          outlineOffset: 1,
                          transition: 'all .12s',
                        }}
                      >
                        <c.Icon size={15} style={{ color: newCat === c.key ? c.color : colors['text-muted'] }} />
                      </button>
                    ))}
                  </div>

                  {/* Input row */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                      type="text"
                      value={newTime}
                      onChange={e => setNewTime(e.target.value)}
                      placeholder="09:00"
                      style={{
                        width: 68, padding: '7px 10px', borderRadius: 9,
                        border: `1.5px solid ${colors.border}`, background: '#fff',
                        fontSize: 13, color: colors.ink, fontFamily: 'inherit',
                      }}
                    />
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') addItem(day.id)
                        if (e.key === 'Escape') closeAdd()
                      }}
                      placeholder="Nome da atividade..."
                      style={{
                        flex: 1, padding: '7px 11px', borderRadius: 9,
                        border: `1.5px solid ${colors.border}`, background: '#fff',
                        fontSize: 13, color: colors.ink, fontFamily: 'inherit',
                      }}
                    />
                    <button
                      onClick={() => addItem(day.id)}
                      style={{
                        padding: '7px 12px', borderRadius: 9, border: 'none',
                        background: colors.coral, color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', flexShrink: 0,
                      }}
                    >
                      <Plus size={15} />
                    </button>
                  </div>

                  <button
                    onClick={closeAdd}
                    style={{ marginTop: 8, fontSize: 12, color: colors['text-muted'], background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    cancelar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openAdd(day.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: 'none', border: `1.5px dashed ${colors['border-alt']}`, borderRadius: 9,
                    padding: '7px 14px', cursor: 'pointer',
                    fontSize: 13, color: colors['text-muted'], fontWeight: 500,
                    width: '100%',
                    transition: 'border-color .12s',
                  }}
                >
                  <Plus size={13} />
                  Adicionar atividade
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
