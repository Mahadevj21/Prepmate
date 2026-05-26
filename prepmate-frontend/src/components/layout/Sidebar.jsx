import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Mic,
  BarChart2,
  Clock,
  User,
  LogOut,
  Sparkles,
  ChevronRight,
  Shield,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/interview', icon: Mic,             label: 'Mock Interview' },
  { to: '/results',   icon: BarChart2,        label: 'Results'   },
  { to: '/history',   icon: Clock,            label: 'History'   },
  { to: '/profile',   icon: User,             label: 'Profile'   },
]

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="flex flex-col w-[220px] min-h-screen bg-[#0d0d0f] border-r border-[#1f1f22] flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-14 border-b border-[#1f1f22]">
        <div className="w-6 h-6 rounded-md bg-[#7c6af7] flex items-center justify-center flex-shrink-0">
          <Sparkles size={13} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-[#fafafa] tracking-tight">PrepMate</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2.5 flex flex-col gap-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-[7px] text-sm transition-all duration-150 group',
                isActive
                  ? 'bg-[#7c6af7]/15 text-[#9585f8] font-medium'
                  : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#18181b]',
              )
            }
          >
            <Icon size={15} className="flex-shrink-0" />
            {label}
          </NavLink>
        ))}

        {user?.role === 'ADMIN' && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-[7px] text-sm transition-all duration-150 group mt-4 pt-4 border-t border-[#1f1f22]',
                isActive
                  ? 'bg-[#7c6af7]/15 text-[#9585f8] font-medium'
                  : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#18181b]',
              )
            }
          >
            <Shield size={15} className="flex-shrink-0 text-[#7c6af7]" />
            Admin Panel
          </NavLink>
        )}
      </nav>

      {/* User Footer */}
      <div className="border-t border-[#1f1f22] p-2.5">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[7px] hover:bg-[#18181b] transition-colors cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-[#27272a] flex items-center justify-center flex-shrink-0 text-xs font-semibold text-[#a1a1aa]">
            {user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-medium text-[#fafafa] truncate leading-none mb-0.5">
              {user?.name || 'User'}
            </p>
            <p className="text-[11px] text-[#52525b] truncate leading-none">
              {user?.email || ''}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-[7px] text-sm text-[#71717a] hover:text-[#ef4444] hover:bg-[#ef444408] transition-all duration-150 mt-0.5"
        >
          <LogOut size={14} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
