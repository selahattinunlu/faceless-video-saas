'use client'

import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/actions/auth'
import { useAuth } from '@/hooks/use-auth'

export function UserMenu() {
  const { user, loading } = useAuth()

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
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
          <User className="w-4 h-4 text-black" />
        </div>
        <span className="hidden sm:inline max-w-[150px] truncate">
          {user.email}
        </span>
      </div>
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
