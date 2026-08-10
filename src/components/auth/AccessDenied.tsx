import { useNavigate } from 'react-router-dom'

interface AccessDeniedProps {
  message?: string
  showBack?: boolean
}

export function AccessDenied({
  message = "You don't have permission to access this page.",
  showBack = true,
}: AccessDeniedProps) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
        <svg
          className="h-10 w-10 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-white">Access Denied</h1>

      <p className="mb-8 max-w-sm text-slate-400">{message}</p>

      {showBack && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl border border-slate-700 bg-slate-800/60 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700/60 hover:text-white"
          >
            ← Go Back
          </button>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  )
}
