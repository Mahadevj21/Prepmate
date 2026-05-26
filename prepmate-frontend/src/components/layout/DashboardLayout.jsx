import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
