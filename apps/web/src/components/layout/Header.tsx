import { Search, Bell, User } from 'lucide-react'
import { Input } from '../ui/input'
import { Button } from '../ui/button'

export function Header() {
  return (
    <header className="h-16 border-b border-[#16250F]/10 bg-gradient-to-b from-white/95 to-[#F5F1E8]/95 backdrop-blur-xl flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-30">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#16250F]/40" />
          <Input 
            placeholder="Search recipes, meals, ingredients..." 
            className="pl-10 border-[#16250F]/20 focus:border-[#FF9500] bg-white/80"
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5 text-[#16250F]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FF9500] rounded-full"></span>
        </Button>
        
        <Button variant="ghost" size="sm">
          <User className="h-5 w-5 text-[#16250F]" />
        </Button>
      </div>
    </header>
  )
}

