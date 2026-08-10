import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { AuthenticationError } from '../../types/auth'

interface ValidationState {
  email?: string
  password?: string
}

function isValidEmail(email: string) {
  return /^\S+@\S+\.\S+$/.test(email)
}

export function LoginForm() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationState>({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    const nextErrors: ValidationState = {}
    if (!email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!isValidEmail(email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!password) {
      nextErrors.password = 'Password is required.'
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }
    setValidationErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError('')
    if (!validate()) return

    try {
      setIsSubmitting(true)
      await signIn({ email, password, rememberMe })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      if (error instanceof AuthenticationError) {
        setSubmitError(error.message)
        return
      }
      setSubmitError('Invalid email or password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate style={{ marginTop: '24px' }}>
      {submitError ? <div className="form-alert">{submitError}</div> : null}

      <div className="field-group">
        <label htmlFor="email">Email address</label>
        <div className="input-shell">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@acme.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={Boolean(validationErrors.email)}
            aria-describedby={validationErrors.email ? 'email-error' : undefined}
            className={validationErrors.email ? 'input-error' : ''}
          />
        </div>
        {validationErrors.email && (
          <p id="email-error" className="error-message">{validationErrors.email}</p>
        )}
      </div>

      <div className="field-group">
        <div className="field-meta">
          <label htmlFor="password">Password</label>
          <a className="text-link" href="/forgot-password" onClick={(e) => e.preventDefault()}>
            Forgot password?
          </a>
        </div>
        <div className="input-shell">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={Boolean(validationErrors.password)}
            aria-describedby={validationErrors.password ? 'password-error' : undefined}
            className={validationErrors.password ? 'input-error' : ''}
            style={{ paddingRight: '72px' }}
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((c) => !c)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {validationErrors.password && (
          <p id="password-error" className="error-message">{validationErrors.password}</p>
        )}
      </div>

      <div className="checkbox-row">
        <label className="checkbox">
          <input
            className="checkbox-input"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <span className="checkbox-label">Remember me for 30 days</span>
        </label>
      </div>

      <button className="submit-button" type="submit" id="sign-in-btn" disabled={isSubmitting}>
        <span className="button-content">
          {isSubmitting ? <span className="spinner" aria-hidden="true" /> : null}
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </span>
      </button>

      <div className="form-divider">or continue with</div>

      <button type="button" id="google-sso-btn" className="sso-button">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign in with Google SSO
      </button>

      <p className="helper-text">
        Demo: owner@example.com / Owner@123 · admin@example.com / Admin@123
      </p>
    </form>
  )
}