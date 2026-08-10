import { getTasks, saveTasks } from './dbService'
import type { Task } from '../data/mockUsers'

export interface GetTasksParams {
  organizationId: string
  page: number
  pageSize: number
  search?: string
  status?: string
  priority?: string
  sortField?: string
  sortOrder?: 'asc' | 'desc'
  shouldFail?: boolean
}

export interface GetTasksResult {
  data: Task[]
  total: number
  page: number
  pageSize: number
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Mock API service acting like a real backend server query
export async function queryTasks({
  organizationId,
  page,
  pageSize,
  search = '',
  status = 'All',
  priority = 'All',
  sortField = 'id',
  sortOrder = 'asc',
  shouldFail = false,
}: GetTasksParams): Promise<GetTasksResult> {
  // Simulate network latency
  await wait(300)

  if (shouldFail) {
    throw new Error('Database response timeout. Failed to query tasks list.')
  }

  let allTasks = getTasks()

  // 1. Enforce Multi-tenant isolation
  let filtered = allTasks.filter((t) => t.organizationId === organizationId)

  // 2. Apply search keywords
  if (search.trim()) {
    const query = search.toLowerCase().trim()
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.project.toLowerCase().includes(query)
    )
  }

  // 3. Apply status filter
  if (status && status !== 'All') {
    filtered = filtered.filter((t) => t.status === status)
  }

  // 4. Apply priority filter
  if (priority && priority !== 'All') {
    filtered = filtered.filter((t) => t.priority === priority)
  }

  // 5. Apply sorting
  filtered.sort((a: any, b: any) => {
    let valA = a[sortField] || ''
    let valB = b[sortField] || ''

    if (sortField === 'assignee') {
      valA = a.assignee?.name || ''
      valB = b.assignee?.name || ''
    }

    if (typeof valA === 'string') {
      return sortOrder === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA)
    } else {
      return sortOrder === 'asc' ? valA - valB : valB - valA
    }
  })

  // 6. Pagination calculations
  const total = filtered.length
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = filtered.slice(startIndex, endIndex)

  return {
    data: paginatedData,
    total,
    page,
    pageSize,
  }
}

// Create/Update/Delete Mutations inside Mock DB
export async function createTask(taskData: Omit<Task, 'id'>): Promise<Task> {
  await wait(200)
  const allTasks = getTasks()
  const newTask: Task = {
    ...taskData,
    id: `task-${Date.now()}`,
    version: 1,
    updatedAt: new Date().toISOString(),
  }
  saveTasks([newTask, ...allTasks])
  return newTask
}

export async function updateTask(
  taskId: string,
  updates: Partial<Task>,
  expectedVersion?: number
): Promise<Task> {
  await wait(200)
  const allTasks = getTasks()
  let updatedTask: Task | null = null

  const existing = allTasks.find((t) => t.id === taskId)
  if (!existing) {
    throw new Error('Task not found')
  }

  const currentDbVersion = existing.version || 1

  // Check version mismatch
  if (expectedVersion !== undefined && expectedVersion !== currentDbVersion) {
    throw new Error('CONCURRENT_EDIT_CONFLICT: This item was changed by someone else.')
  }

  const nextVersion = currentDbVersion + 1

  const updatedTasks = allTasks.map((t) => {
    if (t.id === taskId) {
      updatedTask = {
        ...t,
        ...updates,
        version: nextVersion,
        updatedAt: new Date().toISOString(),
      }
      return updatedTask
    }
    return t
  })

  saveTasks(updatedTasks)
  return updatedTask!
}

export async function deleteTask(taskId: string): Promise<void> {
  await wait(200)
  const allTasks = getTasks()
  const filtered = allTasks.filter((t) => t.id !== taskId)
  saveTasks(filtered)
}

export async function deleteTasksBulk(taskIds: string[]): Promise<void> {
  await wait(200)
  const allTasks = getTasks()
  const filtered = allTasks.filter((t) => !taskIds.includes(t.id))
  saveTasks(filtered)
}
