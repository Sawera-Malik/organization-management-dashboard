import { getRolePermissions } from './roles'
import type { Permission, UserRole } from '../types/auth'

export function checkPermission(role: UserRole, permission: Permission): boolean {
  return getRolePermissions(role).includes(permission)
}

export function checkAllPermissions(
  role: UserRole,
  permissions: Permission[],
): boolean {
  const rolePerms = getRolePermissions(role)
  return permissions.every((p) => rolePerms.includes(p))
}

export function checkAnyPermission(
  role: UserRole,
  permissions: Permission[],
): boolean {
  const rolePerms = getRolePermissions(role)
  return permissions.some((p) => rolePerms.includes(p))
}
