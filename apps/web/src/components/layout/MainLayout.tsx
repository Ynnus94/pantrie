import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

interface MainLayoutProps {
  children: ReactNode
  currentPage: string
  onNavigate: (page: string) => void
}

export function MainLayout({ children, currentPage, onNavigate }: MainLayoutProps) {
  return (
    <div className="min-h-screen relative">
      {/* Sidebar - Fixed */}
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
      
      {/* Main Content Area - Offset for sidebar */}
      <div className="ml-64">
        {/* Header - Fixed */}
        <Header />
        
        {/* Page Content - Scrollable */}
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  )
}

