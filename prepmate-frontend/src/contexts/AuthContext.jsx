import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('prepmate_token') ?? '')
  const [user, setUser] = useState(() => {
    const email = localStorage.getItem('prepmate_email') ?? ''
    const name = localStorage.getItem('prepmate_name') ?? ''
    const userId = localStorage.getItem('prepmate_userId') ?? ''
    const role = localStorage.getItem('prepmate_role') ?? 'USER'
    return email ? { email, name, userId, role } : null
  })

  const login = useCallback((tokenValue, userData) => {
    setToken(tokenValue)
    setUser(userData)
    localStorage.setItem('prepmate_token', tokenValue)
    localStorage.setItem('prepmate_email', userData.email)
    localStorage.setItem('prepmate_name', userData.name ?? '')
    localStorage.setItem('prepmate_userId', userData.userId ?? '')
    localStorage.setItem('prepmate_role', userData.role ?? 'USER')
  }, [])

  const logout = useCallback(() => {
    setToken('')
    setUser(null)
    localStorage.removeItem('prepmate_token')
    localStorage.removeItem('prepmate_email')
    localStorage.removeItem('prepmate_name')
    localStorage.removeItem('prepmate_userId')
    localStorage.removeItem('prepmate_role')
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
