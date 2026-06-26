import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/roadmap', icon: 'alt_route', label: 'Career Roadmap' },
  { to: '/interview', icon: 'videocam', label: 'Mock Interviews' },
  { to: '/analyzer', icon: 'description', label: 'Resume Analyzer' },
  { to: '/history', icon: 'history', label: 'History' },
  { to: '/profile', icon: 'person', label: 'Profile' },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="hidden md:flex flex-col bg-surface h-screen w-64 border-r border-outline-variant shadow-md p-stack-md gap-stack-sm z-40 shrink-0 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center gap-stack-sm mb-stack-lg px-2 pt-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-on-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </div>
        <div>
          <h1 className="font-headline-md text-[18px] leading-tight font-bold text-primary tracking-tight">PrepMate AI</h1>
          <p className="font-label-md text-[12px] text-on-surface-variant uppercase tracking-wider">Career Readiness</p>
        </div>
      </div>

      {/* Primary Action */}
      <button
        onClick={() => navigate('/interview')}
        className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg flex items-center justify-center gap-2 mb-stack-md hover:scale-[0.98] transition-all duration-200 ease-in-out shadow-sm active:scale-95"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        Start New Session
      </button>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-in-out font-label-md text-label-md group',
                isActive
                  ? 'bg-primary-container text-on-primary-container shadow-sm scale-[0.98]'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-primary'
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn("material-symbols-outlined transition-colors", isActive ? "text-primary" : "group-hover:text-primary")}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                  {icon}
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ease-in-out font-label-md text-label-md group mt-4 pt-4 border-t border-outline-variant/30',
                isActive
                  ? 'bg-error-container text-on-error-container shadow-sm scale-[0.98]'
                  : 'text-on-surface-variant hover:bg-error-container/20 hover:text-error'
              )
            }
          >
            <span className="material-symbols-outlined">shield</span>
            Admin Panel
          </NavLink>
        )}
      </nav>

      {/* User Footer */}
      <div className="mt-auto pt-stack-md border-t border-outline-variant/50 space-y-1">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-surface-container-high transition-all duration-200 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0 shadow-sm border border-primary/20">
            <span className="text-primary font-bold text-xs">
              {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label-md text-[13px] font-bold text-on-surface truncate leading-tight">
              {user?.name || 'User'}
            </p>
            <p className="font-body-sm text-[11px] text-on-surface-variant truncate">
              {user?.email || 'Logged in'}
            </p>
          </div>
        </div>

        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all duration-200 font-label-md text-label-md"
        >
          <span className="material-symbols-outlined text-[20px]">{dark ? 'light_mode' : 'dark_mode'}</span>
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-on-surface-variant hover:bg-error-container/10 hover:text-error transition-all duration-200 font-label-md text-label-md"
        >
          <span className="material-symbols-outlined text-[20px]">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
