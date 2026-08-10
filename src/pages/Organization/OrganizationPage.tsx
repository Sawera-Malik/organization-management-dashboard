import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { usePermissions } from '../../hooks/usePermissions'
import { AccessDenied } from '../../components/auth/AccessDenied'
import { useOrganization } from '../../hooks/useOrganization'

export function OrganizationPage() {
  const { hasPermission } = usePermissions()
  const { activeOrganization } = useOrganization()

  if (!hasPermission('organization.manage')) {
    return (
      <DashboardLayout pageTitle="Organization">
        <AccessDenied message="Organization settings are only accessible to the Owner." />
      </DashboardLayout>
    )
  }

  const org = activeOrganization

  return (
    <DashboardLayout pageTitle="Organization Settings">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Organization Settings</h1>
          <p className="mt-1 text-sm text-slate-400">Manage your organization configuration — Owner only</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-5">
          <h2 className="font-semibold text-white">General</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="org-name">
                Organization Name
              </label>
              <input
                id="org-name"
                type="text"
                key={`${org?.id}-name`}
                defaultValue={org?.name ?? ''}
                className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5" htmlFor="org-slug">
                Slug
              </label>
              <input
                id="org-slug"
                type="text"
                key={`${org?.id}-slug`}
                defaultValue={org?.slug ?? ''}
                className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            id="save-org-btn"
            type="button"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Save Changes
          </button>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h2 className="font-semibold text-white">Security</h2>
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
              <p className="text-xs text-slate-500">Require 2FA for all members</p>
            </div>
            <button
              id="toggle-2fa-btn"
              type="button"
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Enable
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 space-y-4">
          <h2 className="font-semibold text-red-400">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Delete Organization</p>
              <p className="text-xs text-slate-500">Permanently delete this organization and all data</p>
            </div>
            <button
              id="delete-org-btn"
              type="button"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
            >
              Delete Organization
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
