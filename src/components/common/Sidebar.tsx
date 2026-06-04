'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Building2, Users, Shield, CreditCard, BarChart3,
  ScrollText, Settings, Home, FolderOpen, FileText, Files, MapPin,
  Share2, UserPlus, Kanban, Calendar, CheckSquare, Phone, Clock,
  ClipboardList, PlusCircle, ChevronLeft, ChevronRight, type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { ROLE_NAV, type Role } from '@/constants/roles'
import { cn } from '@/lib/utils/cn'

const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard, Building2, Users, Shield, CreditCard, BarChart3,
  ScrollText, Settings, Home, FolderOpen, FileText, Files, MapPin,
  Share2, UserPlus, Kanban, Calendar, CheckSquare, Phone, Clock,
  ClipboardList, PlusCircle,
}

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const [hovered, setHovered] = useState(false)

  const role = user?.role as Role | null
  const navItems = role ? ROLE_NAV[role] : []

  const isExpanded = sidebarOpen || hovered

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar transition-all duration-200 ease-in-out border-r border-white/5',
        isExpanded ? 'w-60' : 'w-16'
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex h-14 items-center justify-between px-4 border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-button bg-primary">
            <span className="text-sm font-bold text-white">PC</span>
          </div>
          <span className={cn('text-lg font-bold text-white whitespace-nowrap transition-opacity duration-200', isExpanded ? 'opacity-100' : 'opacity-0')}>
            PropCRM
          </span>
        </Link>
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex text-sidebar-text hover:text-white transition-colors"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon] || LayoutDashboard
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-button px-3 py-2.5 text-sm font-medium transition-colors animate-slide-in-left',
                isActive ? 'bg-primary/10 text-primary' : 'text-sidebar-text hover:bg-white/5 hover:text-white',
                !isExpanded && 'justify-center px-2'
              )}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              <span className={cn('whitespace-nowrap overflow-hidden transition-opacity duration-200', isExpanded ? 'opacity-100' : 'opacity-0 w-0')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-white/5 p-3">
        <div className={cn('flex items-center gap-3 rounded-button px-3 py-2', !isExpanded && 'justify-center px-2')}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white text-xs font-bold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className={cn('overflow-hidden transition-opacity duration-200', isExpanded ? 'opacity-100' : 'opacity-0 w-0')}>
            <p className="text-sm font-medium text-white truncate">{user?.full_name || 'User'}</p>
            <p className="text-[10px] text-sidebar-text capitalize">{role?.replace('_', ' ') || ''}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
