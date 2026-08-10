import type { Permission, UserRole } from '../types/auth'

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    'dashboard.view',
    'analytics.view',
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.delete',
    'tasks.view',
    'tasks.create',
    'tasks.edit',
    'tasks.delete',
    'organization.manage',
  ],

  admin: [
    'dashboard.view',
    'analytics.view',
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'projects.view',
    'projects.create',
    'projects.edit',
    'projects.delete',
    'tasks.view',
    'tasks.create',
    'tasks.edit',
    'tasks.delete',
  ],

  manager: [
    'dashboard.view',
    'analytics.view',
    'projects.view',
    'projects.edit',       
    'tasks.view',
    'tasks.create',
    'tasks.edit',
  ],

  member: [
    'dashboard.view',
    'projects.view',       
    'tasks.view',
    'tasks.edit',           
  ],
}
