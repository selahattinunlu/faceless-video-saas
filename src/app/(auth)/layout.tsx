import { Video } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-body flex flex-col items-center justify-center p-6">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00E5FF] opacity-[0.05] blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFB800] opacity-[0.03] blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2" />
      </div>

      {/* Logo */}
      <Link href="/" className="relative z-10 flex items-center gap-3 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-[#00E5FF] blur-xl opacity-40" />
          <div className="relative bg-gradient-to-br from-[#00E5FF] to-[#00B4CC] w-11 h-11 rounded-xl flex items-center justify-center">
            <Video className="h-6 w-6 text-black" />
          </div>
        </div>
        <span className="font-display text-2xl tracking-wider text-white">
          SHORTS<span className="text-[#00E5FF]">AI</span>
        </span>
      </Link>

      {/* Auth card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-8 backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
