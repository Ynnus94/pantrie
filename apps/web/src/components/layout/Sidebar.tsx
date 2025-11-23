import { 
  Home, Users, Utensils, ShoppingCart, 
  Book, TrendingUp, Settings, Zap, Link2, Star, History
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

interface SidebarProps {
  currentPage: string
  onNavigate: (page: string) => void
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const mainNavItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard' },
    { id: 'family', icon: Users, label: 'Family' },
    { id: 'thisweek', icon: Utensils, label: 'This Week' },
    { id: 'history', icon: History, label: 'History' },
    { id: 'grocery', icon: ShoppingCart, label: 'Grocery' },
    { id: 'recipes', icon: Book, label: 'Recipes' },
    { id: 'insights', icon: TrendingUp, label: 'Insights' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const quickActions = [
    { id: 'thisweek', label: 'Generate Plan', icon: Zap },
    { id: 'recipes', label: 'Save Recipe', icon: Link2 },
    { id: 'rate-meal', label: 'Rate Last Meal', icon: Star },
  ]

  return (
    <aside className="w-64 border-r border-[#16250F]/10 bg-gradient-to-b from-[#F5F1E8] to-white flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Logo Section */}
      <div className="p-6 border-b border-[#16250F]/10">
        <div className="flex items-center justify-center">
          <img 
            src="/pantrie_logo.svg" 
            alt="Pantrie" 
            className="h-10 w-auto" 
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPage === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-[#16250F] text-[#F5F1E8] shadow-md" 
                    : "text-[#16250F]/70 hover:bg-[#F5F1E8] hover:text-[#16250F]"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Quick Actions */}
      <div className="p-3 border-t border-[#16250F]/10 bg-white/50">
        <p className="text-xs font-semibold text-[#16250F]/60 px-3 mb-2">Quick Actions</p>
        <div className="space-y-2">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className="w-full justify-start border-[#16250F]/20 hover:border-[#FF9500] hover:bg-[#F5F1E8]"
                onClick={() => onNavigate(action.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}

