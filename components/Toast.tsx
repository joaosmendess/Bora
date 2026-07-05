'use client'

import { useApp } from '@/contexts/AppContext'
import { X } from 'lucide-react'
import { colors } from '@/lib/colors'

export default function Toast() {
  const { toast, dispatch } = useApp()
  if (!toast) return null

  return (
    <div
      role="status"
      aria-live="polite"
      onClick={() => dispatch({ type: 'SET_TOAST', payload: null })}
      style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        background: colors.ink, color: '#fff',
        borderRadius: 30, padding: '10px 18px 10px 22px',
        fontSize: 14, fontWeight: 600,
        boxShadow: '0 8px 24px rgba(43,38,34,.3)',
        zIndex: 9999,
        animation: 'boraPop .5s cubic-bezier(.2,.8,.2,1) both',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
    >
      {toast.message}
      <X size={14} style={{ opacity: 0.6, flexShrink: 0 }} />
    </div>
  )
}
