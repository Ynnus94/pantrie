import { 
  Home, Users, Utensils, ShoppingCart, 
  Book, TrendingUp, Settings, Zap, Link2, Star, History
} from 'lucide-react'
import { cn } from '../../lib/utils'

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const mainNavItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'family', icon: Users, label: 'Family' },
    { id: 'thisweek', icon: Utensils, label: 'This Week' },
    { id: 'grocery', icon: ShoppingCart, label: 'Grocery' },
    { id: 'recipes', icon: Book, label: 'Recipes' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'insights', icon: TrendingUp, label: 'Insights' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const quickActions = [
    { id: 'thisweek', label: 'Generate Plan', icon: Zap },
    { id: 'recipes', label: 'Save Recipe', icon: Link2 },
    { id: 'rate-meal', label: 'Rate Last Meal', icon: Star },
  ]

  return (
    <aside className="glass-sidebar w-64 flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo Section */}
      <div className="p-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-center">
          <img 
            src="/pantrie_logo.svg" 
            alt="Pantrie" 
            className="h-10 w-auto logo-theme" 
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border border-transparent",
                  isActive 
                    ? "accent-button text-white font-semibold" 
                    : "text-secondary hover:bg-[var(--bg-glass-light)] hover:border-[var(--border-subtle)]"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-muted")} />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Quick Actions */}
      <div className="p-3 border-t border-[var(--border-subtle)]">
        <p className="text-xs font-semibold text-muted px-3 mb-2 uppercase tracking-wider">Quick Actions</p>
        <div className="space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                className="glass-button w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium"
                onClick={() => onNavigate(action.id)}
              >
                <Icon className="h-4 w-4 text-accent" />
                {action.label}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
