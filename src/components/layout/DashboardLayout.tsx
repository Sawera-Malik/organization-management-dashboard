import { useState, useEffect, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { useAuth } from '../../hooks/useAuth'
import { useOrganization } from '../../hooks/useOrganization'
import { CommandPalette } from './CommandPalette'

interface DashboardLayoutProps {
  children: ReactNode
  pageTitle?: string
}

export function DashboardLayout({ children, pageTitle = 'Overview' }: DashboardLayoutProps) {
  const { session } = useAuth()
  const { activeOrganization } = useOrganization()
  const user = session?.user
  const org = activeOrganization

  const [isPaletteOpen, setIsPaletteOpen] = useState(false)

  const [isOffline, setIsOffline] = useState(!navigator.onLine)

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false)
    }
    function handleOffline() {
      setIsOffline(true)
    }
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsPaletteOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6 py-3 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-2 text-sm text-slate-400" aria-label="Breadcrumb">
              <span className="font-medium text-slate-300">{org?.name ?? 'Workspace'}</span>
              <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span>{pageTitle}</span>
            </nav>

            {isOffline && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-400 border border-red-500/20 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                Offline Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPaletteOpen(true)}
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-850 px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-400 transition hover:border-slate-600 focus:outline-none"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search...</span>
              <kbd className="ml-3 rounded border border-slate-750 bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-500 font-mono">⌘K</kbd>
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
              {user?.avatar ?? '??'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} />
    </div>
  )
}
