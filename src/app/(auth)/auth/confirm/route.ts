import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/generate'
  const code = searchParams.get('code')

  const supabase = await createClient()
  const baseUrl = new URL(request.url).origin

  // Handle PKCE flow (code exchange)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, baseUrl))
    }
  }

  // Handle OTP verification (custom email template)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'email' | 'signup' | 'recovery',
      token_hash,
    })

    if (!error) {
      return NextResponse.redirect(new URL(next, baseUrl))
    }
  }

  // Check if user is already authenticated (default Supabase flow)
  // Supabase verifies at /auth/v1/verify and redirects here with session cookies
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    return NextResponse.redirect(new URL(next, baseUrl))
  }

  // Redirect to login page on failure
  const loginUrl = new URL('/login', baseUrl)
  loginUrl.searchParams.set('error', 'Email verification failed')
  return NextResponse.redirect(loginUrl)
}
