import { ROLE_PERMISSIONS } from './permissions'
import type { Permission, UserRole } from '../types/auth'

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

export const ROLE_LABELS: Record<UserRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  manager: 'Manager',
  member: 'Member',
}

export const ROLE_COLORS: Record<UserRole, { bg: string; text: string; border: string }> = {
  owner:   { bg: 'bg-violet-500/20',  text: 'text-violet-300',  border: 'border-violet-500/30' },
  admin:   { bg: 'bg-blue-500/20',    text: 'text-blue-300',    border: 'border-blue-500/30' },
  manager: { bg: 'bg-amber-500/20',   text: 'text-amber-300',   border: 'border-amber-500/30' },
  member:  { bg: 'bg-slate-500/20',   text: 'text-slate-300',   border: 'border-slate-500/30' },
}
