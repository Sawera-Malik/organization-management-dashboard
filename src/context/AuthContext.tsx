import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { clearStoredSession, getStoredSession, setStoredSession } from '../lib/storage'
import { loginWithCredentials } from '../services/authService'
import type { AuthSession, LoginCredentials, UserRole } from '../types/auth'

interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  isSessionHydrated: boolean
  signIn: (credentials: LoginCredentials) => Promise<void>
  signOut: () => void
  updateActiveOrg: (orgId: string) => void
  addNewOrgToSession: (orgId: string, role: UserRole) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isSessionHydrated, setIsSessionHydrated] = useState(false)

  useEffect(() => {
    setSession(getStoredSession())
    setIsSessionHydrated(true)
  }, [])

  const signIn = useCallback(async (credentials: LoginCredentials) => {
    const response = await loginWithCredentials(credentials)
    setStoredSession(response.session)
    setSession(response.session)
  }, [])

  const signOut = useCallback(() => {
    clearStoredSession()
    setSession(null)
  }, [])

  const updateActiveOrg = useCallback((orgId: string) => {
    setSession((currentSession) => {
      if (!currentSession) return null

      const user = currentSession.user
      if (!user.organizationIds.includes(orgId)) {
        console.error(`User does not belong to organization ${orgId}`)
        return currentSession
      }

      const nextRole: UserRole = user.organizationRoles[orgId] || 'member'

      const updatedUser = {
        ...user,
        activeOrganizationId: orgId,
        role: nextRole,
      }

      const updatedSession: AuthSession = {
        ...currentSession,
        activeOrganizationId: orgId,
        user: updatedUser,
      }

      setStoredSession(updatedSession)
      return updatedSession
    })
  }, [])

  const addNewOrgToSession = useCallback((orgId: string, role: UserRole) => {
    setSession((currentSession) => {
      if (!currentSession) return null

      const user = currentSession.user
      const updatedUser = {
        ...user,
        organizationIds: [...user.organizationIds, orgId],
        organizationRoles: {
          ...user.organizationRoles,
          [orgId]: role,
        },
        activeOrganizationId: orgId,
        role,
      }

      const updatedSession: AuthSession = {
        ...currentSession,
        activeOrganizationId: orgId,
        user: updatedUser,
      }

      setStoredSession(updatedSession)
      return updatedSession
    })
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      isSessionHydrated,
      signIn,
      signOut,
      updateActiveOrg,
      addNewOrgToSession,
    }),
    [isSessionHydrated, session, signIn, signOut, updateActiveOrg, addNewOrgToSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }