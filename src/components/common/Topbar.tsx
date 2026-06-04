'use client'

import { Menu, LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { ThemeToggle } from './ThemeToggle'
import { NotificationBell } from './NotificationBell'

export function Topbar() {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()
  const { toggleSidebar, toggleMobileNav } = useUIStore()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    clearAuth()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex rounded-button p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        <button
          onClick={toggleMobileNav}
          className="flex lg:hidden rounded-button p-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Toggle mobile nav"
        >
          <Menu size={18} />
        </button>
        <span className="text-lg font-bold text-primary lg:hidden">PropCRM</span>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NotificationBell />
        <div className="hidden sm:flex items-center gap-2 ml-2 pl-2 border-l border-border">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User size={14} />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-foreground">{user?.full_name || 'User'}</p>
            <p className="text-[10px] text-muted-foreground capitalize">{user?.role?.replace('_', ' ') || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="rounded-button p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors"
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}
