import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'

import { LandingPage }   from './pages/LandingPage'
import { LoginPage }     from './pages/LoginPage'
import { RegisterPage }  from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { InterviewPage } from './pages/InterviewPage'
import { ResultsPage }   from './pages/ResultsPage'
import { HistoryPage }   from './pages/HistoryPage'
import { ProfilePage }   from './pages/ProfilePage'
import { AdminPage }     from './pages/AdminPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — all share the sidebar layout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/interview" element={<InterviewPage />} />
          <Route path="/results"   element={<ResultsPage />} />
          <Route path="/results/:sessionId" element={<ResultsPage />} />
          <Route path="/history"   element={<HistoryPage />} />
          <Route path="/profile"   element={<ProfilePage />} />
          <Route path="/admin"     element={<AdminPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
