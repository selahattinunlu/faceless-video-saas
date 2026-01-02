import { Mail } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Verify Email - ShortsAI',
  description: 'Check your email to verify your account',
}

export default function VerifyEmailPage() {
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-[#00E5FF]/10 rounded-full flex items-center justify-center mx-auto">
        <Mail className="w-8 h-8 text-[#00E5FF]" />
      </div>

      <div className="space-y-2">
        <h1 className="font-display text-3xl tracking-wide">CHECK YOUR EMAIL</h1>
        <p className="text-white/50">
          We&apos;ve sent you a verification link. Please check your email and click the link to verify your account.
        </p>
      </div>

      <div className="pt-4">
        <p className="text-sm text-white/40 mb-4">
          Didn&apos;t receive the email? Check your spam folder or try signing up again.
        </p>
        <Button asChild variant="outline" className="border-white/10">
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </div>
    </div>
  )
}
