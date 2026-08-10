// ─── Roles ───────────────────────────────────────────────────────────────────
export type UserRole = 'owner' | 'admin' | 'manager' | 'member'

// ─── Permissions ─────────────────────────────────────────────────────────────
export type Permission =
  | 'dashboard.view'
  | 'analytics.view'
  | 'users.view'
  | 'users.create'
  | 'users.edit'
  | 'users.delete'
  | 'projects.view'
  | 'projects.create'
  | 'projects.edit'
  | 'projects.delete'
  | 'tasks.view'
  | 'tasks.create'
  | 'tasks.edit'
  | 'tasks.delete'
  | 'organization.manage'

// ─── User ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatar: string                  // initials, e.g. "SC"
  organizationIds: string[]       // orgs this user belongs to
  activeOrganizationId: string    // currently active org
  organizationRoles: Record<string, UserRole> // orgId -> role mapping
}

// ─── Organization ─────────────────────────────────────────────────────────────
export interface Organization {
  initials?: string
  color?: string
  id: string
  name: string
  slug: string
  logo?: string                   // optional initial/emoji for the avatar
}

// ─── Session ──────────────────────────────────────────────────────────────────
export interface AuthSession {
  userId: string
  activeOrganizationId: string    // top-level for fast access without nested lookup
  user: AuthUser
  token: string
  createdAt: string
  rememberMe: boolean
}

// ─── Auth flow ───────────────────────────────────────────────────────────────
export interface LoginCredentials {
  email: string
  password: string
  rememberMe: boolean
}

export interface AuthenticationResponse {
  user: AuthUser
  session: AuthSession
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthenticationError'
  }
}