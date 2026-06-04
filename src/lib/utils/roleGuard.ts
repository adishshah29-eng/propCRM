import { Role, ROUTE_MAP } from '@/constants/roles'

export function getDashboardPath(role: Role | null): string {
  if (!role) return '/login'
  return ROUTE_MAP[role]
}

export function canAccessRoute(role: Role | null, path: string): boolean {
  if (!role) return false

  const rolePrefixes: Record<Role, string[]> = {
    super_admin: ['/super-admin'],
    admin: ['/admin'],
    manager: ['/manager'],
    caller: ['/caller'],
    field_exec: ['/field'],
    social_manager: ['/social'],
  }

  const allowed = rolePrefixes[role] || []
  return allowed.some((prefix) => path.startsWith(prefix))
}
