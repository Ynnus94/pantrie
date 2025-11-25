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
    <aside 
      className="w-64 flex flex-col h-screen fixed left-0 top-0 z-40 border-r border-[rgba(0,0,0,0.08)]"
      style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        boxShadow: '2px 0 16px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-[rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-center">
          <img 
            src="/pantrie_logo.svg" 
            alt="Pantrie" 
            className="h-10 w-auto" 
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
                    ? "text-white font-semibold shadow-lg" 
                    : "text-[#4a4a4a] hover:bg-white/50 hover:border-[rgba(0,0,0,0.05)]"
                )}
                style={isActive ? {
                  background: 'linear-gradient(135deg, #D4A574 0%, #C19A6B 100%)',
                  boxShadow: '0 4px 16px rgba(212, 165, 116, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                } : {}}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-[#737373]")} />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Quick Actions */}
      <div className="p-3 border-t border-[rgba(0,0,0,0.08)]">
        <p className="text-xs font-semibold text-[#737373] px-3 mb-2 uppercase tracking-wider">Quick Actions</p>
        <div className="space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-[#4a4a4a] border border-[rgba(0,0,0,0.08)] transition-all duration-200 hover:bg-white/75 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}
                onClick={() => onNavigate(action.id)}
              >
                <Icon className="h-4 w-4 text-[#C19A6B]" />
                {action.label}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
