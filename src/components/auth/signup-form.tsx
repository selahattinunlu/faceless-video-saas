'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp, type AuthState } from '@/actions/auth'

export function SignupForm() {
  const [state, formAction, isPending] = useActionState<AuthState, FormData>(
    signUp,
    {}
  )

  return (
    <form action={formAction} className="space-y-6">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
          {state.error}
        </div>
      )}

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
            placeholder="At least 6 characters"
            required
            minLength={6}
            className="pl-10 bg-white/5 border-white/10 focus:border-[#00E5FF]/50"
          />
        </div>
        <p className="text-xs text-white/40">Must be at least 6 characters</p>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-[#00E5FF] hover:bg-[#00D4E8] text-black font-semibold"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          'Create Account'
        )}
      </Button>

      <p className="text-center text-sm text-white/50">
        Already have an account?{' '}
        <Link href="/login" className="text-[#00E5FF] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}
