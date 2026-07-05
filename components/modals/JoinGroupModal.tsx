'use client'

import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { ModalOverlay } from './CreateGroupModal'
import { colors } from '@/lib/colors'

export default function JoinGroupModal() {
  const { dispatch, joinSpace, showToast } = useApp()
  const [code, setCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  const handleClose = () => dispatch({ type: 'SET_MODAL', payload: null })

  const handleJoin = async () => {
    if (!code.trim()) return
    setJoining(true)
    setError('')
    const ok = await joinSpace(code.trim())
    if (ok) {
      showToast('Entrou no grupo!')
      handleClose()
    } else {
      setError('Código ou link inválido. Tente novamente.')
    }
    setJoining(false)
  }

  return (
    <ModalOverlay onClose={handleClose}>
      <h2 style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 800, fontSize: 24, color: colors.ink, letterSpacing: '-0.02em', marginBottom: 8 }}>
        Entrar com um link
      </h2>
      <p style={{ fontSize: 14, color: colors['text-soft'], marginBottom: 22 }}>
        Cole o link de convite ou o código do grupo.
      </p>

      <input
        type="text" value={code} onChange={e => { setCode(e.target.value); setError('') }}
        placeholder="https://bora.app/entrar/abc123 ou abc123"
        onKeyDown={e => e.key === 'Enter' && handleJoin()}
        autoFocus
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 11,
          border: `1.5px solid ${error ? colors.coral : colors.border}`, background: colors.paper,
          fontSize: 14, color: colors.ink, fontFamily: 'inherit',
          marginBottom: error ? 8 : 20,
        }}
      />
      {error && <p style={{ fontSize: 13, color: colors.coral, marginBottom: 16 }}>{error}</p>}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={handleJoin} disabled={joining || !code.trim()}
          style={{
            flex: 1, padding: '12px', borderRadius: 12, border: 'none',
            background: colors.coral, color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: !code.trim() || joining ? 'not-allowed' : 'pointer',
            opacity: !code.trim() || joining ? .5 : 1,
            boxShadow: '0 8px 18px -8px rgba(232,113,76,.8)',
          }}
        >
          {joining ? 'Entrando...' : 'Entrar no grupo'}
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
