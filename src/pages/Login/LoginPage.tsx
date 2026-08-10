import { Navigate } from 'react-router-dom'
import { LoginForm } from '../../components/auth/LoginForm'
import { useAuth } from '../../hooks/useAuth'

function LoginHeroPanel() {
  return (
    <aside className="auth-panel" aria-label="Synapse introduction">
      <div className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" role="presentation">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.15)" />
        </svg>
      </div>

      <h1>Everything your team needs, in one place.</h1>
      <p>Track projects, manage tasks, analyze performance, and collaborate across your entire organization.</p>

      <div className="feature-pills" role="list">
        {['Projects', 'Tasks', 'Analytics', 'Teams', 'Kanban', 'Reports'].map((feat) => (
          <div key={feat} className="feature-pill" role="listitem">{feat}</div>
        ))}
      </div>
    </aside>
  )
}

export function LoginPage() {
  const { isAuthenticated, isSessionHydrated } = useAuth()

  if (!isSessionHydrated) return null
  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  return (
    <main className="auth-shell">
      <section className="auth-form-panel" aria-label="Sign in form">
        <div className="form-card">
          <div className="form-header">
            <div className="form-brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" role="presentation">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" fill="rgba(255,255,255,0.2)" />
              </svg>
            </div>
            <div className="form-header-text">
              <h2>Welcome back</h2>
              <p>Sign in to your workspace to continue</p>
            </div>
          </div>

          <LoginForm />
        </div>
      </section>

      <LoginHeroPanel />
    </main>
  )
}