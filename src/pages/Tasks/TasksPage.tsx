import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { usePermissions } from '../../hooks/usePermissions'
import { useOrganization } from '../../hooks/useOrganization'
import { queryTasks, createTask, updateTask, deleteTask, deleteTasksBulk } from '../../services/taskService'
import { getProjects, getUsers, getTasks, saveTasks } from '../../services/dbService'
import type { Task, MockUserRecord } from '../../data/mockUsers'
import Avatar from '../../components/Avatar'

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'] as const
const STATUS_OPTIONS = ['Todo', 'In Progress', 'Review', 'Done'] as const

export function TasksPage() {
  const { hasPermission } = usePermissions()
  const { activeOrganization } = useOrganization()
  const orgId = activeOrganization?.id || 'org-1'

  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || 'All'
  const priority = searchParams.get('priority') || 'All'
  const sortField = searchParams.get('sortField') || 'id'
  const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc'

  const [tasks, setTasks] = useState<Task[]>([])
  const [totalTasks, setTotalTasks] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const [projectsList, setProjectsList] = useState<Array<{ id: string; name: string }>>([])
  const [usersList, setUsersList] = useState<MockUserRecord[]>([])

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const [title, setTitle] = useState('')
  const [projectName, setProjectName] = useState('')
  const [taskStatus, setTaskStatus] = useState<'Todo' | 'In Progress' | 'Review' | 'Done'>('Todo')
  const [taskPriority, setTaskPriority] = useState<typeof PRIORITY_OPTIONS[number]>('Medium')
  const [assigneeId, setAssigneeId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const [deletedTasksBackup, setDeletedTasksBackup] = useState<Task[] | null>(null)
  const [showUndoToast, setShowUndoToast] = useState(false)
  const [undoTimeoutId, setUndoTimeoutId] = useState<any>(null)

  const [simulateError, setSimulateError] = useState(false)

  useEffect(() => {
    setProjectsList(getProjects().filter((p) => p.organizationId === orgId))
    setUsersList(getUsers().filter((u) => u.organizationIds.includes(orgId)))
  }, [orgId])

  const updateQueryParam = useCallback((newParams: Record<string, string | number>) => {
    const updated = new URLSearchParams(searchParams)
    Object.entries(newParams).forEach(([key, val]) => {
      if (val === 'All' || val === '' || val === undefined) {
        updated.delete(key)
      } else {
        updated.set(key, String(val))
      }
    })
    setSearchParams(updated)
  }, [searchParams, setSearchParams])

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await queryTasks({
        organizationId: orgId,
        page,
        pageSize,
        search,
        status,
        priority,
        sortField,
        sortOrder,
        shouldFail: simulateError,
      })
      setTasks(result.data)
      setTotalTasks(result.total)
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks list.')
    } finally {
      setIsLoading(false)
    }
  }, [orgId, page, pageSize, search, status, priority, sortField, sortOrder, simulateError])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleFilterChange = (field: string, value: string) => {
    updateQueryParam({ [field]: value, page: 1 })
  }

  const handleSort = (field: string) => {
    const order = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc'
    updateQueryParam({ sortField: field, sortOrder: order, page: 1 })
  }

  const handleDeleteTask = async (task: Task) => {
    setDeletedTasksBackup([task])
    
    setTasks((prev) => prev.filter((t) => t.id !== task.id))
    setTotalTasks((prev) => prev - 1)
    triggerUndoToast()

    try {
      await deleteTask(task.id)
    } catch (err) {
      fetchTasks()
      setError('Deletion failed. Rolled back state.')
    }
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds)
    if (ids.length === 0) return

    const backup = tasks.filter((t) => ids.includes(t.id))
    setDeletedTasksBackup(backup)

    setTasks((prev) => prev.filter((t) => !ids.includes(t.id)))
    setTotalTasks((prev) => prev - ids.length)
    setSelectedIds(new Set())
    triggerUndoToast()

    try {
      await deleteTasksBulk(ids)
    } catch (err) {
      fetchTasks()
      setError('Bulk deletion failed. Rolled back state.')
    }
  }

  const triggerUndoToast = () => {
    if (undoTimeoutId) clearTimeout(undoTimeoutId)
    setShowUndoToast(true)
    
    const timeout = setTimeout(() => {
      setShowUndoToast(false)
      setDeletedTasksBackup(null)
    }, 6000)
    
    setUndoTimeoutId(timeout)
  }

  const handleUndo = () => {
    if (!deletedTasksBackup) return
    const allDbTasks = getTasks()
    saveTasks([...deletedTasksBackup, ...allDbTasks])
    
    setShowUndoToast(false)
    setDeletedTasksBackup(null)
    if (undoTimeoutId) clearTimeout(undoTimeoutId)
    fetchTasks()
  }

  const openForm = (task: Task | null = null) => {
    setValidationError(null)
    if (task) {
      setEditingTask(task)
      setTitle(task.title)
      setProjectName(task.project)
      setTaskStatus(task.status)
      setTaskPriority(task.priority)
      setAssigneeId(task.assignee?.id || '')
      setDueDate(task.due || '')
    } else {
      setEditingTask(null)
      setTitle('')
      setProjectName(projectsList[0]?.name || '')
      setTaskStatus('Todo')
      setTaskPriority('Medium')
      setAssigneeId(usersList[0]?.id || '')
      setDueDate(new Date().toISOString().split('T')[0])
    }
    setShowFormModal(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!title.trim()) {
      setValidationError('Task title is required.')
      return
    }

    const assignedUser = usersList.find((u) => u.id === assigneeId) || usersList[0]

    try {
      if (editingTask) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === editingTask.id
              ? { ...t, title, project: projectName, status: taskStatus, priority: taskPriority, assignee: assignedUser, due: dueDate }
              : t
          )
        )
        await updateTask(editingTask.id, {
          title,
          project: projectName,
          status: taskStatus,
          priority: taskPriority,
          assignee: assignedUser,
          due: dueDate,
        })
      } else {
        await createTask({
          title,
          project: projectName,
          organizationId: orgId,
          status: taskStatus,
          priority: taskPriority,
          assignee: assignedUser,
          due: dueDate,
          assigneeId: ''
        })
      }
      setShowFormModal(false)
      fetchTasks()
    } catch (err: any) {
      setValidationError(err.message || 'Action failed.')
    }
  }

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === tasks.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(tasks.map((t) => t.id)))
    }
  }

  const totalPages = Math.ceil(totalTasks / pageSize)

  return (
    <DashboardLayout pageTitle="Tasks">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6 relative">
        
        {showUndoToast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center justify-between gap-4 rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl animate-bounce">
            <span className="text-sm font-semibold text-slate-200">
              {deletedTasksBackup && deletedTasksBackup.length > 1
                ? `${deletedTasksBackup.length} tasks deleted.`
                : 'Task deleted successfully.'}
            </span>
            <button
              onClick={handleUndo}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-500 transition"
            >
              Undo Deletion
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Tasks Directory</h1>
            <p className="mt-1 text-sm text-slate-400">
              Querying <span className="text-indigo-400 font-bold">{totalTasks}</span> tasks records dynamically
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400 select-none hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={simulateError}
                onChange={(e) => setSimulateError(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
              />
              Simulate Failure
            </label>

            {hasPermission('tasks.create') && (
              <button
                onClick={() => openForm(null)}
                id="new-task-btn"
                type="button"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-500"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Create Task
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-slate-900/30 p-3 rounded-2xl border border-slate-800/40">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search title/project..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-700 bg-slate-850 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-200 placeholder-slate-500"
            />
          </div>

          <div className="space-y-1">
            <select
              value={status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-850 px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-850 px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="All">All Priorities</option>
              {PRIORITY_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          {selectedIds.size > 0 && (
            <div className="ml-auto flex items-center gap-3 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl">
              <span className="text-xs font-bold text-red-400">{selectedIds.size} selected</span>
              <button
                onClick={handleBulkDelete}
                className="text-xs font-bold text-red-500 hover:text-red-400 underline transition"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center border border-red-500/20 rounded-2xl bg-red-500/5">
            <svg className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-bold text-white">Query Failed</h3>
            <p className="text-sm text-slate-400 max-w-sm mt-1">{error}</p>
            <button
              onClick={() => {
                setSimulateError(false)
                fetchTasks()
              }}
              className="mt-4 rounded-xl bg-red-600 hover:bg-red-500 px-4 py-2 text-sm font-semibold text-white transition shadow-lg shadow-red-600/15"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl">
            {isLoading ? (
              <div className="p-8 space-y-4 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4 items-center">
                    <div className="h-4 w-4 bg-slate-850 rounded" />
                    <div className="h-4 w-1/3 bg-slate-850 rounded" />
                    <div className="h-4 w-1/4 bg-slate-850 rounded" />
                    <div className="h-4 w-12 bg-slate-850 rounded" />
                  </div>
                ))}
              </div>
            ) : tasks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-500 text-xs font-semibold uppercase tracking-wider select-none">
                      <th className="w-12 px-5 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedIds.size === tasks.length && tasks.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-slate-700 bg-slate-850 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-5 py-3.5 cursor-pointer hover:text-slate-300 transition" onClick={() => handleSort('title')}>
                        Task Title {sortField === 'title' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-5 py-3.5 cursor-pointer hover:text-slate-300 transition" onClick={() => handleSort('project')}>
                        Project {sortField === 'project' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-5 py-3.5 cursor-pointer hover:text-slate-300 transition" onClick={() => handleSort('priority')}>
                        Priority {sortField === 'priority' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-5 py-3.5 cursor-pointer hover:text-slate-300 transition" onClick={() => handleSort('status')}>
                        Status {sortField === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-5 py-3.5 cursor-pointer hover:text-slate-300 transition" onClick={() => handleSort('assignee')}>
                        Assignee {sortField === 'assignee' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-5 py-3.5 cursor-pointer hover:text-slate-300 transition" onClick={() => handleSort('due')}>
                        Due Date {sortField === 'due' && (sortOrder === 'asc' ? '▲' : '▼')}
                      </th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {tasks.map((t) => {
                      const isSelected = selectedIds.has(t.id)
                      return (
                        <tr
                          key={t.id}
                          className={`hover:bg-slate-850/20 transition-colors ${
                            isSelected ? 'bg-indigo-600/5' : ''
                          }`}
                        >
                          <td className="px-5 py-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectRow(t.id)}
                              className="rounded border-slate-700 bg-slate-850 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-5 py-4 font-semibold text-white">{t.title}</td>
                          <td className="px-5 py-4 text-slate-400 font-medium">{t.project}</td>
                          <td className="px-5 py-4">
                            <span className={
                              t.priority === 'Critical' ? 'text-red-400' :
                              t.priority === 'High' ? 'text-orange-400' :
                              t.priority === 'Medium' ? 'text-amber-400' : 'text-slate-500'
                            }>
                              {t.priority}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                              t.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              t.status === 'In Progress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                              'bg-slate-800 border-slate-700 text-slate-400'
                            }`}>
                              {t.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Avatar name={t.assignee?.name || 'User'} initials={t.assignee?.avatar || 'U'} size="xs" color="" />
                              <span className="text-slate-300 font-medium">{t.assignee?.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-400 font-mono font-medium">{t.due || 'No date'}</td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              {hasPermission('tasks.edit') && (
                                <button
                                  onClick={() => openForm(t)}
                                  className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition"
                                >
                                  Edit
                                </button>
                              )}
                              {hasPermission('tasks.delete') && (
                                <button
                                  onClick={() => handleDeleteTask(t)}
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
              <div className="p-12 text-center text-slate-500">
                No matching tasks found.
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 bg-slate-900/40">
                <div className="flex items-center gap-4">
                  <p className="text-xs text-slate-400">
                    Showing <span className="font-bold text-slate-300">{(page - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-bold text-slate-300">{Math.min(page * pageSize, totalTasks)}</span> of{' '}
                    <span className="font-bold text-slate-300">{totalTasks}</span> tasks
                  </p>
                  <select
                    value={pageSize}
                    onChange={(e) => updateQueryParam({ pageSize: parseInt(e.target.value, 10), page: 1 })}
                    className="rounded border border-slate-750 bg-slate-850 px-2 py-1 text-xs text-slate-300 focus:outline-none"
                  >
                    {[10, 25, 50, 100].map((sz) => (
                      <option key={sz} value={sz}>
                        {sz} per page
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={page === 1}
                    onClick={() => updateQueryParam({ page: page - 1 })}
                    className="rounded-lg border border-slate-800 bg-slate-850 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => updateQueryParam({ page: page + 1 })}
                    className="rounded-lg border border-slate-800 bg-slate-850 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white transition disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">
              {editingTask ? 'Edit Task' : 'Create Task'}
            </h3>

            {validationError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs font-semibold text-red-400">
                {validationError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="task-title">
                  Task Title
                </label>
                <input
                  id="task-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Optimize SQL indexing schemas"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="task-project">
                    Project
                  </label>
                  <select
                    id="task-project"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white"
                  >
                    {projectsList.map((p) => (
                      <option key={p.id} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="task-assignee">
                    Assignee
                  </label>
                  <select
                    id="task-assignee"
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white"
                  >
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="task-status-val">
                    Status
                  </label>
                  <select
                    id="task-status-val"
                    value={taskStatus}
                    onChange={(e) => setTaskStatus(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="task-priority-val">
                    Priority
                  </label>
                  <select
                    id="task-priority-val"
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white"
                  >
                    {PRIORITY_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="task-due-date">
                  Due Date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
