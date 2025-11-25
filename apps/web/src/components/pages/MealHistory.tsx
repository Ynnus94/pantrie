import { useState } from 'react'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { GlassCard } from '../ui/GlassCard'
import { Calendar, Star, BookmarkPlus, Search, Filter } from 'lucide-react'

interface MealHistoryProps {
  onNavigate?: (page: string) => void
}

export function MealHistory({ onNavigate }: MealHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  
  // TODO: Load actual meal history from API/state
  const mealHistory = [
    {
      id: 1,
      date: '2024-11-25',
      dayOfWeek: 'Monday',
      mealName: 'Honey Garlic Salmon',
      averageRating: 4.8,
      inLibrary: true,
      timesMade: 3,
      notes: 'Everyone loved it! Daughter ate two servings'
    },
    {
      id: 2,
      date: '2024-11-26',
      dayOfWeek: 'Tuesday',
      mealName: 'Korean Beef Tacos',
      averageRating: 3.2,
      inLibrary: false,
      timesMade: 1,
      notes: 'Good but a bit spicy for Audrey'
    },
    {
      id: 3,
      date: '2024-11-27',
      dayOfWeek: 'Wednesday',
      mealName: 'Fish Sticks',
      averageRating: 2.0,
      inLibrary: false,
      timesMade: 1,
      notes: 'Not a hit with anyone'
    }
  ]

  const handleSaveToLibrary = (mealId: number) => {
    // TODO: Implement save to library
    console.log('Save meal to library:', mealId)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Meal History</h1>
        <p className="text-secondary">
          Your complete family meal diary
        </p>
      </div>

      {/* Filters */}
      <GlassCard hover={false}>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
            <Input 
              placeholder="Search meals..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 glass-input"
            />
          </div>
          <Button variant="glass" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="glass" className="gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Button>
        </div>
      </GlassCard>

      {/* History List */}
      {mealHistory.length === 0 ? (
        <GlassCard hover={false} className="border-2 border-dashed border-[var(--border-glass)]">
          <div className="text-center py-12">
            <div className="p-4 bg-[var(--bg-glass-strong)] border-2 border-[var(--accent-primary)] rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-[var(--accent-primary)]" />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">No meal history yet</h3>
            <p className="text-secondary">
              Start cooking meals and they'll appear here automatically!
            </p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">This Week (Nov 25-31)</h2>
          
          {mealHistory.map((meal) => (
            <GlassCard key={meal.id}>
              <div className="flex items-start justify-between gap-4">
                {/* Left side - Meal info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-muted">
                      {new Date(meal.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                    {meal.inLibrary && (
                      <Badge className="gap-1 glass-badge-accent">
                        <BookmarkPlus className="h-3 w-3" />
                        In Library
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-semibold text-primary mb-2">
                    {meal.mealName}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-muted mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-[var(--accent-primary)] text-[var(--accent-primary)]" />
                      <span className="font-medium text-primary">{meal.averageRating}</span>
                    </div>
                    <span>Made {meal.timesMade} {meal.timesMade === 1 ? 'time' : 'times'}</span>
                  </div>
                  
                  {meal.notes && (
                    <p className="text-sm text-muted italic">
                      "{meal.notes}"
                    </p>
                  )}
                </div>
                
                {/* Right side - Actions */}
                <div className="flex flex-col gap-2">
                  <Button variant="glass" size="sm">
                    View Recipe
                  </Button>
                  
                  {!meal.inLibrary && meal.averageRating >= 3.0 && (
                    <Button 
                      variant="glass" 
                      size="sm"
                      className="gap-2"
                      onClick={() => handleSaveToLibrary(meal.id)}
                    >
                      <BookmarkPlus className="h-4 w-4" />
                      Save to Library
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm" className="text-secondary hover:text-primary">
                    Add to This Week
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Stats Card */}
      <GlassCard hover={false} className="week-summary-card">
        <h3 className="text-lg font-semibold text-primary mb-4">📊 Your Stats</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-[var(--bg-glass-light)]">
            <div className="text-2xl font-bold text-primary">
              {mealHistory.length}
            </div>
            <div className="text-xs text-muted">Meals Cooked</div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-glass-light)]">
            <div className="text-2xl font-bold text-primary">
              {mealHistory.filter(m => m.inLibrary).length}
            </div>
            <div className="text-xs text-muted">Saved Favorites</div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--bg-glass-light)]">
            <div className="text-2xl font-bold text-[var(--accent-primary)]">
              {(mealHistory.reduce((sum, m) => sum + m.averageRating, 0) / mealHistory.length).toFixed(1)}★
            </div>
            <div className="text-xs text-muted">Avg Rating</div>
          </div>
        </div>
      </GlassCard>
    </div>
  )
}
