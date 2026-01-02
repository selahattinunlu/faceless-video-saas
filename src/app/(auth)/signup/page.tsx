import { Suspense } from 'react'
import { SignupForm } from '@/components/auth/signup-form'

export const metadata = {
  title: 'Sign Up - ShortsAI',
  description: 'Create your ShortsAI account',
}

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="font-display text-3xl tracking-wide">CREATE ACCOUNT</h1>
        <p className="text-white/50">Start creating AI-powered videos today</p>
      </div>
      <Suspense fallback={<div className="text-center text-white/50">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  )
}
