export type Role = 'super_admin' | 'admin' | 'manager' | 'caller' | 'field_exec' | 'social_manager'

export const ROLES: Role[] = [
  'super_admin',
  'admin',
  'manager',
  'caller',
  'field_exec',
  'social_manager',
]

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  caller: 'Caller',
  field_exec: 'Field Executive',
  social_manager: 'Social Manager',
}

export const ROUTE_MAP: Record<Role, string> = {
  super_admin: '/super-admin/dashboard',
  admin: '/admin/dashboard',
  manager: '/manager/dashboard',
  caller: '/caller/dashboard',
  field_exec: '/field/dashboard',
  social_manager: '/social/calendar',
}

export const ROLE_NAV: Record<Role, { label: string; href: string; icon: string }[]> = {
  super_admin: [
    { label: 'Dashboard', href: '/super-admin/dashboard', icon: 'LayoutDashboard' },
    { label: 'Branches', href: '/super-admin/branches', icon: 'Building2' },
    { label: 'Users', href: '/super-admin/users', icon: 'Users' },
    { label: 'Permissions', href: '/super-admin/permissions', icon: 'Shield' },
    { label: 'Billing', href: '/super-admin/billing', icon: 'CreditCard' },
    { label: 'Reports', href: '/super-admin/reports', icon: 'BarChart3' },
    { label: 'Audit Logs', href: '/super-admin/audit-logs', icon: 'ScrollText' },
    { label: 'Settings', href: '/super-admin/settings', icon: 'Settings' },
  ],
  admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'LayoutDashboard' },
    { label: 'Team', href: '/admin/team', icon: 'Users' },
    { label: 'Leads', href: '/admin/leads', icon: 'UserPlus' },
    { label: 'Pipeline', href: '/admin/pipeline', icon: 'Kanban' },
    { label: 'Properties', href: '/admin/properties', icon: 'Home' },
    { label: 'Assets', href: '/admin/assets', icon: 'FolderOpen' },
    { label: 'Reports', href: '/admin/reports', icon: 'BarChart3' },
    { label: 'Templates', href: '/admin/templates', icon: 'FileText' },
    { label: 'Documents', href: '/admin/documents', icon: 'Files' },
    { label: 'Attendance', href: '/admin/attendance', icon: 'MapPin' },
    { label: 'Social', href: '/admin/social', icon: 'Share2' },
    { label: 'Settings', href: '/admin/settings', icon: 'Settings' },
  ],
  manager: [
    { label: 'Dashboard', href: '/manager/dashboard', icon: 'LayoutDashboard' },
    { label: 'My Team', href: '/manager/my-team', icon: 'Users' },
    { label: 'Leads', href: '/manager/leads', icon: 'UserPlus' },
    { label: 'Pipeline', href: '/manager/pipeline', icon: 'Kanban' },
    { label: 'Assets', href: '/manager/assets', icon: 'FolderOpen' },
    { label: 'Appointments', href: '/manager/appointments', icon: 'Calendar' },
    { label: 'Tasks', href: '/manager/tasks', icon: 'CheckSquare' },
    { label: 'Reports', href: '/manager/reports', icon: 'BarChart3' },
  ],
  caller: [
    { label: 'Dashboard', href: '/caller/dashboard', icon: 'LayoutDashboard' },
    { label: 'My Leads', href: '/caller/my-leads', icon: 'UserPlus' },
    { label: 'Assets', href: '/caller/assets', icon: 'FolderOpen' },
    { label: 'Call Log', href: '/caller/call-log', icon: 'Phone' },
    { label: 'Follow-ups', href: '/caller/follow-ups', icon: 'Clock' },
    { label: 'Tasks', href: '/caller/tasks', icon: 'CheckSquare' },
  ],
  field_exec: [
    { label: 'Dashboard', href: '/field/dashboard', icon: 'LayoutDashboard' },
    { label: 'Attendance', href: '/field/attendance', icon: 'MapPin' },
    { label: 'Site Visits', href: '/field/site-visits', icon: 'ClipboardList' },
  ],
  social_manager: [
    { label: 'Calendar', href: '/social/calendar', icon: 'Calendar' },
    { label: 'Posts', href: '/social/posts', icon: 'FileText' },
    { label: 'Create', href: '/social/create', icon: 'PlusCircle' },
  ],
}
