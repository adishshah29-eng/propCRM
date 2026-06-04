export type Role = 'super_admin' | 'admin' | 'manager' | 'caller' | 'field_exec' | 'social_manager'

export interface Profile {
  id: string
  org_id: string | null
  branch_id: string | null
  full_name: string | null
  email: string | null
  role: Role | null
  phone: string | null
  avatar_url: string | null
  theme: 'dark' | 'light'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  plan: string
  created_at: string
}

export interface Branch {
  id: string
  org_id: string
  name: string
  location: string | null
  admin_id: string | null
  created_at: string
}

export interface Team {
  id: string
  branch_id: string
  manager_id: string | null
  name: string
  created_at: string
}
