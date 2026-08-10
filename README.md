# NexusSaaS — Multi-Tenant Project Management Platform

A fully-featured SaaS dashboard built with **React 19**, **Vite 5**, **TypeScript 5.7 (strict)**, and **Tailwind CSS v3** — no backend required. All data persists in `localStorage` which simulates a real server-side API with paginated queries, optimistic updates, conflict detection, and RBAC-gated operations across multiple organizations.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Authentication & Session](#authentication--session)
5. [Multi-Tenant Organizations](#multi-tenant-organizations)
6. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
7. [Pages & Features](#pages--features)
8. [Global Features](#global-features)
9. [Data Architecture](#data-architecture)
10. [Mock Login Credentials](#mock-login-credentials)
11. [Build & Development Commands](#build--development-commands)
12. [Resetting Mock Data](#resetting-mock-data)
13. [Assignment Feature Checklist](#assignment-feature-checklist)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19.2.8 |
| Build Tool | Vite 5.4.x |
| Language | TypeScript 5.7 (strict mode) |
| Styling | Tailwind CSS v3.4 |
| Routing | React Router v7 |
| State Management | React Context + hooks |
| Persistence | `localStorage` (mock database) |
| Charts | Pure SVG — no chart library |

> **No external UI libraries** (no MUI, Chakra, shadcn). No real backend. No Next.js.

---

## Getting Started

### Prerequisites

- **Node.js** v18 or later
- **npm** v9 or later

### Step 1 — Clone the repository

```bash
git clone <repo-url>
cd Task-2
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Start the development server

```bash
npm run dev
```

The app starts at **http://localhost:5173**

### Step 4 — Log in to the app

Open the browser and log in using one of the [mock credentials](#mock-login-credentials).

> **First-load database seeding:** On first visit, the app seeds 5,000+ realistic tasks, mock organizations, projects, and users into `localStorage`. This takes a moment but only happens once.

### Step 5 — Explore features

- Switch organizations using the **org switcher** in the sidebar
- Open the **Command Palette** with `Ctrl+K` / `Cmd+K`
- Drag tasks on the **Kanban Board**
- Customize dashboard widgets with the **Customize View** button

### Step 6 — Build for production (optional)

```bash
npm run build
```

Output appears in the `dist/` folder. Requires zero TypeScript errors.

### Step 7 — Preview production build (optional)

```bash
npm run preview
```

---

## Project Structure

```
src/
├── auth/                         # Pure RBAC logic (no React)
│   ├── authorization.ts          # checkPermission(), checkAllPermissions()
│   ├── permissions.ts            # ROLE_PERMISSIONS — single source of truth
│   └── roles.ts                  # getRolePermissions(), ROLE_LABELS, ROLE_COLORS
│
├── components/
│   ├── analytics/                # SVG chart components
│   │   ├── ActivityChart.tsx     # Bar chart — active users
│   │   ├── DateRangeSelector.tsx # Date range dropdown
│   │   ├── ProjectDistribution.tsx # Donut chart
│   │   ├── RecentActivity.tsx    # Activity feed
│   │   ├── RevenueChart.tsx      # Line chart
│   │   └── StatCard.tsx          # KPI metric card
│   ├── auth/
│   │   ├── AccessDenied.tsx      # 403 screen
│   │   └── LoginForm.tsx         # Login form with validation
│   ├── layout/
│   │   ├── CommandPalette.tsx    # Ctrl+K global search & navigation
│   │   ├── DashboardLayout.tsx   # Shell: Sidebar + Header + offline indicator
│   │   ├── OrgSwitcher.tsx       # Org dropdown + create org modal
│   │   └── Sidebar.tsx           # Navigation sidebar (collapsible)
│   ├── routing/
│   │   ├── PermissionRoute.tsx   # RBAC route guard (permission-level)
│   │   └── ProtectedRoute.tsx    # Auth route guard (login check)
│   ├── ui/
│   │   └── RoleBadge.tsx         # Color-coded role pill badge
│   ├── Avatar.tsx                # User avatar with initials
│   └── Badge.tsx                 # Status / priority badge
│
├── context/
│   ├── AuthContext.tsx           # Auth state, login/logout, session
│   └── OrganizationContext.tsx   # Active org, org switching, org creation
│
├── data/
│   ├── analytics.json            # Static analytics data per org+date-range
│   └── mockUsers.ts              # Type definitions + seed data
│
├── hooks/
│   ├── useAuth.ts                # Consume AuthContext
│   ├── useOrganization.ts        # Consume OrganizationContext
│   └── usePermissions.ts         # hasPermission() reactive hook
│
├── lib/
│   └── storage.ts                # localStorage session helpers
│
├── pages/
│   ├── Analytics/AnalyticsPage.tsx    # Charts + org-scoped metrics
│   ├── Dashboard/DashboardPage.tsx    # Customizable widget dashboard
│   ├── Kanban/Kanban.tsx              # Drag-and-drop board
│   ├── Login/LoginPage.tsx            # Authentication form
│   ├── Organization/OrganizationPage.tsx # Org settings (Owner only)
│   ├── Projects/
│   │   ├── ProjectsPage.tsx      # Projects CRUD table
│   │   └── ProjectDetail.tsx     # Project detail + task breakdown
│   ├── Tasks/TasksPage.tsx        # Full task table with all CRUD
│   └── Users/UsersPage.tsx        # Team members listing
│
├── services/
│   ├── analyticsService.ts       # Fetch analytics from JSON + simulate latency
│   ├── authService.ts            # Login logic + session creation
│   ├── dbService.ts              # localStorage CRUD + 5,000-task generator
│   └── taskService.ts            # Async task query/create/update/delete
│
├── types/
│   ├── analytics.ts              # Analytics TypeScript interfaces
│   └── auth.ts                   # Auth interfaces: AuthUser, Organization, Session
│
├── App.tsx                       # Route definitions
└── main.tsx                      # React root mount
```

---

## Authentication & Session

### Login Flow

1. User fills email + password in the login form
2. `LoginForm` calls `signIn()` from `useAuth()`
3. `AuthContext` calls `loginWithCredentials()` in `authService.ts`
4. The service validates credentials against mock user records
5. A session object (`AuthSession`) is created with a mock token
6. Session is written to `localStorage` (or `sessionStorage` if "Remember me" is off)
7. User is redirected to `/dashboard`

### Session Persistence

| Setting | Behavior |
|---------|---------|
| **Remember me checked** | Session persists across browser restarts (`localStorage`) |
| **Remember me unchecked** | Session cleared on tab close (`sessionStorage`) |

### Protected Routes

`<ProtectedRoute>` wraps every authenticated route. It reads the session on mount, shows nothing during hydration, and redirects to `/login` if unauthenticated.

---

## Multi-Tenant Organizations

### Organization Switcher

Located in the sidebar. Click the workspace button to see a dropdown of all organizations the current user belongs to.

When the active organization changes:
- All page data reloads — filtered to the new org
- The user's effective **role** updates (same user can be Owner in Org A, Manager in Org B)
- All permission checks re-evaluate
- Dashboard widgets reload org-specific metrics

### Creating a New Organization (Owner only)

1. Click the workspace button in the sidebar
2. Select **"+ Create Organization"** at the bottom of the dropdown
3. Fill in a name and a URL slug (auto-generated, alphanumeric + hyphens)
4. Submit — the new org is persisted and becomes the active workspace

### Data Isolation

Every data record carries an `organizationId` field. All queries in `taskService.ts` and `dbService.ts` filter strictly on `activeOrganizationId`. **No data leaks between organizations** — switching from Org A to Org B will show only Org B's projects, tasks, and analytics.

---

## Role-Based Access Control (RBAC)

### Roles

| Role | Description |
|------|-------------|
| **Owner** | Full access. Can manage organization settings and create new organizations |
| **Admin** | Full CRUD on projects, tasks, and users. Cannot access org settings |
| **Manager** | Can view/edit assigned projects and create/edit tasks. No user management |
| **Member** | Read-only on most pages. Can edit tasks assigned to them |

### Permission Matrix

| Permission | Owner | Admin | Manager | Member |
|-----------|:-----:|:-----:|:-------:|:------:|
| `dashboard.view` | ✅ | ✅ | ✅ | ✅ |
| `analytics.view` | ✅ | ✅ | ✅ | ❌ |
| `users.view`     | ✅ | ✅ | ❌ | ❌ |
| `users.create`   | ✅ | ✅ | ❌ | ❌ |
| `users.edit`     | ✅ | ✅ | ❌ | ❌ |
| `users.delete`   | ✅ | ✅ | ❌ | ❌ |
| `projects.view`  | ✅ | ✅ | ✅ | ✅ |
| `projects.create`| ✅ | ✅ | ❌ | ❌ |
| `projects.edit`  | ✅ | ✅ | ✅ | ❌ |
| `projects.delete`| ✅ | ✅ | ❌ | ❌ |
| `tasks.view`     | ✅ | ✅ | ✅ | ✅ |
| `tasks.create`   | ✅ | ✅ | ✅ | ❌ |
| `tasks.edit`     | ✅ | ✅ | ✅ | ✅ |
| `tasks.delete`   | ✅ | ✅ | ❌ | ❌ |
| `organization.manage` | ✅ | ❌ | ❌ | ❌ |

### How Permissions Are Enforced

Permissions are checked at **three levels**:

1. **Route level** — `<PermissionRoute permission="...">` renders an Access Denied screen for unauthorized users
2. **UI level** — Buttons/forms hidden when `hasPermission()` returns `false`
3. **Data level** — Manager/Member see only their own projects; org isolation in all services

```tsx
// Example: component-level gating
const { hasPermission } = usePermissions()

{hasPermission('tasks.create') && (
  <button onClick={openCreateForm}>Create Task</button>
)}
```

The permission definitions live in [`src/auth/permissions.ts`](src/auth/permissions.ts) as a single `ROLE_PERMISSIONS` map — the only source of truth for RBAC.

---

## Pages & Features

### Dashboard (`/dashboard`)

Accessible to all authenticated users.

**Features:**
- Org-scoped **KPI stat cards** — total revenue, active users, conversion rate, active projects, tasks completed, team size
- **Revenue Line Chart** — monthly trend (SVG, interactive hover tooltip)
- **Project Status Donut Chart** — breakdown by project lifecycle stage
- **Active Users Bar Chart** — weekly/monthly activity trend
- **Recent Activity Feed** — timestamped user action list
- **Quick Actions** — role-gated shortcuts (Invite User, New Task, Delete Project)

**Widget Customization:**
1. Click the **"Customize View"** button (top right)
2. A slide-over panel opens with all 6 widgets listed
3. Toggle visibility on/off with the checkbox
4. Change width: `1/3` | `2/3` | `Full`
5. Reorder with **▲ ▼** arrows
6. Click **"Reset Layout"** to restore defaults
7. Layout is persisted per-organization in `localStorage`

---

### Projects (`/projects`)

Requires `projects.view` permission.

**Features:**
- List all org-scoped projects with status, priority, owner, team, deadline
- **Search** by project name
- **Filter** by status (Backlog / In Progress / Review / Completed)
- **Checkbox multi-select** rows
- **Create Project** (Owner/Admin) — modal form with name, status, priority, owner, deadline, team members
- **Edit Project** (Owner/Admin/Manager) — same form pre-filled
- **Delete Project** (Owner/Admin) — confirmation dialog before deletion
- **Click row** → navigate to Project Detail page

**Project Detail (`/projects/:id`):**
- Member list with avatars
- Live task breakdown table (linked to the tasks DB)
- Progress bar calculated from actual completed tasks
- Task count metrics

---

### Kanban Board (`/kanban`)

Requires `projects.view` permission.

**Features:**
- **4 columns**: To Do | In Progress | In Review | Done — aligned to `Task.status`
- **Drag-and-drop** cards between columns (HTML5 Drag API)
- **Optimistic updates** — card moves instantly in the UI before async save
- **Automatic rollback** — if the save fails, the card snaps back with a "Rolled back" pill
- **Save status pills** per card: `Saving...` | `Saved ✓` | `Rolled back`
- **Simulate Failure** toggle — forces all drops to fail (demonstrates rollback UX)
- **Search** — filter cards by task title or project
- **Priority filter** — show only Critical / High / Medium / Low cards
- **Org-isolated** — only shows tasks for the active organization

**Synchronization with Tasks page:** Both the Kanban board and Tasks table read from and write to the same `localStorage` database (`nexus_db_tasks`). Status changes on Kanban are immediately reflected in the Tasks table.

---

### Tasks (`/tasks`)

Requires `tasks.view` permission.

**Full CRUD:**

| Action | Trigger | Who |
|--------|---------|-----|
| Create | "Create Task" button | Owner, Admin, Manager |
| Read | Table rows (paginated) | All with `tasks.view` |
| Edit | Row "Edit" button | Owner, Admin, Manager, Member |
| Delete | Row "Delete" button | Owner, Admin |
| Bulk Delete | Select rows → "Delete Selected" | Owner, Admin |

**Table Controls:**
- **Search** — filters by title or project name (URL-synced)
- **Status filter** — Todo / In Progress / Review / Done
- **Priority filter** — Critical / High / Medium / Low
- **Column sort** — click any header to toggle asc/desc
- **Pagination** — 10 / 25 / 50 / 100 rows per page
- **URL state** — all filters, sort, page are in URL query params (shareable/bookmarkable)

**UX Patterns:**
- **Undo Delete** — 6-second toast with "Undo Deletion" button (works for single and bulk)
- **Optimistic updates** — edit is applied immediately, rolled back if async save fails
- **Error state** — failed query shows full-page error with Retry button
- **Loading skeleton** — animated placeholder rows during fetch

**Performance:** All filtering, sorting, and pagination happen inside `taskService.queryTasks()` — only the current page slice is rendered in the DOM. The database contains 5,100+ tasks.

---

### Analytics (`/analytics`)

Requires `analytics.view` permission (Owner, Admin, Manager only).

**Features:**
- **Date range selector**: Last 7 days / Last 30 days / Last 90 days / This year
- **6 KPI stat cards** with org-specific values and trend arrows
- **Revenue line chart** with hover tooltips
- **Project distribution donut chart**
- **User activity bar chart**
- **Recent activity feed**
- **Simulate Failure** toggle — demos error state with retry button
- **Empty state** shown when org has no data for selected period
- Data updates when switching organizations or date ranges

---

### Users (`/users`)

Requires `users.view` permission (Owner, Admin only).

- Lists all team members in the active organization
- Shows avatar, name, email, and role
- Role badges color-coded by level

---

### Organization Settings (`/organization`)

Requires `organization.manage` permission — **Owner only**.

- View/edit organization name and slug
- Two-factor authentication toggle (UI only)
- Danger zone — Delete Organization action

> Members, Managers, and Admins who navigate to `/organization` see an **Access Denied** screen automatically via `<PermissionRoute>`.

---

## Global Features

### Command Palette (`Ctrl+K` / `Cmd+K`)

Press `Ctrl+K` (Windows/Linux) or `Cmd+K` (Mac) from anywhere, or click the search bar in the header.

| Mode | Behavior |
|------|---------|
| **Empty query** | Shows permission-gated navigation shortcuts |
| **Typed query** | Full-text search across projects, tasks, users in active org |

**Keyboard controls:**
- `↑` / `↓` — navigate items
- `Enter` — execute selected action
- `Esc` — close palette

### Offline Status Indicator

The app monitors `navigator.onLine` in real-time. When the browser loses connectivity:
- An animated **"Offline Mode"** badge appears in the header breadcrumb
- Disappears automatically when connectivity is restored

### Concurrent Edit Conflict Detection

Every task record has a `version` counter (integer). When updating a task:
- The client's `expectedVersion` is compared against the stored `version`
- If versions don't match (another tab updated first), a `CONCURRENT_EDIT_CONFLICT` error is thrown
- The UI catches this and rolls back the optimistic update

---

## Data Architecture

### Data Flow

```
Component
  └─> Hook (useAuth / useOrganization / usePermissions)
        └─> Service (taskService / analyticsService / authService)
              └─> dbService (getters/setters)
                    └─> localStorage (nexus_db_*)
```

### localStorage Keys

| Key | Contents |
|-----|---------|
| `nexus_db_organizations` | All organization records |
| `nexus_db_projects` | All project records |
| `nexus_db_tasks` | All task records (5,100+) |
| `nexus_db_users` | All user records |
| `nexus_session` | Current auth session |
| `dashboard_layout_<orgId>` | Widget preferences per org |

### Mock Database Initialization

The `initDb()` function in `dbService.ts` seeds the database on first load:
- Reads mock seed data from `data/mockUsers.ts`
- Generates 5,100 additional tasks across 3 organizations with realistic fields
- Only writes once — subsequent loads read from existing `localStorage` keys

---

## Mock Login Credentials

| Role | Email | Password | Organizations |
|------|-------|---------|--------------|
| **Owner** | `owner@example.com` | `Owner@123` | Acme Corporation, TechFlow Solutions |
| **Admin** | `admin@example.com` | `Admin@123` | Acme Corporation |
| **Manager** | `manager@example.com` | `Manager@123` | Acme Corporation, Nova Labs |
| **Member** | `member@example.com` | `Member@123` | Acme Corporation |

> **Tip:** Log in as **Owner** to see all features — including Organization Settings, "Create Organization" in the org switcher, and all admin-level CRUD operations.

### Organization Overview

| Organization | ID | Members |
|-------------|-----|---------|
| Acme Corporation | `org-1` | All 4 mock users |
| TechFlow Solutions | `org-2` | Owner (Sarah Chen) |
| Nova Labs | `org-3` | Manager (Emily Park) |

---

## Build & Development Commands

```bash
# Start development server (with hot module replacement)
npm run dev

# TypeScript type-check + production build
npm run build

# Preview the production build locally
npm run preview

# Run ESLint
npm run lint
```

### TypeScript Compiler Settings (`tsconfig.app.json`)

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

All strict checks must pass for `npm run build` to succeed.

---

## Resetting Mock Data

To wipe all mock data and re-seed from scratch, open **Browser DevTools → Console** and run:

```js
Object.keys(localStorage)
  .filter(k => k.startsWith('nexus_') || k.startsWith('dashboard_'))
  .forEach(k => localStorage.removeItem(k))

location.reload()
```

---

## Assignment Feature Checklist

### ✅ Authentication
- [x] Login with email + password
- [x] Logout
- [x] Session persistence (localStorage / sessionStorage)
- [x] Protected routes redirect to `/login` if unauthenticated
- [x] "Remember me" toggle
- [x] Client-side login validation

### ✅ Multi-Tenant Organizations
- [x] User belongs to multiple organizations
- [x] Organization switcher in sidebar
- [x] Active org changes all displayed data
- [x] Data isolation — no leakage between organizations
- [x] Owner can create new organizations
- [x] User's role updates per-org when switching
- [x] Org-specific dashboard widget layout persistence

### ✅ RBAC
- [x] Owner / Admin / Manager / Member roles
- [x] Centralized permission map (`auth/permissions.ts`)
- [x] Route-level guards (`PermissionRoute`)
- [x] UI-level permission gates (`hasPermission()`)
- [x] Role dynamically updates when switching organizations

### ✅ Dashboard
- [x] Organization-aware statistics (live from DB)
- [x] Multiple chart types — line, donut, bar (pure SVG)
- [x] Customizable widget grid (toggle, resize, reorder)
- [x] Widget layout persisted per organization
- [x] Quick action shortcuts (role-gated)

### ✅ Projects
- [x] Create project with validation (Owner/Admin)
- [x] Read/list with search + status filter
- [x] Edit project (Owner/Admin/Manager)
- [x] Delete project with confirmation dialog (Owner/Admin)
- [x] Project detail page with live task breakdown
- [x] Organization-scoped filtering
- [x] Manager/Member see only their own projects

### ✅ Kanban Board
- [x] 4 columns matching `Task.status` type
- [x] Drag-and-drop between columns (HTML5)
- [x] Optimistic updates with automatic rollback
- [x] Synchronized with Tasks table (same DB)
- [x] Organization-scoped cards
- [x] Search and priority filter
- [x] Simulate failure mode for rollback demo

### ✅ Tasks
- [x] Create task with full validation
- [x] Read/list with server-side pagination
- [x] Edit task with optimistic update
- [x] Delete task with 6-second undo toast
- [x] Bulk delete with undo support
- [x] Search by title/project
- [x] Filter by status, priority
- [x] Sort by any column (asc/desc)
- [x] URL-synced filter/sort/page state
- [x] 5,000+ tasks performance tested (only current page rendered)
- [x] Simulate API failure mode

### ✅ Analytics
- [x] Organization-specific metrics
- [x] Multiple chart types
- [x] Date range selector
- [x] Loading / error / empty states
- [x] Simulate failure + retry

### ✅ Users
- [x] Organization-scoped team members list
- [x] Role badges

### ✅ Global / UX
- [x] Command Palette (`Ctrl+K`) — search + navigation
- [x] Offline status indicator
- [x] Concurrent edit conflict detection (entity versioning)
- [x] Loading states (skeleton animations)
- [x] Error states with retry
- [x] Empty states
- [x] Responsive layout
- [x] Dark theme throughout
- [x] Sidebar collapse toggle

### ✅ Code Quality
- [x] TypeScript strict mode — zero build errors
- [x] No duplicate pages or folders
- [x] Clean data flow: Component → Hook → Service → dbService
- [x] No external UI libraries
- [x] No Next.js — pure Vite + React SPA
