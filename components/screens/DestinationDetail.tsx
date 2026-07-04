'use client'

import { useState, useRef } from 'react'
import { useApp } from '@/contexts/AppContext'
import type { DestinationStatus, ChecklistItem } from '@/lib/types'
import { STATUS_COLORS, STATUS_LABELS, COVER_GRADIENTS } from '@/lib/types'
import { uploadImage } from '@/lib/storage'
import { ArrowLeft, Clock, Heart, Star, ImagePlus, Send, Plus, Trash2, Loader2 } from 'lucide-react'
import ItinerarySection from './ItinerarySection'

export default function DestinationDetail() {
  const { selectedDestination, user, navigate, toggleVote, toggleChecklist, addChecklistItem, deleteChecklistItem, addComment, addPhoto, updateSaved, updateDestination, deleteDestination, showToast } = useApp()

  const [newTask, setNewTask] = useState('')
  const [newComment, setNewComment] = useState('')
  const [savingsInput, setSavingsInput] = useState('')
  const [heartAnim, setHeartAnim] = useState(false)
  const [memoryText, setMemoryText] = useState(selectedDestination?.memory || '')
  const [notesText, setNotesText] = useState(selectedDestination?.notes || '')
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const commentInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const photoInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  if (!selectedDestination) return null
  const d = selectedDestination

  const hasVoted = d.votes?.some(v => v.profile_id === user?.id)
  const voteCount = d.votes?.length || 0
  const isVisited = d.status === 'jafui'
  const savingsPct = d.cost > 0 ? Math.min(100, Math.round((d.saved / d.cost) * 100)) : 0
  const coverBg = d.cover_photo || COVER_GRADIENTS[0]

  const daysLeft = d.target_date
    ? Math.ceil((new Date(d.target_date).getTime() - Date.now()) / 86400000)
    : null

  const checklistDone = d.checklist_items?.filter(i => i.done).length || 0
  const checklistTotal = d.checklist_items?.length || 0
  const checklistPct = checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0

  const handleVote = async () => {
    setHeartAnim(true)
    await toggleVote(d.id)
    setTimeout(() => setHeartAnim(false), 450)
  }

  const handleAddTask = async () => {
    if (!newTask.trim()) return
    await addChecklistItem(d.id, newTask.trim())
    setNewTask('')
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    await addComment(d.id, newComment.trim())
    setNewComment('')
  }

  const handleSaveAmount = async (amount: number) => {
    await updateSaved(d.id, amount)
  }

  const handleStatusChange = async (status: DestinationStatus) => {
    await updateDestination(d.id, { status })
    showToast(`Status atualizado: ${STATUS_LABELS[status]}`)
  }

  const handleCustomSave = async () => {
    const amount = parseFloat(savingsInput)
    if (isNaN(amount)) return
    await updateSaved(d.id, amount)
    setSavingsInput('')
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    const url = await uploadImage(file, 'covers')
    if (url) await updateDestination(d.id, { cover_photo: url })
    else showToast('Não foi possível enviar a imagem (máx. 5MB, JPG/PNG/WEBP/GIF).')
    setUploadingCover(false)
    e.target.value = ''
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingSlot(slotIndex)
    const url = await uploadImage(file, 'photos')
    if (url) await addPhoto(d.id, url)
    else showToast('Não foi possível enviar a imagem (máx. 5MB, JPG/PNG/WEBP/GIF).')
    setUploadingSlot(null)
    e.target.value = ''
  }

  const statusColor = STATUS_COLORS[d.status]

  return (
    <main
      style={{
        maxWidth: 940, margin: '0 auto',
        padding: 'clamp(22px,4vw,42px) clamp(16px,3vw,34px)',
        animation: 'boraFade .4s ease both',
      }}
    >
      <button
        onClick={() => navigate('dashboard')}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#8A8178', fontSize: 14, fontWeight: 500, marginBottom: 20,
        }}
      >
        <ArrowLeft size={16} />
        voltar pra lista
      </button>

      {/* Hero */}
      <div
        style={{
          height: 'clamp(220px,32vw,340px)', borderRadius: 26,
          backgroundImage: coverBg.startsWith('http') ? `url(${coverBg})` : coverBg,
          backgroundSize: 'cover', backgroundPosition: 'center',
          position: 'relative', overflow: 'hidden', marginBottom: 28,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(43,38,34,.8) 0%, rgba(43,38,34,.1) 70%)' }} />

        {/* Top row */}
        <div style={{ position: 'absolute', top: 20, left: 20, right: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ background: statusColor, color: '#fff', borderRadius: 30, padding: '4px 12px', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
              {STATUS_LABELS[d.status]}
            </div>
            {daysLeft !== null && (
              <div style={{ background: '#2B2622', color: '#fff', borderRadius: 30, padding: '4px 12px', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                <Clock size={11} />
                {daysLeft > 0 ? `${daysLeft} dias` : daysLeft === 0 ? 'hoje!' : 'passou'}
              </div>
            )}
          </div>
          <button
            onClick={handleVote}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'rgba(255,255,255,.18)', backdropFilter: 'blur(4px)',
              border: 'none', borderRadius: 30, padding: '7px 14px',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            <Heart
              size={15}
              fill={hasVoted ? '#fff' : 'transparent'}
              stroke="#fff"
              style={{ animation: heartAnim ? 'boraHeart .45s ease both' : 'none' }}
            />
            {voteCount > 0 && `${voteCount} quer${voteCount !== 1 ? 'em' : ''} ir`}
          </button>
        </div>

        {/* Name + meta */}
        <div style={{ position: 'absolute', bottom: 28, left: 28, right: 28 }}>
          {isVisited && (
            <div
              style={{
                display: 'inline-block', border: '2.5px solid rgba(255,255,255,.7)', borderRadius: 4,
                padding: '3px 10px', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,.7)',
                letterSpacing: '.14em', textTransform: 'uppercase',
                transform: 'rotate(-5deg)', marginBottom: 8,
                animation: 'boraStamp .55s cubic-bezier(.3,1.4,.5,1) both',
              }}
            >
              VISITADO
            </div>
          )}
          <h1
            style={{
              fontFamily: 'var(--font-bricolage), sans-serif',
              fontWeight: 800, fontSize: 'clamp(32px,5vw,54px)',
              color: '#fff', letterSpacing: '-0.03em', lineHeight: 1,
            }}
          >
            {d.name}
          </h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 14, marginTop: 6 }}>
            {d.country} · adicionado por {d.added_by_profile?.name || 'você'}
          </p>
        </div>

        {/* Cover upload button */}
        <button
          onClick={() => !uploadingCover && coverInputRef.current?.click()}
          style={{
            position: 'absolute', bottom: 16, right: 16,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)',
            border: 'none', borderRadius: 10, padding: '6px 12px',
            color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}
        >
          {uploadingCover
            ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
            : <ImagePlus size={13} />
          }
          {uploadingCover ? 'Enviando...' : 'Trocar capa'}
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          style={{ display: 'none' }}
        />
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Memory (jafui only) */}
          {isVisited && (
            <Card style={{ background: '#FBF0D6', border: '1px solid #E8B23C30' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Label>Lembrança</Label>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(star => (
                    <button key={star} onClick={() => updateDestination(d.id, { rating: star })}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      <Star size={18} fill={star <= d.rating ? '#E8B23C' : 'transparent'} stroke="#E8B23C" />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={memoryText}
                onChange={e => setMemoryText(e.target.value)}
                onBlur={() => updateDestination(d.id, { memory: memoryText })}
                placeholder="Conta como foi essa viagem..."
                style={{ ...textareaStyle, background: 'rgba(255,255,255,.5)' }}
                rows={4}
              />
            </Card>
          )}

          {/* Savings (not jafui) */}
          {!isVisited && (
            <Card>
              <Label>Cofrinho</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, marginBottom: 14 }}>
                {/* Ring */}
                <div style={{ position: 'relative', width: 96, height: 96, flexShrink: 0 }}>
                  <svg width="96" height="96" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="38" fill="none" stroke="#EFE6D7" strokeWidth="9" />
                    <circle
                      cx="48" cy="48" r="38" fill="none" stroke="#2FA39A" strokeWidth="9"
                      strokeDasharray={`${2 * Math.PI * 38 * savingsPct / 100} ${2 * Math.PI * 38}`}
                      strokeLinecap="round"
                      transform="rotate(-90 48 48)"
                      style={{ transition: 'stroke-dasharray .5s ease' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 20, color: '#2B2622' }}>{savingsPct}%</span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-bricolage), sans-serif', color: '#2B2622' }}>
                    R$ {d.saved.toLocaleString('pt-BR')}
                  </p>
                  <p style={{ fontSize: 13, color: '#8A8178' }}>
                    de R$ {d.cost.toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                {[500, 1000, 2000].map(amt => (
                  <button key={amt} onClick={() => handleSaveAmount(amt)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #2FA39A', background: '#fff', fontSize: 12, fontWeight: 700, color: '#2FA39A', cursor: 'pointer' }}
                  >
                    +{amt >= 1000 ? `${amt/1000}k` : amt}
                  </button>
                ))}
                {[500, 1000].map(amt => (
                  <button key={-amt} onClick={() => handleSaveAmount(-amt)}
                    style={{ padding: '6px 12px', borderRadius: 8, border: '1.5px solid #EFE6D7', background: '#fff', fontSize: 12, fontWeight: 700, color: '#B0917A', cursor: 'pointer' }}
                  >
                    -{amt >= 1000 ? `${amt/1000}k` : amt}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number" value={savingsInput} onChange={e => setSavingsInput(e.target.value)}
                  placeholder="valor a acrescentar..."
                  style={{ ...inputStyle, flex: 1 }}
                />
                <button onClick={handleCustomSave}
                  style={{ padding: '8px 14px', borderRadius: 11, background: '#2FA39A', color: '#fff', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Adicionar
                </button>
              </div>
            </Card>
          )}

          {/* Facts */}
          <Card>
            <Label>Detalhes</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12, marginBottom: 16 }}>
              <FactItem label="Custo" value={d.cost > 0 ? `R$ ${d.cost.toLocaleString('pt-BR')}` : '—'} />
              <FactItem label="Época" value={d.season || '—'} />
              <FactItem label="Data" value={d.date_label || d.target_date || '—'} />
              <FactItem label="Adicionado por" value={d.added_by_profile?.name || '—'} />
            </div>
            {/* Change status */}
            <Label>Status</Label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              {(['sonho', 'embreve', 'planejando', 'jafui'] as DestinationStatus[]).map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 600,
                    background: d.status === s ? STATUS_COLORS[s] : '#F1E9DC',
                    color: d.status === s ? '#fff' : '#8A8178',
                    transition: 'all .15s',
                  }}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </Card>

          {/* Checklist */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Label>Checklist</Label>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#8A8178' }}>{checklistDone}/{checklistTotal}</span>
            </div>
            {checklistTotal > 0 && (
              <div style={{ height: 4, background: '#EFE6D7', borderRadius: 2, overflow: 'hidden', marginBottom: 12 }}>
                <div style={{ height: '100%', borderRadius: 2, background: '#2FA39A', width: `${checklistPct}%`, transition: 'width .4s ease' }} />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {d.checklist_items?.map((item: ChecklistItem) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" checked={item.done} onChange={() => toggleChecklist(item)} style={{ cursor: 'pointer', flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 14, color: item.done ? '#B0917A' : '#2B2622', textDecoration: item.done ? 'line-through' : 'none', transition: 'all .15s' }}>
                    {item.text}
                  </span>
                  <button
                    onClick={() => deleteChecklistItem(item.id, d.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C8B8A8', padding: '2px 4px', flexShrink: 0, display: 'flex', alignItems: 'center' }}
                    title="Remover tarefa"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input
                type="text" value={newTask} onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddTask()}
                placeholder="adicionar tarefa..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={handleAddTask}
                style={{ padding: '8px 12px', borderRadius: 11, background: '#2FA39A', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                <Plus size={16} />
              </button>
            </div>
          </Card>

          {/* Delete */}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#B0917A', fontSize: 13 }}
            >
              <Trash2 size={14} /> Excluir destino
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFF4F2', border: '1px solid #FCC', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ fontSize: 13, color: '#2B2622', flex: 1 }}>Excluir permanentemente?</span>
              <button
                onClick={() => deleteDestination(d.id)}
                style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: '#E8714C', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Excluir
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid #EFE6D7', background: '#fff', color: '#8A8178', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Photos */}
          <Card>
            <Label>{isVisited ? 'Álbum da viagem' : 'Fotos & inspiração'}</Label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))',
                gap: 8, marginTop: 10,
              }}
            >
              {Array.from({ length: isVisited ? 4 : 3 }).map((_, i) => {
                const photo = d.photos?.[i]
                const isUploading = uploadingSlot === i
                return (
                  <div
                    key={i}
                    onClick={() => !isUploading && !photo && photoInputRefs[i]?.current?.click()}
                    style={{
                      height: 116, borderRadius: 10,
                      backgroundImage: photo ? `url(${photo.url})` : undefined,
                      backgroundColor: photo ? undefined : '#F1E9DC',
                      backgroundSize: 'cover', backgroundPosition: 'center',
                      border: '1.5px dashed #EBE1D2',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: photo ? 'default' : 'pointer', color: '#B0917A',
                      position: 'relative', overflow: 'hidden',
                    }}
                  >
                    {isUploading && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 size={22} style={{ color: '#fff', animation: 'spin 1s linear infinite' }} />
                      </div>
                    )}
                    {!photo && !isUploading && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#B0917A' }}>
                        <ImagePlus size={18} />
                        <span style={{ fontSize: 10, fontWeight: 600 }}>Adicionar foto</span>
                      </div>
                    )}
                    <input
                      ref={photoInputRefs[i]}
                      type="file"
                      accept="image/*"
                      onChange={e => handlePhotoUpload(e, i)}
                      style={{ display: 'none' }}
                    />
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Notes */}
          <Card>
            <Label>Anotações & links</Label>
            <textarea
              value={notesText}
              onChange={e => setNotesText(e.target.value)}
              onBlur={() => updateDestination(d.id, { notes: notesText })}
              placeholder="Sites, dicas, links úteis..."
              style={{ ...textareaStyle, marginTop: 10 }}
              rows={4}
            />
          </Card>

          {/* Comments */}
          <Card>
            <Label>Comentários</Label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 10, marginBottom: 14 }}>
              {d.comments?.length === 0 && (
                <p style={{ fontSize: 13, color: '#B0917A' }}>Nenhum comentário ainda.</p>
              )}
              {d.comments?.map(comment => (
                <div key={comment.id} style={{ display: 'flex', gap: 8 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: comment.author?.avatar_color || '#8A8178',
                    flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff',
                  }}>
                    {(comment.author?.name || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#2B2622' }}>{comment.author?.name || 'Você'}</span>
                      <span style={{ fontSize: 11, color: '#B0917A' }}>
                        {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p style={{ fontSize: 14, color: '#2B2622' }}>{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                ref={commentInputRef}
                type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                placeholder="escreva um comentário..."
                style={{ ...inputStyle, flex: 1 }}
              />
              <button onClick={handleAddComment}
                style={{ padding: '8px 12px', borderRadius: 11, background: '#E8714C', color: '#fff', border: 'none', cursor: 'pointer' }}
              >
                <Send size={15} />
              </button>
            </div>
          </Card>
        </div>
      </div>

      <ItinerarySection destinationId={d.id} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #EFE6D7', borderRadius: 16, padding: '18px 20px', ...style }}>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 12, fontWeight: 700, color: '#8A8178', textTransform: 'uppercase', letterSpacing: '.1em' }}>{children}</span>
}

function FactItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#FBF9F4', borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ fontSize: 11, color: '#8A8178', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#2B2622' }}>{value}</div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 13px', borderRadius: 11,
  border: '1.5px solid #EFE6D7', background: '#FBF9F4',
  fontSize: 14, color: '#2B2622', fontFamily: 'inherit',
}

const textareaStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 11,
  border: '1.5px solid #EFE6D7', background: '#FBF9F4',
  fontSize: 14, color: '#2B2622', fontFamily: 'inherit',
  resize: 'vertical',
}
