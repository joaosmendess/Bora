'use client'

import { useState } from 'react'
import { useApp } from '@/contexts/AppContext'
import { Link2, Copy, Check, LogOut, Users, Trash2, DoorOpen } from 'lucide-react'
import { colors } from '@/lib/colors'

export default function Group() {
  const { currentSpace, user, showToast, signOut, navigate, deleteSpace, leaveSpace } = useApp()
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [busy, setBusy] = useState(false)

  if (!currentSpace) {
    return (
      <main style={{ maxWidth: 620, margin: '0 auto', padding: 'clamp(22px,4vw,42px) clamp(16px,3vw,34px)', animation: 'boraFade .4s ease both', textAlign: 'center', paddingTop: 80 }}>
        <Users size={36} style={{ color: colors.border, margin: '0 auto 16px' }} />
        <p style={{ fontSize: 15, fontWeight: 600, color: colors.ink, marginBottom: 6 }}>Nenhum grupo selecionado</p>
        <p style={{ fontSize: 13, color: colors['text-soft'], marginBottom: 20 }}>Crie ou entre em um grupo pela barra de navegação.</p>
        <button
          onClick={() => navigate('dashboard')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#fff', border: `1.5px solid ${colors.border}`, borderRadius: 12,
            padding: '9px 18px', fontSize: 13, fontWeight: 600, color: colors.ink, cursor: 'pointer',
          }}
        >
          Voltar para a lista
        </button>
      </main>
    )
  }

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://bora.app'}/entrar/${currentSpace.invite_code}`
  const members = currentSpace.members || []
  const isOwner = currentSpace.owner_id === user?.id
  const isPersonal = currentSpace.is_personal

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    showToast('Link copiado')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main
      style={{
        maxWidth: 620, margin: '0 auto',
        padding: 'clamp(22px,4vw,42px) clamp(16px,3vw,34px)',
        animation: 'boraFade .4s ease both',
      }}
    >
      {/* Space header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <div
          style={{
            width: 64, height: 64, borderRadius: 18,
            background: currentSpace.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M3 11l19 -9 -9 19 -2 -8 -8 -2z" />
          </svg>
        </div>
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-bricolage), sans-serif',
              fontWeight: 800, fontSize: 28, color: colors.ink, letterSpacing: '-0.02em',
            }}
          >
            {currentSpace.name}
          </h1>
          <p style={{ fontSize: 14, color: colors['text-soft'] }}>
            {members.length} membro{members.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Invite link */}
      <div style={{ background: colors.ink, borderRadius: 16, padding: '20px 22px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Link2 size={14} style={{ color: 'rgba(255,255,255,.6)' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            Link de convite
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              flex: 1, fontFamily: 'ui-monospace, monospace',
              fontSize: 13, color: '#fff',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {inviteLink}
          </span>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: copied ? colors.coral : 'rgba(255,255,255,.15)',
              border: 'none', borderRadius: 8, padding: '8px 14px',
              color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all .2s', flexShrink: 0,
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Members */}
      <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${colors.border}` }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: colors['text-soft'], textTransform: 'uppercase', letterSpacing: '.1em' }}>Membros</span>
        </div>
        {members.length === 0 && (
          <div style={{ padding: '24px 20px', textAlign: 'center', color: colors['text-soft'], fontSize: 14 }}>
            Nenhum membro ainda. Compartilhe o link de convite!
          </div>
        )}
        {members.map((m, i) => (
          <div
            key={m.profile_id}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 20px',
              borderTop: i > 0 ? `1px solid ${colors.border}` : 'none',
            }}
          >
            <div
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: m.profile?.avatar_color || colors['text-soft'],
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}
            >
              {(m.profile?.name || '?')[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>
                {m.profile?.name || 'Membro'}
                {m.profile_id === user?.id && ' (você)'}
              </p>
            </div>
            <span
              style={{
                fontSize: 11, fontWeight: 700, borderRadius: 6,
                padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '.08em',
                background: m.role === 'dono' ? colors['status-sonho'] : colors.paper,
                color: m.role === 'dono' ? '#D97706' : colors['text-soft'],
              }}
            >
              {m.role === 'dono' ? 'Admin' : 'Membro'}
            </span>
          </div>
        ))}
      </div>

      {/* Group actions: delete (owner) or leave (member) */}
      {!isPersonal && (
        <div style={{ marginBottom: 12 }}>
          {isOwner ? (
            confirmDelete ? (
              <div style={{ background: colors['danger-bg'], border: `1px solid ${colors['danger-border']}`, borderRadius: 14, padding: '16px 18px' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: colors.ink, marginBottom: 4 }}>
                  Excluir &quot;{currentSpace.name}&quot;?
                </p>
                <p style={{ fontSize: 13, color: colors['text-soft'], marginBottom: 14 }}>
                  Todos os destinos e dados do grupo serão apagados permanentemente.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true)
                      const ok = await deleteSpace(currentSpace.id)
                      if (ok) { showToast('Grupo excluído.'); navigate('dashboard') }
                      setBusy(false)
                      setConfirmDelete(false)
                    }}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                      background: colors.coral, color: '#fff', fontSize: 14, fontWeight: 700,
                      cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? .6 : 1,
                    }}
                  >
                    {busy ? 'Excluindo...' : 'Sim, excluir'}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    style={{
                      padding: '10px 18px', borderRadius: 10,
                      border: `1.5px solid ${colors.border}`, background: '#fff',
                      color: colors['text-soft'], fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: `1.5px solid ${colors['danger-border']}`, borderRadius: 12,
                  padding: '12px 16px', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600, color: colors.coral,
                  width: '100%', justifyContent: 'center', transition: 'all .15s',
                }}
              >
                <Trash2 size={15} />
                Excluir grupo
              </button>
            )
          ) : (
            confirmLeave ? (
              <div style={{ background: colors.paper, border: `1px solid ${colors.border}`, borderRadius: 14, padding: '16px 18px' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: colors.ink, marginBottom: 4 }}>
                  Sair de &quot;{currentSpace.name}&quot;?
                </p>
                <p style={{ fontSize: 13, color: colors['text-soft'], marginBottom: 14 }}>
                  Você perderá o acesso aos destinos deste grupo.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true)
                      const ok = await leaveSpace(currentSpace.id)
                      if (ok) { showToast('Você saiu do grupo.'); navigate('dashboard') }
                      setBusy(false)
                      setConfirmLeave(false)
                    }}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 10, border: 'none',
                      background: colors.ink, color: '#fff', fontSize: 14, fontWeight: 700,
                      cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? .6 : 1,
                    }}
                  >
                    {busy ? 'Saindo...' : 'Sim, sair'}
                  </button>
                  <button
                    onClick={() => setConfirmLeave(false)}
                    style={{
                      padding: '10px 18px', borderRadius: 10,
                      border: `1.5px solid ${colors.border}`, background: '#fff',
                      color: colors['text-soft'], fontSize: 14, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmLeave(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'none', border: `1.5px solid ${colors.border}`, borderRadius: 12,
                  padding: '12px 16px', cursor: 'pointer',
                  fontSize: 14, fontWeight: 600, color: colors['text-soft'],
                  width: '100%', justifyContent: 'center', transition: 'all .15s',
                }}
              >
                <DoorOpen size={15} />
                Sair do grupo
              </button>
            )
          )}
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={signOut}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: `1.5px solid ${colors.border}`, borderRadius: 12,
          padding: '12px 16px', cursor: 'pointer',
          fontSize: 14, fontWeight: 600, color: colors['text-soft'],
          transition: 'all .15s',
          width: '100%', justifyContent: 'center',
        }}
      >
        <LogOut size={15} />
        Sair da conta
      </button>
    </main>
  )
}
