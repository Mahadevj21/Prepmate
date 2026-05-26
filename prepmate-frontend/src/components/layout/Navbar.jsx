import { Link, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/Button'

export function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-[#1f1f22] bg-[#0a0a0b]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto h-full flex items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-6 h-6 rounded-md bg-[#7c6af7] flex items-center justify-center">
            <Sparkles size={13} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-[#fafafa] tracking-tight">PrepMate</span>
        </Link>

        {/* Links */}
        <nav className="hidden md:flex items-center gap-6">
          {['Features', 'Pricing', 'Docs'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm text-[#71717a] hover:text-[#fafafa] transition-colors duration-150"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button variant="secondary" size="sm" onClick={handleLogout}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign in
              </Button>
              <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
