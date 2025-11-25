import { Search, Bell, User } from 'lucide-react'

export function Header() {
  return (
    <header 
      className="h-16 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-30 border-b border-[rgba(0,0,0,0.08)]"
      style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        boxShadow: '0 1px 8px rgba(0, 0, 0, 0.04)'
      }}
    >
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#737373]" />
          <input 
            type="text"
            placeholder="Search recipes, meals, ingredients..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-[#1a1a1a] placeholder:text-[#a3a3a3] border border-[rgba(0,0,0,0.1)] transition-all duration-200 focus:outline-none focus:border-[#D4A574] focus:ring-[3px] focus:ring-[rgba(212,165,116,0.1)]"
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.75)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.6)'
            }}
          />
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        <button 
          className="p-2.5 rounded-xl relative border border-[rgba(0,0,0,0.08)] text-[#4a4a4a] transition-all duration-200 hover:bg-white/75 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#D4A574] rounded-full border-2 border-white"></span>
        </button>
        
        <button 
          className="p-2.5 rounded-xl border border-[rgba(0,0,0,0.08)] text-[#4a4a4a] transition-all duration-200 hover:bg-white/75 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          style={{
            background: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
        >
          <User className="h-5 w-5" />
        </button>
      </div>
    </header>
  )
}
