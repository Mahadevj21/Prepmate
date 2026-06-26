import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 border-b border-white/5 bg-surface/70 backdrop-blur-xl transition-all duration-300">
      <div className="max-w-container-max mx-auto h-full flex items-center justify-between px-margin-mobile md:px-margin-desktop">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <span className="material-symbols-outlined text-on-primary text-[22px]">auto_awesome</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-on-surface">PrepMate</span>
        </Link>

        {/* Links */}
        <nav className="hidden lg:flex items-center gap-10">
          {['Features', 'Intelligence', 'Community', 'Docs'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-label-md font-label-md text-on-surface-variant/70 hover:text-primary transition-all duration-200 tracking-wide uppercase"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="hidden sm:block text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-all px-4 py-2"
              >
                Go to App
              </button>
              <button
                onClick={handleLogout}
                className="bg-surface-container-low text-on-surface border border-outline-variant/50 px-6 py-2.5 rounded-xl text-label-md font-label-md shadow-sm hover:bg-surface-container-high transition-all"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:block text-label-md font-label-md text-on-surface-variant hover:text-on-surface transition-all px-4 py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-primary text-on-primary px-6 py-2.5 rounded-xl text-label-md font-label-md shadow-lg shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all"
              >
                Start Free
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
