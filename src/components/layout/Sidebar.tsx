import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { OrgSwitcher } from './OrgSwitcher'
import Avatar from '../../components/Avatar'
import {  DashIcon, HelpIcon, KanbanIcon, ProjectsIcon, TasksIcon, UsersIcon } from '../ui/icons'

export function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, signOut } = useAuth()

  const [collapsed, setCollapsed] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const user = session?.user

  const nav = [
    { path: '/dashboard', label: 'Dashboard', icon: DashIcon },
    { path: '/projects', label: 'Projects', icon: ProjectsIcon },
    { path: '/tasks', label: 'Tasks', icon: TasksIcon },
    { path: '/kanban', label: 'Kanban', icon: KanbanIcon },
    { path: '/users', label: 'Users & Teams', icon: UsersIcon },
  ]

  const handleNavigate = (path: string) => {
    navigate(path)
  }

  return (
    <aside
      className="flex flex-col shrink-0 h-full bg-slate-900 border-r border-slate-800 text-slate-200 transition-all duration-200 relative"
      style={{ width: collapsed ? 56 : 220 }}
    >
      <div className="p-3 border-b border-slate-800">
        <OrgSwitcher collapsed={collapsed} />
      </div>

      <nav className="flex-1 overflow-y-auto py-2 no-scrollbar">
        {nav.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path
          return (
            <button
              key={path}
              onClick={() => handleNavigate(path)}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-2.5 px-3 py-2 mx-0 my-0.5 rounded-md transition-colors text-sm font-medium ${active
                ? 'bg-indigo-600/20 text-indigo-300'
                : 'text-slate-300 hover:bg-slate-800/40 hover:text-white'
                } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-400' : 'text-slate-400'}`} />
              {!collapsed && <span>{label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-slate-800 py-2 px-2">
        <button
          title={collapsed ? 'Help' : undefined}
          className={`w-full flex items-center gap-2.5 px-3 py-2 my-0.5 rounded-md transition-colors text-sm font-medium text-slate-300 hover:bg-slate-800/40 ${collapsed ? 'justify-center' : ''}`}
        >
          <HelpIcon className="w-4 h-4 shrink-0 text-slate-400" />
          {!collapsed && <span>Help</span>}
        </button>

        <div className="relative mt-2">
          <button
            onClick={() => setShowUserMenu(v => !v)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-800/40 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            <Avatar name={user?.name ?? 'User'} initials={user?.avatar ?? '??'} color={'#334155'} size="sm" />
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium text-white truncate">{user?.name ?? 'User'}</div>
                <div className="text-xs text-slate-400 truncate">{user?.role ?? ''}</div>
              </div>
            )}
          </button>
          {showUserMenu && !collapsed && (
            <div className="absolute bottom-full left-0 right-0 mx-2 mb-1 bg-slate-900 border border-slate-800 rounded-lg shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="text-sm font-medium text-white">{user?.name}</div>
                <div className="text-xs text-slate-400">{user?.email}</div>
              </div>
              <button onClick={() => navigate('/profile')} className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/40">Profile</button>
              <button onClick={() => navigate('/account')} className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-800/40">Account settings</button>
              <div className="border-t border-slate-800 mt-1">
                <button onClick={() => { signOut(); navigate('/login') }} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50/5">Sign out</button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-14 w-6 h-6 bg-slate-800/60 border border-slate-700 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-800/60 transition-colors z-10"
        >
          <svg className={`w-3 h-3 text-slate-400 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </aside>
  )
}
