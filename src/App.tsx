import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { OrganizationProvider } from './context/OrganizationContext'
import { ProtectedRoute } from './components/routing/ProtectedRoute'
import { PermissionRoute } from './components/routing/PermissionRoute'

// Pages
import { LoginPage } from './pages/Login/LoginPage'
import { DashboardPage } from './pages/Dashboard/DashboardPage'
import { TasksPage } from './pages/Tasks/TasksPage'
import { UsersPage } from './pages/Users/UsersPage'
import { OrganizationPage } from './pages/Organization/OrganizationPage'

import './App.css'
import Projects from './pages/Projects/ProjectsPage'
import ProjectDetail from './pages/Projects/ProjectDetail'
import Kanban from './pages/Kanban/Kanban'

function App() {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="projects.view">
                  <Projects />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />
           <Route
            path="/kanban"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="projects.view">
                  <Kanban />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/projects/:id"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="projects.view">
                  <ProjectDetail />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <PermissionRoute permission="tasks.view">
                  <TasksPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <PermissionRoute
                  permission="users.view"
                  deniedMessage="You don't have permission to view team members."
                >
                  <UsersPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/organization"
            element={
              <ProtectedRoute>
                <PermissionRoute
                  permission="organization.manage"
                  deniedMessage="Organization settings are restricted to the Owner role."
                >
                  <OrganizationPage />
                </PermissionRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </OrganizationProvider>
    </AuthProvider>
  )
}

export default App
