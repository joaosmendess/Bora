import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { generateInviteCode } from '@/lib/inviteCode'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && user) {
      // Upsert profile
      await supabase.from('profiles').upsert({
        id: user.id,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Viajante',
        email: user.email || '',
        avatar_color: randomColor(),
      })

      // Create personal space if doesn't exist
      const { data: existing } = await supabase
        .from('space_members')
        .select('space_id')
        .eq('profile_id', user.id)
        .limit(1)

      if (!existing || existing.length === 0) {
        const invite_code = generateInviteCode()
        const { data: space } = await supabase.from('spaces')
          .insert({
            name: 'Minhas viagens',
            color: '#E8714C',
            invite_code,
            is_personal: true,
            owner_id: user.id,
          })
          .select().single()

        if (space) {
          await supabase.from('space_members').insert({
            space_id: space.id,
            profile_id: user.id,
            role: 'dono',
          })
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}?error=auth`)
}

function randomColor() {
  const colors = ['#E8714C', '#2FA39A', '#E8B23C', '#7FA86B', '#2B2622', '#8A8178']
  return colors[Math.floor(Math.random() * colors.length)]
}
