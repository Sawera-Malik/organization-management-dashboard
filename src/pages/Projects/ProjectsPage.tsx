import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { usePermissions } from '../../hooks/usePermissions'
import { useOrganization } from '../../hooks/useOrganization'
import { useAuth } from '../../hooks/useAuth'
import { getProjects, saveProjects, getUsers } from '../../services/dbService'
import type { Project, MockUserRecord } from '../../data/mockUsers'
import Avatar from '../../components/Avatar'
import Badge from '../../components/Badge'
import { TaskFormModal } from '../../components/ui/models/TaskFormModal'
import { DeleteConfirmModal } from '../../components/ui/models/DeleteConfirmModal'

const STATUS_OPTIONS = ['Backlog', 'In Progress', 'Review', 'Completed'] as const
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'] as const

export default function ProjectsPage() {
  const { hasPermission } = usePermissions()
  const { activeOrganization } = useOrganization()
  const { session } = useAuth()
  const navigate = useNavigate()

  const user = session?.user
  const orgId = activeOrganization?.id || 'org-1'

  const [projects, setProjects] = useState<Project[]>([])
  const [teamUsers, setTeamUsers] = useState<MockUserRecord[]>([])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)

  useEffect(() => {
    setProjects(getProjects())
    setTeamUsers(getUsers().filter((u) => u.organizationIds.includes(orgId)))
  }, [orgId, showFormModal, projectToDelete])

  const filteredProjects = projects.filter((p) => {
    if (p.organizationId !== orgId) return false

    if (user?.role === 'manager') {
      const isOwner = p.owner?.id === user.id
      const isMember = p.members?.some((m) => m.id === user.id)
      if (!isOwner && !isMember) return false
    } else if (user?.role === 'member') {
      const isMember = p.members?.some((m) => m.id === user.id)
      if (!isMember) return false
    }

    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || p.status === statusFilter

    return matchSearch && matchStatus
  })

  const openCreateModal = () => {
    setEditingProject(null)
    setShowFormModal(true)
  }

  const openEditModal = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingProject(p)
    setShowFormModal(true)
  }

  type ProjectFormData = {
    name: string
    status: typeof STATUS_OPTIONS[number]
    priority: typeof PRIORITY_OPTIONS[number]
    ownerId: string
    deadline: string
    selectedMemberIds: string[]
  }

  const handleFormSubmit = (data: ProjectFormData) => {
    const allUsers = getUsers()
    const allDbProjects = getProjects()

    const foundOwner =
      allUsers.find((u) => u.id === data.ownerId) || teamUsers[0]

    const foundMembers = allUsers.filter((u) =>
      data.selectedMemberIds.includes(u.id)
    )

    if (editingProject) {
      const updated = allDbProjects.map((p) =>
        p.id === editingProject.id
          ? {
            ...p,
            name: data.name,
            status: data.status,
            priority: data.priority,
            owner: foundOwner,
            members: foundMembers,
            deadline: data.deadline,
            updated: 'Just now',
          }
          : p
      )

      saveProjects(updated)
    } else {
      const newProject: Project = {
        id: `p-${Date.now()}`,
        name: data.name,
        organizationId: orgId,
        status: data.status,
        priority: data.priority,
        owner: foundOwner,
        members: foundMembers,
        progress: 0,
        deadline: data.deadline,
        updated: 'Just now',
        tasks: 0,
        completedTasks: 0,
        ownerId: ''
      }

      saveProjects([...allDbProjects, newProject])
    }

    setShowFormModal(false)
    setEditingProject(null)
    setProjects(getProjects())
  }
  const handleDeleteClick = (p: Project, e: React.MouseEvent) => {
    e.stopPropagation()
    setProjectToDelete(p)
  }

  const confirmDelete = () => {
    if (!projectToDelete) return
    const allDbProjects = getProjects()
    const updated = allDbProjects.filter((p) => p.id !== projectToDelete.id)
    saveProjects(updated)
    setProjectToDelete(null)
    setProjects(getProjects())
  }

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProjects.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredProjects.map((p) => p.id)))
    }
  }

  const handleCloseFormModal = () => {
    setShowFormModal(false)
    setEditingProject(null)
  }

  return (
    <DashboardLayout pageTitle="Projects">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Projects</h1>
            <p className="mt-1 text-sm text-slate-400">
              {hasPermission('projects.create') ? 'Manage organization projects' : 'View assigned projects'}
            </p>
          </div>
          {hasPermission('projects.create') && (
            <button
              onClick={openCreateModal}
              id="new-project-btn"
              type="button"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Create Project
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-800 text-slate-200 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-800/40 border border-slate-700/50 rounded-xl p-1">
            {['All', ...STATUS_OPTIONS].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === s
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl">
          {filteredProjects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 select-none text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    <th className="w-12 px-5 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredProjects.length && filteredProjects.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="px-5 py-3">Project</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Owner</th>
                    <th className="px-5 py-3">Team</th>
                    <th className="px-5 py-3">Deadline</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProjects.map((p) => {
                    const isSelected = selectedIds.has(p.id)
                    return (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/projects/${p.id}`)}
                        className={`hover:bg-slate-800/35 transition-colors cursor-pointer select-none ${isSelected ? 'bg-indigo-600/5' : ''
                          }`}
                      >
                        <td className="px-5 py-4" onClick={(e) => toggleSelect(p.id, e)}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => { }}
                            className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-5 py-4 font-semibold text-white">{p.name}</td>
                        <td className="px-5 py-4">
                          <Badge label={p.status} variant="status" />
                        </td>
                        <td className="px-5 py-4">
                          <Badge label={p.priority} variant="priority" />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar name={p.owner?.name || 'User'} initials={p.owner?.avatar || 'U'} size="xs" color="" />
                            <span className="text-slate-300 font-medium">{p.owner?.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            {p.members?.slice(0, 3).map((m) => (
                              <Avatar key={m.id} name={m.name} initials={m.avatar} size="xs" color="" />
                            ))}
                            {p.members && p.members.length > 3 && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-400 border border-slate-900">
                                +{p.members.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-400 font-medium font-mono">{p.deadline}</td>
                        <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2">
                            {hasPermission('projects.edit') && (
                              <button
                                onClick={(e) => openEditModal(p, e)}
                                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                              >
                                Edit
                              </button>
                            )}
                            {hasPermission('projects.delete') && (
                              <button
                                onClick={(e) => handleDeleteClick(p, e)}
                                className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <svg className="h-10 w-10 text-slate-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-4a2 2 0 00-2 2v1a2 2 0 01-2 2H8a2 2 0 01-2-2v-1a2 2 0 00-2-2H2" />
              </svg>
              <p className="text-sm font-semibold text-slate-400">No projects found</p>
              <p className="text-xs text-slate-600 mt-0.5">Create a project or try matching search keywords.</p>
            </div>
          )}
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <TaskFormModal
            editingProject={editingProject}
            teamUsers={teamUsers}
            onClose={handleCloseFormModal}
            onSubmit={handleFormSubmit} />
        </div>
      )}

      {projectToDelete && (
        <DeleteConfirmModal
          projectName={projectToDelete.name}
          onCancel={() => setProjectToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </DashboardLayout>
  )
}
