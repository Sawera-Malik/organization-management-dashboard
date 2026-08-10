import { useCallback } from 'react'
import { useAuth } from './useAuth'
import { checkPermission } from '../auth/authorization'
import type { Permission, UserRole } from '../types/auth'

export interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean
  can: (action: string, resource: string) => boolean
  role: UserRole | undefined
  isAuthenticated: boolean
}

export function usePermissions(): UsePermissionsReturn {
  const { session, isAuthenticated } = useAuth()

  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      if (!session?.user?.role) return false
      return checkPermission(session.user.role, permission)
    },
    [session],
  )

  const can = useCallback(
    (action: string, resource: string): boolean => {
      return hasPermission(`${resource}.${action}` as Permission)
    },
    [hasPermission],
  )

  return {
    hasPermission,
    can,
    role: session?.user?.role,
    isAuthenticated,
  }
}
