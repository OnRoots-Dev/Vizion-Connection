import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code && type === 'email_change') {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      await supabase.from('users').update({ email: data.user.email }).eq('auth_id', data.user.id)
      return NextResponse.redirect(new URL('/thanks?type=email_changed', request.url))
    }
  }

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const role = data.session?.user?.user_metadata?.role as string | undefined
      const defaultNext = role === 'Business' ? '/dashboard/business/checkout' : '/onboarding'
      return NextResponse.redirect(
        new URL(next !== '/dashboard' ? next : defaultNext, request.url)
      )
    }
  }

  // token_hash フロー（フォールバック）
  const token_hash = searchParams.get('token_hash')
  const otpType = searchParams.get('type') as 'email' | null

  if (token_hash && otpType) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type: otpType })
    if (!error) {
      const role = data.session?.user?.user_metadata?.role as string | undefined
      const defaultNext = role === 'Business' ? '/dashboard/business/checkout' : '/onboarding'
      return NextResponse.redirect(
        new URL(next !== '/dashboard' ? next : defaultNext, request.url)
      )
    }
  }

  return NextResponse.redirect(
    new URL('/login?error=confirmation_failed', request.url)
  )
}
