import { Search, Bell, User } from 'lucide-react'
import { ThemeToggle } from '../ThemeToggle'

export function Header() {
  return (
    <header className="glass-header h-16 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-30">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
          <input 
            type="text"
            placeholder="Search recipes, meals, ingredients..." 
            className="glass-input w-full pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        {/* Notifications */}
        <button className="glass-button p-2.5 rounded-xl relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[var(--accent-primary)] rounded-full border-2 border-[var(--bg-glass-strong)]"></span>
        </button>
        
        {/* User Profile */}
        <button className="glass-button p-2.5 rounded-xl">
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
