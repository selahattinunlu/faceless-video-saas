'use client'

import { useEffect, useState } from 'react'
import { LogOut, User, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/actions/auth'
import { useAuth } from '@/hooks/use-auth'
import { getUserCredits } from '@/actions/credits'
import { UserCredits } from '@/types'

export function UserMenu() {
  const { user, loading } = useAuth()
  const [credits, setCredits] = useState<UserCredits | null>(null)

  useEffect(() => {
    if (user) {
      loadCredits()
    }
  }, [user])

  const loadCredits = async () => {
    try {
      const data = await getUserCredits()
      setCredits(data)
    } catch (error) {
      console.error('Failed to load credits:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      {/* Credits Display */}
      {credits && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm">
          <Coins className="w-3.5 h-3.5" />
          <span className="font-medium">{credits.credits_remaining}</span>
        </div>
      )}

      {/* User Info */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
          <User className="w-4 h-4 text-black" />
        </div>
        <span className="hidden sm:inline max-w-[150px] truncate">
          {user.email}
        </span>
      </div>

      {/* Sign Out */}
      <form action={signOut}>
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">Sign Out</span>
        </Button>
      </form>
    </div>
  )
}
