import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary selection:text-on-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="lg:hidden flex justify-between items-center w-full px-margin-mobile py-4 bg-surface/80 backdrop-blur-md border-b border-outline-variant sticky top-0 z-50">
          <h1 className="font-headline-md text-headline-lg-mobile font-bold text-primary tracking-tight">PrepMate AI</h1>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>

        <main className="flex-1 flex flex-col h-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
