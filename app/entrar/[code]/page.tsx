'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useApp } from '@/contexts/AppContext'

export default function EntrarPage() {
  const params = useParams()
  const router = useRouter()
  const { user, joinSpace, showToast } = useApp()
  const code = params.code as string

  useEffect(() => {
    if (!user) {
      // Save code to sessionStorage and redirect to login
      sessionStorage.setItem('pending_invite', code)
      router.push('/')
      return
    }

    joinSpace(code).then(ok => {
      if (ok) {
        showToast('Entrou no grupo!')
      } else {
        showToast('Link inválido ou expirado.')
      }
      router.push('/')
    })
  }, [user, code, joinSpace, showToast, router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF7EF' }}>
      <p style={{ fontFamily: 'var(--font-bricolage), sans-serif', fontWeight: 700, fontSize: 18, color: '#8A8178' }}>
        Entrando no grupo...
      </p>
    </div>
  )
}
