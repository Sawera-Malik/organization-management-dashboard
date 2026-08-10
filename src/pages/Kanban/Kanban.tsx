import { useEffect, useState, useCallback } from 'react'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import Avatar from '../../components/Avatar'
import { useOrganization } from '../../hooks/useOrganization'
import { getTasks } from '../../services/dbService'
import { updateTask } from '../../services/taskService'
import type { Task } from '../../data/mockUsers'

interface Column {
  id: 'Todo' | 'In Progress' | 'Review' | 'Done'
  label: string
  color: string
}

const KANBAN_COLUMNS: Column[] = [
  { id: 'Todo', label: 'To Do', color: '#64748b' },
  { id: 'In Progress', label: 'In Progress', color: '#6366f1' },
  { id: 'Review', label: 'In Review', color: '#f59e0b' },
  { id: 'Done', label: 'Done', color: '#10b981' },
]

export default function Kanban() {
  const { activeOrganization } = useOrganization()
  
  const orgId = activeOrganization?.id || 'org-1'

  const [tasks, setTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('All')
  
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  
  const [saveStatus, setSaveStatus] = useState<Record<string, 'saving' | 'saved' | 'failed' | null>>({})

  const [simulateError, setSimulateError] = useState(false)

  const loadData = useCallback(() => {
    const allTasks = getTasks().filter((t) => t.organizationId === orgId)
    setTasks(allTasks)
  }, [orgId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleDragStart = (taskId: string) => {
    setDraggingTaskId(taskId)
  }

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    setDragOverColumn(colId)
  }

  const handleDrop = async (targetStatus: 'Todo' | 'In Progress' | 'Review' | 'Done') => {
    if (!draggingTaskId) return

    const task = tasks.find((t) => t.id === draggingTaskId)
    if (!task) return

    const oldStatus = task.status
    if (oldStatus === targetStatus) {
      setDraggingTaskId(null)
      setDragOverColumn(null)
      return
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === draggingTaskId ? { ...t, status: targetStatus } : t))
    )
    setSaveStatus((prev) => ({ ...prev, [draggingTaskId]: 'saving' }))

    setDraggingTaskId(null)
    setDragOverColumn(null)

    try {
      if (simulateError) {
        throw new Error('Simulated network mutation conflict.')
      }

      await updateTask(task.id, { status: targetStatus })
      
      setSaveStatus((prev) => ({ ...prev, [task.id]: 'saved' }))
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [task.id]: null }))
      }, 1500)
    } catch (err) {
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: oldStatus } : t))
      )
      setSaveStatus((prev) => ({ ...prev, [task.id]: 'failed' }))
      setTimeout(() => {
        setSaveStatus((prev) => ({ ...prev, [task.id]: null }))
      }, 2000)
    }
  }

  const getFilteredTasks = (colId: string) => {
    return tasks.filter((t) => {
      if (t.status !== colId) return false
      
      const matchesSearch =
        searchQuery === '' ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.project.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesPriority = filterPriority === 'All' || t.priority === filterPriority

      return matchesSearch && matchesPriority
    })
  }

  return (
    <DashboardLayout pageTitle="Kanban Board">
      <div className="h-full space-y-6 px-4 py-2 select-none">
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Kanban Task Board</h1>
            <p className="mt-1 text-sm text-slate-400">
              Drag and drop cards to update status metrics immediately
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400 select-none hover:border-slate-700 transition">
              <input
                type="checkbox"
                checked={simulateError}
                onChange={(e) => setSimulateError(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
              />
              Simulate Drag Failure
            </label>

            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-450" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search board..."
                className="w-48 pl-8 pr-3 py-2 text-xs border border-slate-700 bg-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 text-slate-200"
              />
            </div>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 focus:outline-none"
            >
              <option value="All">All Priorities</option>
              {['Critical', 'High', 'Medium', 'Low'].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = getFilteredTasks(col.id)
            const isOver = dragOverColumn === col.id

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={() => handleDrop(col.id)}
                className={`rounded-2xl border bg-slate-900/60 p-4 space-y-4 min-h-[500px] transition ${
                  isOver
                    ? 'border-indigo-500 bg-indigo-950/20 ring-2 ring-indigo-500/20 shadow-2xl'
                    : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="text-sm font-bold text-white">{col.label}</span>
                    <span className="rounded-full bg-slate-800 border border-slate-700 px-1.5 py-0.5 text-[10px] font-bold text-slate-400">
                      {colTasks.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {colTasks.length > 0 ? (
                    colTasks.map((t) => {
                      const isDragging = draggingTaskId === t.id
                      const state = saveStatus[t.id]

                      return (
                        <div
                          key={t.id}
                          draggable
                          onDragStart={() => handleDragStart(t.id)}
                          className={`relative rounded-xl border border-slate-800 bg-slate-850 p-4 space-y-3 cursor-grab hover:border-slate-755 transition hover:shadow-xl ${
                            isDragging ? 'opacity-30 scale-95 border-indigo-500 shadow-2xl' : ''
                          }`}
                        >
                          <h4 className="text-xs font-semibold text-white leading-relaxed">{t.title}</h4>
                          <div className="flex items-center justify-between text-[10px] font-bold">
                            <span className="text-slate-500 tracking-wide uppercase">{t.project}</span>
                            <span className={
                              t.priority === 'Critical' ? 'text-red-400' :
                              t.priority === 'High' ? 'text-orange-400' :
                              t.priority === 'Medium' ? 'text-amber-400' : 'text-slate-550'
                            }>
                              {t.priority}
                            </span>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-800 pt-2.5">
                            <div className="flex items-center gap-1.5">
                              <Avatar name={t.assignee?.name || 'User'} initials={t.assignee?.avatar || 'U'} size="xs" color="" />
                              <span className="text-[10px] text-slate-400 font-semibold">{t.assignee?.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono font-medium">{t.due || 'No date'}</span>
                          </div>

                          {state && (
                            <div className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              state === 'saving' ? 'bg-slate-800 text-slate-400' :
                              state === 'saved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {state === 'saving' && 'Saving...'}
                              {state === 'saved' && 'Saved'}
                              {state === 'failed' && 'Rolled back'}
                            </div>
                          )}
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center text-slate-600 text-xs border border-dashed border-slate-800 rounded-xl">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
