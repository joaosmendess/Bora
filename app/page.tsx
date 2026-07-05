'use client'

import { useApp } from '@/contexts/AppContext'
import Login from '@/components/screens/Login'
import Dashboard from '@/components/screens/Dashboard'
import AddDestination from '@/components/screens/AddDestination'
import DestinationDetail from '@/components/screens/DestinationDetail'
import MapView from '@/components/screens/MapView'
import Agenda from '@/components/screens/Agenda'
import Goals from '@/components/screens/Goals'
import Group from '@/components/screens/Group'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import Toast from '@/components/Toast'
import CreateGroupModal from '@/components/modals/CreateGroupModal'
import JoinGroupModal from '@/components/modals/JoinGroupModal'

function ScreenContent() {
  const { screen } = useApp()
  switch (screen) {
    case 'dashboard': return <Dashboard />
    case 'add': return <AddDestination />
    case 'detail': return <DestinationDetail />
    case 'map': return <MapView />
    case 'agenda': return <Agenda />
    case 'goals': return <Goals />
    case 'group': return <Group />
    default: return <Dashboard />
  }
}

export default function Home() {
  const { user, loading, modal } = useApp()

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#FBF7EF',
          userSelect: 'none',
        }}
      >
        {/* Pin + pulse rings */}
        <div
          style={{
            position: 'relative',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 108, height: 108, borderRadius: '50%',
              background: 'rgba(232,113,76,.07)',
              animation: 'loadPulse 2.2s ease-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(232,113,76,.12)',
              animation: 'loadPulse 2.2s ease-out infinite .55s',
            }}
          />
          <div
            style={{
              width: 56, height: 56, borderRadius: 18,
              background: 'linear-gradient(140deg, #E8714C 0%, #E8924C 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 20px 42px -12px rgba(232,113,76,.52)',
              animation: 'loadFloat 2.6s ease-in-out infinite',
              position: 'relative', zIndex: 1,
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"
                fill="white"
              />
            </svg>
          </div>
        </div>

        {/* Wordmark */}
        <p
          style={{
            fontFamily: 'var(--font-bricolage), sans-serif',
            fontWeight: 800, fontSize: 36, letterSpacing: '-0.04em',
            color: '#2B2622', lineHeight: 1, marginBottom: 10,
          }}
        >
          bora<span style={{ color: '#E8714C' }}>.</span>
        </p>

        {/* Tagline */}
        <p
          style={{
            fontSize: 14, color: '#8A8178', fontWeight: 500,
            marginBottom: 44, letterSpacing: '0.01em',
          }}
        >
          Os lugares que você vai viver um dia.
        </p>

        {/* Bounce dots */}
        <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{
                display: 'block',
                width: 7, height: 7, borderRadius: '50%',
                background: '#E8714C',
                animation: 'loadDot 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>

        <style>{`
          @keyframes loadFloat {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-11px); }
          }
          @keyframes loadPulse {
            0%   { transform: scale(.75); opacity: 1; }
            100% { transform: scale(2.1); opacity: 0; }
          }
          @keyframes loadDot {
            0%, 55%, 100% { transform: translateY(0);   opacity: .3; }
            27%            { transform: translateY(-7px); opacity: 1;  }
          }
        `}</style>
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <>
      <Navbar />
      <div className="pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-0">
        <ScreenContent />
      </div>
      <BottomNav />
      <Toast />
      {modal === 'create-group' && <CreateGroupModal />}
      {modal === 'join-group' && <JoinGroupModal />}
    </>
  )
}
