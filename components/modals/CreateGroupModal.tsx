'use client'

import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { X } from 'lucide-react'
import { colors } from '@/lib/colors'

const COLORS = [
  colors.coral,
  colors['status-planejando-accent'],
  colors['status-sonho-accent'],
  colors['status-jafui-accent'],
  colors['text-soft'],
  colors.ink,
]

export default function CreateGroupModal() {
  const { dispatch, createSpace, switchSpace, showToast } = useApp()
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [saving, setSaving] = useState(false)

  const handleClose = () => dispatch({ type: 'SET_MODAL', payload: null })

  const handleCreate = async () => {
    if (!name.trim()) return
    setSaving(true)
    const space = await createSpace(name.trim(), color)
    if (space) {
      switchSpace(space)
      showToast(`Grupo "${name}" criado!`)
      handleClose()
    }
    setSaving(false)
  }

  return (
    <ModalOverlay onClose={handleClose}>
      <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 24, color: colors.ink, letterSpacing: '-0.02em', marginBottom: 20 }}>
        Criar um grupo
      </h2>

      <Field label="Nome do grupo">
        <input
          type="text" value={name} onChange={e => setName(e.target.value)}
          placeholder="ex: Viagens da turma, Família 2025..."
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          autoFocus
          style={inputStyle}
        />
      </Field>

      <Field label="Cor do espaço">
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)}
              style={{
                width: 32, height: 32, borderRadius: '50%', background: c,
                border: color === c ? `3px solid ${colors.ink}` : '3px solid transparent',
                cursor: 'pointer', transition: 'border .15s',
              }}
            />
          ))}
        </div>
      </Field>

      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <button onClick={handleCreate} disabled={saving || !name.trim()}
          style={{
            flex: 1, padding: '12px', borderRadius: 12, border: 'none',
            background: colors.coral, color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: !name.trim() || saving ? 'not-allowed' : 'pointer',
            opacity: !name.trim() || saving ? .5 : 1,
            boxShadow: '0 8px 18px -8px rgba(232,113,76,.8)',
          }}
        >
          {saving ? 'Criando...' : 'Criar grupo'}
        </button>
        <button onClick={handleClose}
          style={{ padding: '12px 20px', borderRadius: 12, border: `1.5px solid ${colors.border}`, background: '#fff', color: colors['text-soft'], fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
        >
          Cancelar
        </button>
      </div>
    </ModalOverlay>
  )
}

export function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(43,38,34,.5)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="animate-bora-pop"
        style={{
          background: '#fff', borderRadius: 24, padding: '28px 30px',
          maxWidth: 440, width: '100%', position: 'relative',
          boxShadow: '0 40px 80px -30px rgba(0,0,0,.55)',
        }}
      >
        <button onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: colors['text-soft'], padding: 4 }}
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: colors['text-soft'], textTransform: 'uppercase', letterSpacing: '.08em', display: 'block', marginBottom: 7 }}>
        {label}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 11,
  border: `1.5px solid ${colors.border}`, background: colors.paper,
  fontSize: 14, color: colors.ink, fontFamily: 'inherit',
}
