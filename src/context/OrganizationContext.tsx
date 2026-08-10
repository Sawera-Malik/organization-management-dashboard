import {
  createContext,
  useState,
  useMemo,
  type ReactNode,
  useCallback,
  useEffect,
} from 'react'
import { useAuth } from '../hooks/useAuth'
import { getOrganizations, saveOrganizations, getUsers, saveUsers } from '../services/dbService'
import type { Organization, UserRole } from '../types/auth'

interface OrganizationContextValue {
  activeOrganization: Organization | null
  organizations: Organization[]
  switchOrganization: (orgId: string) => Promise<void>
  isSwitching: boolean
  error: string | null
  createOrganization: (name: string, slug: string) => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined)

interface OrganizationProviderProps {
  children: ReactNode
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const { session, updateActiveOrg, addNewOrgToSession } = useAuth()
  const [allOrgs, setAllOrgs] = useState<Organization[]>([])
  const [isSwitching, setIsSwitching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setAllOrgs(getOrganizations())
  }, [session])

  const userOrganizations = useMemo(() => {
    if (!session?.user) return []
    const orgIds = session.user.organizationIds
    return allOrgs.filter((org) => orgIds.includes(org.id))
  }, [session?.user, allOrgs])

  const activeOrganization = useMemo(() => {
    if (!session?.activeOrganizationId) return null
    return allOrgs.find((org) => org.id === session.activeOrganizationId) ?? null
  }, [session?.activeOrganizationId, allOrgs])

  const switchOrganization = useCallback(async (orgId: string) => {
    if (!session?.user) return
    
    if (session.activeOrganizationId === orgId) return
    if (isSwitching) return

    if (!session.user.organizationIds.includes(orgId)) {
      setError('Access denied: You do not have permission to access this organization.')
      return
    }

    setIsSwitching(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 400))
      
      updateActiveOrg(orgId)
    } catch (err) {
      setError('Failed to switch organization. Please try again.')
    } finally {
      setIsSwitching(false)
    }
  }, [session, isSwitching, updateActiveOrg])

  const createOrganization = useCallback(async (name: string, slug: string) => {
    if (!session?.user) return
    
    if (session.user.role !== 'owner') {
      throw new Error('Access Denied: Only Owner can create organizations.')
    }

    if (!name.trim()) {
      throw new Error('Organization name is required.')
    }
    if (!slug.trim()) {
      throw new Error('Organization slug is required.')
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-')
    const orgId = `org-${Date.now()}`

    const newOrg: Organization = {
      id: orgId,
      name: name.trim(),
      slug: cleanSlug,
      initials: name.trim().substring(0, 2).toUpperCase(),
      color: '#6366f1',
    }

    const updatedOrgs = [...getOrganizations(), newOrg]
    saveOrganizations(updatedOrgs)
    setAllOrgs(updatedOrgs)

    const dbUsers = getUsers()
    const updatedUsers = dbUsers.map((u) => {
      if (u.id === session.user.id) {
        return {
          ...u,
          organizationIds: [...u.organizationIds, orgId],
          organizationRoles: {
            ...u.organizationRoles,
            [orgId]: 'owner' as UserRole,
          },
        }
      }
      return u
    })
    saveUsers(updatedUsers)

    addNewOrgToSession(orgId, 'owner')

  }, [session, addNewOrgToSession])

  const value = useMemo<OrganizationContextValue>(
    () => ({
      activeOrganization,
      organizations: userOrganizations,
      switchOrganization,
      isSwitching,
      error,
      createOrganization,
    }),
    [activeOrganization, userOrganizations, switchOrganization, isSwitching, error, createOrganization]
  )

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  )
}

export { OrganizationContext }
