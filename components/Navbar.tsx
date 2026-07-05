'use client'

import { useRef, useEffect } from 'react'
import { useApp } from '@/contexts/AppContext'
import type { Tab } from '@/lib/types'
import { ChevronDown, Plus, Users, LogOut, Check } from 'lucide-react'
import { colors } from '@/lib/colors'

const TABS: { key: Tab; label: string }[] = [
  { key: 'lista', label: 'Lista' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'mapa', label: 'Mapa' },
  { key: 'metas', label: 'Metas' },
]

function tabToScreen(tab: Tab) {
  if (tab === 'lista') return 'dashboard' as const
  if (tab === 'agenda') return 'agenda' as const
  if (tab === 'mapa') return 'map' as const
  return 'goals' as const
}

function screenToTab(screen: string): Tab {
  if (screen === 'dashboard' || screen === 'add' || screen === 'detail') return 'lista'
  if (screen === 'agenda') return 'agenda'
  if (screen === 'map') return 'mapa'
  if (screen === 'goals') return 'metas'
  return 'lista'
}

export default function Navbar() {
  const { currentSpace, spaces, screen, spaceMenuOpen, user, dispatch, navigate, signOut, switchSpace } = useApp()
  const menuRef = useRef<HTMLDivElement>(null)
  const activeTab = screenToTab(screen)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        dispatch({ type: 'SET_SPACE_MENU', payload: false })
      }
    }
    if (spaceMenuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [spaceMenuOpen, dispatch])

  const members = currentSpace?.members || []

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(248,250,252,.82)',
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1180, margin: '0 auto',
          padding: '13px clamp(16px,3vw,34px)',
          display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap',
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate('dashboard')}
          style={{
            fontFamily: 'var(--font-bricolage), sans-serif',
            fontWeight: 800, fontSize: 25,
            color: colors.ink, letterSpacing: '-0.03em',
            background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}
        >
          bora<span style={{ color: colors.coral }}>.</span>
        </button>

        {/* Space selector */}
        <div style={{ position: 'relative', flexShrink: 0 }} ref={menuRef}>
          <button
            onClick={() => dispatch({ type: 'SET_SPACE_MENU', payload: !spaceMenuOpen })}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#fff', border: `1.5px solid ${colors.border}`, borderRadius: 12,
              padding: '7px 12px', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, color: colors.ink,
            }}
          >
            {/* Space icon */}
            <div
              style={{
                width: 24, height: 24, borderRadius: 6,
                background: currentSpace?.color || colors.coral,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                <path d="M3 11l19 -9 -9 19 -2 -8 -8 -2z" />
              </svg>
            </div>
            <span style={{ maxWidth: 'clamp(70px, 30vw, 120px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentSpace?.name || 'Selecionar espaço'}
            </span>
            <span className="hidden sm:inline" style={{ fontSize: 12, color: colors['text-soft'] }}>
              {members.length > 0 ? `${members.length} membro${members.length !== 1 ? 's' : ''}` : ''}
            </span>
            <ChevronDown size={14} style={{ color: colors['text-soft'], flexShrink: 0 }} />
          </button>

          {/* Dropdown */}
          {spaceMenuOpen && (
            <div
              className="animate-bora-pop w-[280px] max-w-[calc(100vw-32px)]"
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                background: '#fff', borderRadius: 16,
                boxShadow: '0 24px 50px -24px rgba(15,23,42,.5)',
                border: `1px solid ${colors.border}`,
                overflow: 'hidden', zIndex: 100,
              }}
            >
              <div style={{ padding: '8px 0' }}>
                {spaces.map(s => (
                  <button
                    key={s.id}
                    onClick={() => switchSpace(s)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 14, fontWeight: 500, color: colors.ink,
                      textAlign: 'left',
                    }}
                    className="hover:bg-paper"
                  >
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: s.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M3 11l19 -9 -9 19 -2 -8 -8 -2z" /></svg>
                    </div>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
                    {currentSpace?.id === s.id && <Check size={13} style={{ marginLeft: 'auto', color: colors.coral, flexShrink: 0 }} />}
                  </button>
                ))}
              </div>
              <div style={{ borderTop: `1px solid ${colors.border}`, padding: '8px 0' }}>
                <button
                  onClick={() => { dispatch({ type: 'SET_MODAL', payload: 'create-group' }); dispatch({ type: 'SET_SPACE_MENU', payload: false }) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 500, color: colors.ink, textAlign: 'left',
                  }}
                  className="hover:bg-paper"
                >
                  <Plus size={16} style={{ color: colors['text-soft'] }} />
                  Criar um grupo
                </button>
                <button
                  onClick={() => { dispatch({ type: 'SET_MODAL', payload: 'join-group' }); dispatch({ type: 'SET_SPACE_MENU', payload: false }) }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 500, color: colors.ink, textAlign: 'left',
                  }}
                  className="hover:bg-paper"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors['text-soft']} strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  Entrar com um link
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs (desktop only — mobile uses the bottom tab bar) */}
        <nav
          className="hidden md:flex"
          style={{
            background: colors.paper, borderRadius: 12,
            padding: 4, gap: 0, flexShrink: 0,
          }}
        >
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => navigate(tabToScreen(tab.key))}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 500,
                background: activeTab === tab.key ? '#fff' : 'transparent',
                color: activeTab === tab.key ? colors.ink : colors['text-soft'],
                boxShadow: activeTab === tab.key ? '0 1px 3px rgba(15,23,42,.08)' : 'none',
                transition: 'all .15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Member avatars */}
        {members.length > 0 && (
          <button onClick={() => navigate('group')} style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer' }}>
            <AvatarStack members={members.slice(0, 4)} size={32} />
          </button>
        )}
        {members.length === 0 && user && (
          <button onClick={() => navigate('group')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer' }}>
            <Users size={16} style={{ color: colors['text-soft'] }} />
          </button>
        )}

        {/* Sign out */}
        {user && (
          <button
            onClick={signOut}
            title="Sair da conta"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: colors['text-soft'], padding: '10px', borderRadius: 10, minWidth: 40, minHeight: 40 }}
          >
            <LogOut size={16} />
          </button>
        )}

        {/* New destination button (desktop only — mobile uses the bottom tab bar's + button) */}
        <button
          onClick={() => navigate('add')}
          style={{
            alignItems: 'center', gap: 6,
            background: colors.coral, color: '#fff',
            border: 'none', borderRadius: 12, padding: '8px 16px',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 8px 18px -8px rgba(240,104,64,.8)',
            transition: 'all .15s',
          }}
          className="hidden md:flex hover:opacity-90 active:scale-95"
        >
          <Plus size={16} />
          Novo destino
        </button>
      </div>
    </header>
  )
}

function AvatarStack({ members, size = 32 }: { members: { profile?: { name?: string; avatar_color?: string } }[], size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {members.map((m, i) => {
        const name = m.profile?.name || '?'
        const color = m.profile?.avatar_color || colors['text-soft']
        return (
          <div
            key={i}
            style={{
              width: size, height: size,
              borderRadius: '50%', background: color,
              border: `2.5px solid ${colors.paper}`,
              marginLeft: i === 0 ? 0 : -8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: size * 0.38, fontWeight: 700, color: '#fff',
              zIndex: members.length - i,
              position: 'relative',
              flexShrink: 0,
            }}
            title={name}
          >
            {name[0]?.toUpperCase()}
          </div>
        )
      })}
    </div>
  )
}
