import { useState, useRef, useEffect } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import { usePermissions } from '../../hooks/usePermissions'

export function OrgSwitcher({ collapsed = false }: { collapsed?: boolean }) {
  const { activeOrganization, organizations, switchOrganization, isSwitching, createOrganization } = useOrganization()
  const { role } = usePermissions()
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgSlug, setNewOrgSlug] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setNewOrgName(val)
    setNewOrgSlug(val.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''))
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!activeOrganization) return null

  const handleSwitch = async (orgId: string) => {
    if (orgId === activeOrganization.id) {
      setIsOpen(false)
      return
    }
    try {
      await switchOrganization(orgId)
    } finally {
      setIsOpen(false)
    }
  }

  const handleCreateOrgSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    setIsCreating(true)

    try {
      await createOrganization(newOrgName, newOrgSlug)
      setShowCreateModal(false)
      setNewOrgName('')
      setNewOrgSlug('')
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create organization.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          id="org-switcher-btn"
          type="button"
          disabled={isSwitching}
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 w-full rounded-lg py-2 text-left bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 hover:border-slate-600 transition-all text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/55 ${collapsed ? 'justify-center px-0' : 'px-3'}`}
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white text-sm shadow-md shadow-indigo-600/10">
            {isSwitching ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              activeOrganization.name.charAt(0)
            )}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{activeOrganization.name}</p>
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Workspace</p>
              </div>
              <svg
                className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 z-50 mt-2 origin-top-right rounded-xl border border-slate-800 bg-slate-900 p-1.5 shadow-2xl ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-1 duration-100">
            <div className="px-2 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              Switch Organization
            </div>
            <div className="space-y-0.5" role="menu">
              {organizations.map((org) => {
                const isActive = org.id === activeOrganization.id
                return (
                  <button
                    key={org.id}
                    id={`switch-org-${org.id}`}
                    onClick={() => handleSwitch(org.id)}
                    disabled={isSwitching}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive
                        ? 'bg-indigo-600/15 text-indigo-400'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    role="menuitem"
                  >
                    <span className="truncate">{org.name}</span>
                    {isActive && (
                      <svg className="h-4 w-4 flex-shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                )
              })}

              {role === 'owner' && (
                <div className="border-t border-slate-800 mt-1.5 pt-1.5">
                  <button
                    id="trigger-create-org-btn"
                    onClick={() => {
                      setShowCreateModal(true)
                      setIsOpen(false)
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-600/10 hover:text-indigo-300 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Organization</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Create Organization</h3>
            <p className="text-sm text-slate-400 mb-4">Set up a new isolated multi-tenant workspace.</p>

            {createError && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs font-medium text-red-400">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateOrgSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="new-org-name">
                  Organization Name
                </label>
                <input
                  id="new-org-name"
                  type="text"
                  required
                  value={newOrgName}
                  onChange={handleNameChange}
                  placeholder="e.g. Acme Corporation"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="new-org-slug">
                  Organization Slug
                </label>
                <input
                  id="new-org-slug"
                  type="text"
                  required
                  value={newOrgSlug}
                  onChange={(e) => setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '-'))}
                  placeholder="e.g. acme-corp"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isCreating}
                  className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-700/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Organization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
