import { useEffect, useState } from 'react'
import type { Project, MockUserRecord } from '../../../data/mockUsers'
import Avatar from '../../Avatar'

const STATUS_OPTIONS = ['Backlog', 'In Progress', 'Review', 'Completed'] as const
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'] as const

type FormData = {
  name: string
  status: typeof STATUS_OPTIONS[number]
  priority: typeof PRIORITY_OPTIONS[number]
  ownerId: string
  deadline: string
  selectedMemberIds: string[]
}

type TaskFormModalProps = {
  editingProject: Project | null
  teamUsers: MockUserRecord[]
  onClose: () => void
  onSubmit: (data: FormData) => void
}

export function TaskFormModal({
    editingProject,
    teamUsers,
    onClose,
    onSubmit,
}: TaskFormModalProps) {
    const [name, setName] = useState('')
    const [status, setStatus] =
        useState<typeof STATUS_OPTIONS[number]>('Backlog')
    const [priority, setPriority] =
        useState<typeof PRIORITY_OPTIONS[number]>('Medium')
    const [ownerId, setOwnerId] = useState('')
    const [deadline, setDeadline] = useState('')
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
    const [validationError, setValidationError] = useState<string | null>(null)

    useEffect(() => {
        if (editingProject) {
            setName(editingProject.name)
            setStatus(editingProject.status)
            setPriority(editingProject.priority)
            setOwnerId(editingProject.owner?.id || '')
            setDeadline(editingProject.deadline)
            setSelectedMemberIds(
                editingProject.members?.map((member) => member.id) || []
            )
        } else {
            setName('')
            setStatus('Backlog')
            setPriority('Medium')
            setOwnerId(teamUsers[0]?.id || '')
            setDeadline(new Date().toISOString().split('T')[0])
            setSelectedMemberIds([])
        }

        setValidationError(null)
    }, [editingProject, teamUsers])

   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  if (!name.trim()) {
    setValidationError('Project name is required.')
    return
  }

  if (!deadline) {
    setValidationError('Deadline is required.')
    return
  }

  onSubmit({
    name: name.trim(),
    status,
    priority,
    ownerId,
    deadline,
    selectedMemberIds,
  })
}

    const handleMemberCheckbox = (userId: string) => {
        setSelectedMemberIds((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        )
    }

    return (
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-4">
                {editingProject ? 'Edit Project' : 'Create Project'}
            </h3>

            {validationError && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs font-semibold text-red-400">
                    {validationError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* Project Name */}
                <div>
                    <label
                        htmlFor="project-name"
                        className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                    >
                        Project Name
                    </label>

                    <input
                        id="project-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Website Redesign"
                        className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>

                {/* Status + Priority */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="project-status"
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                        >
                            Status
                        </label>

                        <select
                            id="project-status"
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value as typeof status)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white"
                        >
                            {STATUS_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="project-priority"
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                        >
                            Priority
                        </label>

                        <select
                            id="project-priority"
                            value={priority}
                            onChange={(e) =>
                                setPriority(e.target.value as typeof priority)
                            }
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white"
                        >
                            {PRIORITY_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Owner + Deadline */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label
                            htmlFor="project-owner"
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                        >
                            Owner
                        </label>

                        <select
                            id="project-owner"
                            value={ownerId}
                            onChange={(e) => setOwnerId(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white"
                        >
                            {teamUsers.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="project-deadline"
                            className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5"
                        >
                            Deadline
                        </label>

                        <input
                            id="project-deadline"
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm text-white"
                        />
                    </div>
                </div>

                {/* Team Members */}
                <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Project Team Members
                    </label>

                    <div className="max-h-24 overflow-y-auto rounded-xl border border-slate-800 bg-slate-800/30 p-3 space-y-2">
                        {teamUsers.map((user) => (
                            <label
                                key={user.id}
                                className="flex items-center gap-2.5 text-slate-300 text-xs font-medium cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedMemberIds.includes(user.id)}
                                    onChange={() => handleMemberCheckbox(user.id)}
                                    className="rounded border-slate-700 bg-slate-800 text-indigo-600"
                                />

                                <Avatar
                                    name={user.name}
                                    initials={user.avatar}
                                    size="xs"
                                    color=""
                                />

                                <span>{user.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-sm font-semibold text-slate-300"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                        {editingProject ? 'Save Changes' : 'Create Project'}
                    </button>
                </div>
            </form>
        </div>
    )
}