import {
  AuthenticationError,
  type AuthenticationResponse,
  type LoginCredentials,
} from '../types/auth'
import { findUserByCredentials } from '../data/mockUsers'

function wait(duration: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration)
  })
}

export async function loginWithCredentials(
  credentials: LoginCredentials,
): Promise<AuthenticationResponse> {
  await wait(900)

  const normalizedEmail = credentials.email.trim().toLowerCase()
  const user = findUserByCredentials(normalizedEmail, credentials.password)

  if (!user) {
    throw new AuthenticationError('Invalid email or password.')
  }

  const activeOrgId = user.activeOrganizationId || user.organizationIds[0]
  const activeRole = user.organizationRoles[activeOrgId] || 'member'

  const { password: _password, ...restUser } = user
  const safeUser = {
    ...restUser,
    role: activeRole,
    activeOrganizationId: activeOrgId,
  }

  const session = {
    userId: safeUser.id,
    activeOrganizationId: activeOrgId,
    user: safeUser,
    token: `mock-token-${safeUser.id}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    rememberMe: credentials.rememberMe,
  }

  return { user: safeUser, session }
}