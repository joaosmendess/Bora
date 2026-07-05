'use client'

import { useApp } from '@/contexts/AppContext'
import type { Tab } from '@/lib/types'
import { List, CalendarDays, Map, Target, Plus } from 'lucide-react'

const TABS: { key: Tab; label: string; icon: typeof List }[] = [
  { key: 'lista', label: 'Lista', icon: List },
  { key: 'agenda', label: 'Agenda', icon: CalendarDays },
  { key: 'mapa', label: 'Mapa', icon: Map },
  { key: 'metas', label: 'Metas', icon: Target },
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

export default function BottomNav() {
  const { screen, navigate } = useApp()
  const activeTab = screenToTab(screen)
  const firstHalf = TABS.slice(0, 2)
  const secondHalf = TABS.slice(2)

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur border-t border-border pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-stretch justify-between px-1">
        {firstHalf.map(tab => (
          <NavItem key={tab.key} tab={tab} active={activeTab === tab.key} onClick={() => navigate(tabToScreen(tab.key))} />
        ))}

        <button
          onClick={() => navigate('add')}
          aria-label="Novo destino"
          className="flex flex-col items-center justify-center flex-1 -mt-5"
        >
          <span className="flex items-center justify-center w-12 h-12 rounded-full bg-coral text-white shadow-btn-coral active:scale-95 transition-transform">
            <Plus size={22} />
          </span>
        </button>

        {secondHalf.map(tab => (
          <NavItem key={tab.key} tab={tab} active={activeTab === tab.key} onClick={() => navigate(tabToScreen(tab.key))} />
        ))}
      </div>
    </nav>
  )
}

function NavItem({
  tab,
  active,
  onClick,
}: {
  tab: { key: Tab; label: string; icon: typeof List }
  active: boolean
  onClick: () => void
}) {
  const Icon = tab.icon
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 ${active ? 'text-coral' : 'text-text-soft'}`}
    >
      <Icon size={20} strokeWidth={active ? 2.4 : 2} />
      <span className="text-[11px] font-medium">{tab.label}</span>
    </button>
  )
}
