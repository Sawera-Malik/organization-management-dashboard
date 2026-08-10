import { useState, useEffect } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { RoleBadge } from '../../components/ui/RoleBadge'
import { usePermissions } from '../../hooks/usePermissions'
import { useOrganization } from '../../hooks/useOrganization'
import { getUsers, saveUsers } from '../../services/dbService'
import type { UserRole } from '../../types/auth'
import type { MockUserRecord } from '../../data/mockUsers'

export function UsersPage() {
  const { hasPermission } = usePermissions()
  const { activeOrganization } = useOrganization()

  const orgId = activeOrganization?.id || 'org-1'

  const [users, setUsers] = useState<MockUserRecord[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('member')

  useEffect(() => {
    setUsers(getUsers())
  }, [orgId])

  const filteredUsers = users.filter((user) =>
    user.organizationIds.includes(orgId)
  )

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteName || !inviteEmail) return

    const allUsers = getUsers()
    
    const existingUserIndex = allUsers.findIndex(u => u.email === inviteEmail)
    
    if (existingUserIndex >= 0) {
      if (!allUsers[existingUserIndex].organizationIds.includes(orgId)) {
        allUsers[existingUserIndex].organizationIds.push(orgId)
      }
      allUsers[existingUserIndex].organizationRoles[orgId] = inviteRole
    } else {
      const initials = inviteName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      const newUser: MockUserRecord = {
        id: `u-${Date.now()}`,
        name: inviteName,
        email: inviteEmail,
        password: 'password123', 
        avatar: initials,
        color: '#8b5cf6',
        organizationIds: [orgId],
        activeOrganizationId: orgId,
        organizationRoles: { [orgId]: inviteRole },
        role: undefined
      }
      allUsers.push(newUser)
    }

    saveUsers(allUsers)
    setUsers(allUsers)
    
    setShowInviteModal(false)
    setInviteName('')
    setInviteEmail('')
    setInviteRole('member')
  }

  return (
    <DashboardLayout pageTitle="Users & Teams">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Users & Teams</h1>
            <p className="mt-1 text-sm text-slate-400">
              {hasPermission('users.create') ? 'Manage team members and their roles' : 'View team members'}
            </p>
          </div>
          {hasPermission('users.create') && (
            <button
              id="invite-user-btn"
              type="button"
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Invite Member
            </button>
          )}
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Member</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Email</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.map((user) => {
                const orgRole = (user.organizationRoles[orgId] || 'member') as UserRole
                return (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
                          {user.avatar}
                        </div>
                        <span className="font-medium text-white">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-400">{user.email}</td>
                    <td className="px-5 py-4">
                      <RoleBadge role={orgRole} size="sm" />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Invite Team Member</h3>
            <p className="text-sm text-slate-400 mb-6">Add a new member to {activeOrganization?.name}.</p>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="member">Member</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-700/60"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
