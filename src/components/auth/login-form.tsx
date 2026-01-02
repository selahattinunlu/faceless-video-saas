'use client'

import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, type AuthState } from '@/actions/auth'

export function LoginForm() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
  const errorParam = searchParams.get('error')

  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signIn,
    { error: errorParam || undefined }
  )

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

      <input type="hidden" name="redirectTo" value={redirectTo || ''} />

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/70">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            required
            className="pl-10 bg-white/5 border-white/10 focus:border-[#00E5FF]/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/70">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            required
            minLength={6}
            className="pl-10 bg-white/5 border-white/10 focus:border-[#00E5FF]/50"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#00E5FF] hover:bg-[#00D4E8] text-black font-semibold"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      <p className="text-center text-sm text-white/50">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#00E5FF] hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  )
}
