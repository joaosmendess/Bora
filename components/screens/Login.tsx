'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function Login() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div
        className="w-full animate-bora-pop"
        style={{ maxWidth: 940, borderRadius: 28, overflow: 'hidden', boxShadow: '0 40px 80px -30px rgba(0,0,0,.18)' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {/* Left column — visual */}
          <div
            className="relative overflow-hidden flex flex-col justify-end p-10 min-h-[380px]"
            style={{
              backgroundImage: `
                linear-gradient(150deg, #E8714C, #E8924C, #E8B23C),
                radial-gradient(circle, rgba(255,255,255,.18) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 20px 20px',
            }}
          >
            {/* Dashed circles */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className="absolute"
                style={{
                  width: 280, height: 280,
                  border: '1.5px dashed rgba(255,255,255,.35)',
                  borderRadius: '50%',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
              <div
                className="absolute"
                style={{
                  width: 180, height: 180,
                  border: '1.5px dashed rgba(255,255,255,.25)',
                  borderRadius: '50%',
                  top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>

            {/* Floating icon */}
            <div
              className="absolute"
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -60%)', animation: 'boraFloat 4s ease-in-out infinite' }}
            >
              <div
                style={{
                  width: 72, height: 72,
                  background: 'rgba(255,255,255,.22)',
                  borderRadius: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <svg width="34" height="34" viewBox="0 0 24 24" fill="white">
                  <path d="M3 11l19 -9 -9 19 -2 -8 -8 -2z" />
                </svg>
              </div>
            </div>

            {/* Title */}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1
                style={{
                  fontFamily: 'var(--font-bricolage), sans-serif',
                  fontWeight: 800,
                  fontSize: 'clamp(34px, 5vw, 48px)',
                  color: '#fff',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  marginBottom: 12,
                }}
              >
                Os lugares que você vai viver um dia.
              </h1>
              <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 15 }}>
                Salve destinos dos sonhos e planeje viagens com amigos.
              </p>
            </div>
          </div>

          {/* Right column — auth */}
          <div className="bg-white flex flex-col justify-center p-10 gap-6">
            <div>
              <h2
                style={{
                  fontFamily: 'var(--font-bricolage), sans-serif',
                  fontWeight: 800,
                  fontSize: 28,
                  color: '#2B2622',
                  letterSpacing: '-0.02em',
                  marginBottom: 8,
                }}
              >
                Entrar na sua conta
              </h2>
              <p style={{ color: '#8A8178', fontSize: 15 }}>
                Organize seus destinos dos sonhos, sozinho ou com amigos.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center gap-3 justify-center transition-all hover:shadow-md active:scale-[.98]"
              style={{
                background: '#fff',
                border: '1.5px solid #E6DCCB',
                borderRadius: 14,
                padding: '14px 20px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 15,
                fontWeight: 600,
                color: '#2B2622',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? 'Entrando...' : 'Continuar com o Google'}
            </button>

            <p style={{ fontSize: 13, color: '#B0917A', textAlign: 'center' }}>
              Ao entrar você concorda com os nossos termos e política de privacidade.
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
