import { Suspense } from 'react'
import { LoginForm } from '@/components/auth/login-form'

export const metadata = {
  title: 'Sign In - ShortsAI',
  description: 'Sign in to your ShortsAI account',
}

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-display text-3xl tracking-wide">WELCOME BACK</h1>
        <p className="text-white/50">Sign in to continue creating videos</p>
      </div>
      <Suspense fallback={<div className="text-center text-white/50">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
