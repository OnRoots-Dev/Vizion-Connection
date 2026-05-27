import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(
        new URL(next !== '/dashboard' ? next : '/thanks?type=verified', request.url)
      )
    }
  }

  // token_hash フロー（フォールバック）
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'email' | null

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ token_hash, type })
    if (!error) {
      return NextResponse.redirect(
        new URL(next !== '/dashboard' ? next : '/thanks?type=verified', request.url)
      )
    }
  }

  return NextResponse.redirect(
    new URL('/login?error=confirmation_failed', request.url)
  )
}
