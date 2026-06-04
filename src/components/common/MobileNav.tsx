'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { ROLE_NAV, type Role } from '@/constants/roles'
import { cn } from '@/lib/utils/cn'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard, Building2, Users, Shield, CreditCard, BarChart3,
  ScrollText, Settings, Home, FolderOpen, FileText, Files, MapPin,
  Share2, UserPlus, Kanban, Calendar, CheckSquare, Phone, Clock,
  ClipboardList, PlusCircle,
} from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Building2, Users, Shield, CreditCard, BarChart3,
  ScrollText, Settings, Home, FolderOpen, FileText, Files, MapPin,
  Share2, UserPlus, Kanban, Calendar, CheckSquare, Phone, Clock,
  ClipboardList, PlusCircle,
}

export function MobileNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const role = user?.role as Role | null
  const navItems = role ? ROLE_NAV[role].slice(0, 5) : []

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-white/10 lg:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon] || LayoutDashboard
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('flex flex-col items-center gap-0.5 px-2 py-1 rounded-button transition-colors', isActive ? 'text-primary' : 'text-sidebar-text')}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium truncate max-w-[48px] overflow-hidden">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
