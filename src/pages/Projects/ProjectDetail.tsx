import { useMemo, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import Avatar from '../../components/Avatar'
import Badge from '../../components/Badge'
import { getProjects, getTasks } from '../../services/dbService'
import type { Project } from '../../data/mockUsers'
import type { Task } from '../../data/mockUsers'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  useEffect(() => {
    setProjects(getProjects())
    setTasks(getTasks())
  }, [id])

  const project = useMemo(() => projects.find((p) => p.id === id), [projects, id])

  const projectTasks = useMemo(() => {
    if (!project) return []
    return tasks.filter((t) => t.project === project.name && t.organizationId === project.organizationId)
  }, [tasks, project])

  if (!project) {
    return (
      <DashboardLayout pageTitle="Project">
        <div className="text-white text-center py-12">
          <p className="text-lg font-semibold text-slate-400">Project not found.</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Back to Projects
          </button>
        </div>
      </DashboardLayout>
    )
  }

  const completedCount = projectTasks.filter((t) => t.status === 'Done').length
  const totalCount = projectTasks.length
  const calculatedProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : project.progress

  return (
    <DashboardLayout pageTitle={project.name}>
      <div className="max-w-5xl mx-auto space-y-6 px-4 py-2">

        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{project.name}</h2>
            <div className="mt-2.5 flex items-center gap-2">
              <Badge label={project.status} variant="status" />
              <Badge label={project.priority} variant="priority" />
            </div>
          </div>

          <button
            onClick={() => navigate('/projects')}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition"
          >
            ← Back to Projects
          </button>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <Avatar name={project.owner?.name || 'User'} initials={project.owner?.avatar || 'U'} size="md" color="" />
                <div>
                  <div className="text-sm font-semibold text-white">{project.owner?.name}</div>
                  <div className="text-xs text-slate-500">Project Owner</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Team Members</div>
                <div className="flex -space-x-1.5 overflow-hidden">
                  {project.members?.map((m) => (
                    <Avatar key={m.id} name={m.name} initials={m.avatar} size="sm" color="" />
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Target Deadline</div>
                <div className="text-sm text-slate-300 mt-1 font-mono">{project.deadline}</div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completion Progress</div>
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="w-full bg-slate-850 rounded-full h-2">
                    <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${calculatedProgress}%` }} />
                  </div>
                  <div className="text-sm font-bold text-white w-12">{calculatedProgress}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-850 p-4 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-500">Total Tasks</div>
                  <div className="text-2xl font-bold text-white mt-1">{totalCount}</div>
                </div>
                <div className="rounded-xl bg-slate-850 p-4 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-500">Tasks Completed</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">{completedCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Project Task Breakdown</h3>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            {projectTasks.length > 0 ? (
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-500 text-xs font-semibold uppercase tracking-wider select-none">
                    <th className="px-5 py-3">Task Title</th>
                    <th className="px-5 py-3">Priority</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Assignee</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {projectTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-850/30 transition-colors">
                      <td className="px-5 py-4 font-medium text-white">{t.title}</td>
                      <td className="px-5 py-4 font-semibold">
                        <span className={
                          t.priority === 'Critical' ? 'text-red-400' :
                            t.priority === 'High' ? 'text-orange-400' :
                              t.priority === 'Medium' ? 'text-amber-400' : 'text-slate-400'
                        }>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${t.status === 'Done' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            t.status === 'In Progress' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                              'bg-slate-500/20 text-slate-300 border-slate-500/30'
                          }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar name={t.assignee?.name || 'User'} initials={t.assignee?.avatar || 'U'} size="xs" color="" />
                          <span className="text-slate-300">{t.assignee?.name}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-slate-500">
                No tasks logged for this project yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
