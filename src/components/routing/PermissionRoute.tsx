import type { ReactNode } from 'react'
import { usePermissions } from '../../hooks/usePermissions'
import type { Permission } from '../../types/auth'
import { AccessDenied } from '../auth/AccessDenied'

interface PermissionRouteProps {
  permission: Permission
  children: ReactNode
  deniedMessage?: string
}

export function PermissionRoute({
  permission,
  children,
  deniedMessage,
}: PermissionRouteProps) {
  const { hasPermission } = usePermissions()

  if (!hasPermission(permission)) {
    return <AccessDenied message={deniedMessage} />
  }

  return <>{children}</>
}
