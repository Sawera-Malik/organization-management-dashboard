import { ReactNode } from 'react'
import type { AuthUser, Organization, UserRole } from '../types/auth'

export interface MockUserRecord extends Omit<AuthUser, 'role'> {
  role: ReactNode
  color: string
  password: string
  organizationRoles: Record<string, UserRole>
}

export const MOCK_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-1',
    name: 'Acme Corporation',
    slug: 'acme-corp',
    initials: undefined,
    color: undefined
  },
  {
    id: 'org-2',
    name: 'TechFlow Solutions',
    slug: 'techflow',
    initials: undefined,
    color: undefined
  },
  {
    id: 'org-3',
    name: 'Nova Labs',
    slug: 'nova-labs',
    initials: undefined,
    color: undefined
  },
]

export const MOCK_USERS: MockUserRecord[] = [
  {
    id: 'u1',
    name: 'Sarah Chen',
    email: 'owner@example.com',
    password: 'Owner@123',
    avatar: 'SC',
    organizationIds: ['org-1', 'org-2'],
    activeOrganizationId: 'org-1',
    organizationRoles: {
      'org-1': 'owner',
      'org-2': 'owner',
    },
    role: undefined,
    color: 'white'
  },
  {
    id: 'u2',
    name: 'James Miller',
    email: 'admin@example.com',
    password: 'Admin@123',
    avatar: 'JM',
    organizationIds: ['org-1'],
    activeOrganizationId: 'org-1',
    organizationRoles: {
      'org-1': 'admin',
    },
    role: undefined,
    color: 'blue'
  },
  {
    id: 'u3',
    name: 'Emily Park',
    email: 'manager@example.com',
    password: 'Manager@123',
    avatar: 'EP',
    organizationIds: ['org-1', 'org-3'],
    activeOrganizationId: 'org-1',
    organizationRoles: {
      'org-1': 'manager',
      'org-3': 'manager',
    },
    role: undefined,
    color: ''
  },
  {
    id: 'u4',
    name: 'Alex Torres',
    email: 'member@example.com',
    password: 'Member@123',
    avatar: 'AT',
    organizationIds: ['org-1'],
    activeOrganizationId: 'org-1',
    organizationRoles: {
      'org-1': 'member',
    },
    role: undefined,
    color: ''
  },
]

export interface Project {
  ownerId: string
  id: string
  name: string
  organizationId: string

  status: 'In Progress' | 'Review' | 'Backlog' | 'Completed'

  owner: MockUserRecord
  members: MockUserRecord[]

  priority: 'Critical' | 'High' | 'Medium' | 'Low'

  progress: number
  deadline: string
  updated: string

  tasks: number
  completedTasks: number
}

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Landing Page Redesign',
    organizationId: 'org-1',
    status: 'In Progress',
    priority: 'High',
    owner: MOCK_USERS[0],
    members: [MOCK_USERS[0], MOCK_USERS[1], MOCK_USERS[2]],
    progress: 68,
    deadline: '2026-09-15',
    updated: '2 hr ago',
    tasks: 24,
    completedTasks: 16,
    ownerId: ''
  },

  {
    id: '2',
    name: 'API Gateway Migration',
    organizationId: 'org-1',
    status: 'Review',
    priority: 'Critical',
    owner: MOCK_USERS[1],
    members: [MOCK_USERS[1], MOCK_USERS[3]],
    progress: 90,
    deadline: '2026-08-30',
    updated: '1 day ago',
    tasks: 18,
    completedTasks: 16,
    ownerId: ''
  },

  {
    id: '3',
    name: 'Mobile App v2',
    organizationId: 'org-1',
    status: 'In Progress',
    priority: 'High',
    owner: MOCK_USERS[2],
    members: [MOCK_USERS[2], MOCK_USERS[3]],
    progress: 42,
    deadline: '2026-10-20',
    updated: '3 hr ago',
    tasks: 56,
    completedTasks: 24,
    ownerId: ''
  },

  {
    id: '4',
    name: 'Data Warehouse Setup',
    organizationId: 'org-1',
    status: 'Backlog',
    priority: 'Medium',
    owner: MOCK_USERS[3],
    members: [MOCK_USERS[3]],
    progress: 8,
    deadline: '2026-11-01',
    updated: '1 week ago',
    tasks: 12,
    completedTasks: 1,
    ownerId: ''
  },

  {
    id: '5',
    name: 'Auth & SSO Integration',
    organizationId: 'org-1',
    status: 'Completed',
    priority: 'Critical',
    owner: MOCK_USERS[0],
    members: [MOCK_USERS[0], MOCK_USERS[1]],
    progress: 100,
    deadline: '2026-08-10',
    updated: '2 days ago',
    tasks: 20,
    completedTasks: 20,
    ownerId: ''
  },
]
export interface Task {
  assigneeId: string
  id: string
  title: string
  project: string
  organizationId: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'Done' | 'In Progress' | 'Todo' | 'Review'
  assignee: MockUserRecord
  due?: string
  version?: number
  updatedAt?: string
}

export const MOCK_TASKS: Task[] = [
  {
    id: 't1', title: 'Design system tokens', project: 'Website Redesign', organizationId: 'org-1', priority: 'High', status: 'Done', assignee: MOCK_USERS[2],
    assigneeId: ''
  },
  {
    id: 't2', title: 'Migrate customer schemas', project: 'CRM Migration', organizationId: 'org-1', priority: 'Critical', status: 'In Progress', assignee: MOCK_USERS[2],
    assigneeId: ''
  },
  {
    id: 't3', title: 'Setup database cluster', project: 'CRM Migration', organizationId: 'org-1', priority: 'High', status: 'Todo', assignee: MOCK_USERS[2],
    assigneeId: ''
  },
  {
    id: 't4', title: 'Build telemetry dashboard', project: 'Analytics Platform', organizationId: 'org-1', priority: 'Medium', status: 'Done', assignee: MOCK_USERS[2],
    assigneeId: ''
  },

  {
    id: 't5', title: 'Push notification service', project: 'Mobile Application', organizationId: 'org-2', priority: 'High', status: 'In Progress', assignee: MOCK_USERS[2],
    assigneeId: ''
  },
  {
    id: 't6', title: 'OAuth2 integration docs', project: 'API Redesign', organizationId: 'org-2', priority: 'Medium', status: 'Todo', assignee: MOCK_USERS[2],
    assigneeId: ''
  },

  {
    id: 't7', title: 'Train model classifier', project: 'AI Dashboard', organizationId: 'org-3', priority: 'Critical', status: 'In Progress', assignee: MOCK_USERS[2],
    assigneeId: ''
  },
  {
    id: 't8', title: 'Secure document upload', project: 'Research Portal', organizationId: 'org-3', priority: 'High', status: 'Todo', assignee: MOCK_USERS[2],
    assigneeId: ''
  },
]

export function findUserByCredentials(
  email: string,
  password: string,
): MockUserRecord | null {
  const normalized = email.trim().toLowerCase()
  return (
    MOCK_USERS.find(
      (u) => u.email === normalized && u.password === password,
    ) ?? null
  )
}

export function findOrganizationById(id: string): Organization | null {
  return MOCK_ORGANIZATIONS.find((o) => o.id === id) ?? null
}

export interface KanbanTask {
  id: string
  title: string
  priority: string
  assignee: {
    id: string
    name: string
    avatar: string
    color: string
  }
  due: string
  project: string
  comments: number
  organizationId: string
  status: 'Todo' | 'In Progress' | 'Review' | 'Completed'
}

export interface KanbanColumn {
  id: string
  label: string
  color: string
  tasks: KanbanTask[]
}
export const kanbanColumns: KanbanColumn[] = [
  {
    id: 'backlog', label: 'Backlog', color: '#6B7280',
    tasks: [
      {
        id: 'k1', title: 'Set up CI/CD pipeline for mobile', priority: 'Medium', assignee: MOCK_USERS[2], due: '2026-09-01', project: 'Mobile App v2',
        organizationId: '',
        status: 'Todo',
        comments: 0
      },
      {
        id: 'k2', title: 'Write API documentation', priority: 'Low', assignee: MOCK_USERS[3], due: '2026-08-25', project: 'API Gateway',
        organizationId: '',
        status: 'Todo',
        comments: 0
      },
      {
        id: 'k3', title: 'Data pipeline for analytics', priority: 'Medium', assignee: MOCK_USERS[3], due: '2026-10-01', project: 'Data Warehouse',
        organizationId: '',
        status: 'Todo',
        comments: 0
      },
    ]
  },
  {
    id: 'todo', label: 'To Do', color: '#3B82F6',
    tasks: [
      {
        id: 'k4', title: 'Add E2E tests for checkout flow', priority: 'High', assignee: MOCK_USERS[0], due: '2026-09-10', project: 'Mobile App v2',
        organizationId: '',
        status: 'Todo',
        comments: 0
      },
      {
        id: 'k5', title: 'Profile page performance optimization', priority: 'Medium', assignee: MOCK_USERS[4], due: '2026-08-18', project: 'Performance Audit',
        organizationId: '',
        status: 'Todo',
        comments: 0
      },
    ]
  },
  {
    id: 'in-progress', label: 'In Progress', color: '#F59E0B',
    tasks: [
      {
        id: 'k6', title: 'Design token system for component library', priority: 'High', assignee: MOCK_USERS[0], due: '2026-08-20', project: 'Landing Page',
        organizationId: '',
        status: 'In Progress',
        comments: 0
      },
      {
        id: 'k7', title: 'Fix dashboard layout on tablet', priority: 'High', assignee: MOCK_USERS[5], due: '2026-08-15', project: 'Customer Dashboard',
        organizationId: '',
        status: 'In Progress',
        comments: 0
      },
      {
        id: 'k8', title: 'Build notification system', priority: 'High', assignee: MOCK_USERS[2], due: '2026-09-05', project: 'Mobile App v2',
        organizationId: '',
        status: 'In Progress',
        comments: 0
      },
      {
        id: 'k9', title: 'Implement dark mode', priority: 'Low', assignee: MOCK_USERS[5], due: '2026-08-30', project: 'Customer Dashboard',
        organizationId: '',
        status: 'In Progress',
        comments: 0
      },
    ]
  },
  {
    id: 'review', label: 'Review', color: '#8B5CF6',
    tasks: [
      {
        id: 'k10', title: 'Implement JWT refresh token rotation', priority: 'Critical', assignee: MOCK_USERS[1], due: '2026-08-12', project: 'Auth & SSO',
        organizationId: '',
        status: 'Todo',
        comments: 0
      },
      {
        id: 'k11', title: 'Security audit dependencies', priority: 'Critical', assignee: MOCK_USERS[0], due: '2026-08-11', project: 'Auth & SSO',
        organizationId: '',
        status: 'Todo',
        comments: 0
      },
    ]
  },
  {
    id: 'completed', label: 'Completed', color: '#10B981',
    tasks: [
      {
        id: 'k12', title: 'Migrate legacy auth endpoints', priority: 'Critical', assignee: MOCK_USERS[1], due: '2026-08-10', project: 'API Gateway',
        organizationId: '',
        status: 'In Progress',
        comments: 0
      },
    ]
  },
]