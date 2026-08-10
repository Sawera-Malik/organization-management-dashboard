import {
  MOCK_ORGANIZATIONS,
  MOCK_PROJECTS,
  MOCK_TASKS,
  MOCK_USERS,
  MockUserRecord,
  Project,
  Task,
} from '../data/mockUsers'
import type { Organization } from '../types/auth'

const ORGS_KEY = 'nexus_db_organizations'
const PROJECTS_KEY = 'nexus_db_projects'
const TASKS_KEY = 'nexus_db_tasks'
const USERS_KEY = 'nexus_db_users'

export function initDb() {
  if (typeof window === 'undefined') return

  if (!window.localStorage.getItem(ORGS_KEY)) {
    window.localStorage.setItem(ORGS_KEY, JSON.stringify(MOCK_ORGANIZATIONS))
  }
  if (!window.localStorage.getItem(PROJECTS_KEY)) {
    window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(MOCK_PROJECTS))
  }
  if (!window.localStorage.getItem(TASKS_KEY)) {
    const defaultTasks = [...MOCK_TASKS]
    const generatedTasks = generateLargeTaskSet()
    window.localStorage.setItem(TASKS_KEY, JSON.stringify([...defaultTasks, ...generatedTasks]))
  }
  if (!window.localStorage.getItem(USERS_KEY)) {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS))
  }
}

function generateLargeTaskSet(): Task[] {
  const tasks: Task[] = []
  const orgs = ['org-1', 'org-2', 'org-3']
  const priorities: Array<'Critical' | 'High' | 'Medium' | 'Low'> = ['Critical', 'High', 'Medium', 'Low']
  const statuses: Array<'Todo' | 'In Progress' | 'Done' | 'Review'> = ['Todo', 'In Progress', 'Done', 'Review']
  
  const projectNames = [
    'Landing Page Redesign',
    'API Gateway Migration',
    'Mobile App v2',
    'Data Warehouse Setup',
    'Auth & SSO Integration',
    'Website Redesign',
    'CRM Migration',
    'Analytics Platform',
    'Mobile Application',
    'API Redesign',
    'AI Dashboard',
    'Research Portal'
  ]

  const userInitials = ['SC', 'JM', 'EP', 'AT']

  for (let i = 1; i <= 5100; i++) {
    const orgId = orgs[i % orgs.length]
    const projIndex = i % projectNames.length
    const priority = priorities[i % priorities.length]
    const status = statuses[i % statuses.length]
    const assigneeInitials = userInitials[i % userInitials.length]

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (i % 30) - 15) 
    
    tasks.push({
      id: `gen-task-${i}`,
      title: `Task #${i}: Optimize query performance for project endpoint`,
      project: projectNames[projIndex],
      organizationId: orgId,
      priority,
      status,
      assignee: {
        id: `u${(i % 4) + 1}`,
        name: `User ${(i % 4) + 1}`,
        email: `user${(i % 4) + 1}@example.com`,
        avatar: assigneeInitials,
        organizationIds: ['org-1', 'org-2', 'org-3'],
        activeOrganizationId: 'org-1',
        organizationRoles: {},
        role: undefined,
        color: '',
        password: 'demo123'
      },
      due: dueDate.toISOString().split('T')[0],
      assigneeId: ''
    })
  }
  return tasks
}

export function getOrganizations(): Organization[] {
  initDb()
  try {
    return JSON.parse(window.localStorage.getItem(ORGS_KEY) || '[]')
  } catch {
    return MOCK_ORGANIZATIONS
  }
}

export function saveOrganizations(orgs: Organization[]) {
  window.localStorage.setItem(ORGS_KEY, JSON.stringify(orgs))
}

export function getProjects(): Project[] {
  initDb()
  try {
    return JSON.parse(window.localStorage.getItem(PROJECTS_KEY) || '[]')
  } catch {
    return MOCK_PROJECTS
  }
}

export function saveProjects(projects: Project[]) {
  window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects))
}

export function getTasks(): Task[] {
  initDb()
  try {
    return JSON.parse(window.localStorage.getItem(TASKS_KEY) || '[]')
  } catch {
    return []
  }
}

export function saveTasks(tasks: Task[]) {
  window.localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
}

export function getUsers(): MockUserRecord[] {
  initDb()
  try {
    return JSON.parse(window.localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return MOCK_USERS
  }
}

export function saveUsers(users: MockUserRecord[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}
