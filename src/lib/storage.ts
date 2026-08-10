import type { AuthSession } from '../types/auth'

const AUTH_SESSION_KEY = 'nexus-analytics-session'

export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawSession = window.localStorage.getItem(AUTH_SESSION_KEY)

  if (!rawSession) {
    return null
  }

  try {
    return JSON.parse(rawSession) as AuthSession
  } catch {
    window.localStorage.removeItem(AUTH_SESSION_KEY)
    return null
  }
}

export function setStoredSession(session: AuthSession): void {
  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session))
}

export function clearStoredSession(): void {
  window.localStorage.removeItem(AUTH_SESSION_KEY)
}