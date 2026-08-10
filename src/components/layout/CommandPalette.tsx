import { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePermissions } from '../../hooks/usePermissions'
import { useOrganization } from '../../hooks/useOrganization'
import { getProjects, getTasks, getUsers } from '../../services/dbService'
import type { Project, Task, MockUserRecord } from '../../data/mockUsers'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const { hasPermission } = usePermissions()
  const { activeOrganization } = useOrganization()

  const orgId = activeOrganization?.id || 'org-1'

  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<MockUserRecord[]>([])

  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveIndex(0)
      setProjects(getProjects().filter((p) => p.organizationId === orgId))
      setTasks(getTasks().filter((t) => t.organizationId === orgId))
      setUsers(getUsers().filter((u) => u.organizationIds.includes(orgId)))
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen, orgId])

  const commands = [
    { label: 'Go to Dashboard', action: () => navigate('/dashboard'), gate: 'dashboard.view' },
    { label: 'Go to Projects', action: () => navigate('/projects'), gate: 'projects.view' },
    { label: 'Go to Tasks', action: () => navigate('/tasks'), gate: 'tasks.view' },
    { label: 'Go to Kanban Board', action: () => navigate('/kanban'), gate: 'projects.view' },
    { label: 'Go to Organization Settings', action: () => navigate('/organization'), gate: 'organization.manage' },
  ]

  const allowedCommands = commands.filter((cmd) => hasPermission(cmd.gate as any))

  const filteredProjects = query.trim()
    ? projects.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : []

  const filteredTasks = query.trim()
    ? tasks.filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    : []

  const filteredUsers = query.trim()
    ? users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()))
    : []

  const listItems = useMemo(() => {
    if (!query.trim()) {
      return allowedCommands.map((cmd) => ({ type: 'command', label: cmd.label, action: cmd.action }))
    }

    const items: Array<{ type: 'project' | 'task' | 'user'; label: string; action: () => void }> = []
    
    filteredProjects.forEach((p) =>
      items.push({ type: 'project', label: `📁 Project: ${p.name}`, action: () => navigate(`/projects/${p.id}`) })
    )
    
    filteredTasks.forEach((t) =>
      items.push({ type: 'task', label: `✓ Task: ${t.title}`, action: () => navigate('/tasks') })
    )

    filteredUsers.forEach((u) =>
      items.push({ type: 'user', label: `👤 Team: ${u.name} (${u.email})`, action: () => navigate('/users') })
    )

    return items
  }, [query, allowedCommands, filteredProjects, filteredTasks, filteredUsers])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((prev) => (prev + 1) % listItems.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((prev) => (prev - 1 + listItems.length) % listItems.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        if (listItems[activeIndex]) {
          listItems[activeIndex].action()
          onClose()
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, activeIndex, listItems, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3 bg-slate-950/20">
          <svg className="h-5 w-5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            placeholder="Type a command or search team, tasks, projects..."
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0 border-0 outline-none"
          />
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-0.5">
          {listItems.length > 0 ? (
            listItems.map((item, idx) => {
              const active = idx === activeIndex
              return (
                <button
                  key={idx}
                  onClick={() => {
                    item.action()
                    onClose()
                  }}
                  className={`w-full text-left rounded-xl px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                    active ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  {active && <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Enter</span>}
                </button>
              )
            })
          ) : (
            <div className="py-6 text-center text-slate-500 text-xs">
              No matching search results found.
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 px-4 py-2.5 bg-slate-900/60 flex items-center justify-between text-[10px] font-bold text-slate-500">
          <div className="flex gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  )
}
