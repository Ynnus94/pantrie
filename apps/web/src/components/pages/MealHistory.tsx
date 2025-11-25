import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Calendar, Star, BookmarkPlus, Search, Filter } from 'lucide-react'

interface MealHistoryProps {
  onNavigate?: (page: string) => void
}

export function MealHistory({ onNavigate }: MealHistoryProps) {
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

  // Use real data if available, otherwise show sample data
  const displayHistory = mealHistory.length > 0 ? mealHistory : sampleHistory

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Meal History</h1>
        <p className="text-primary/70">
          Your complete family meal diary
        </p>
      </div>

      {/* Filters */}
      <Card className="border border-[#16250F]/10">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-primary/50" />
              <Input 
                placeholder="Search meals..." 
                className="pl-10 border-[#16250F]/10 focus-visible:ring-[#FF9500]"
              />
            </div>
            <Button variant="outline" className="gap-2 border-[#16250F]/20 hover:border-[#FF9500]">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2 border-[#16250F]/20 hover:border-[#FF9500]">
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      {displayHistory.length === 0 ? (
        <Card className="border border-[#16250F]/10 shadow-xl bg-gradient-to-br from-white to-[#F5F1E8]/30">
          <CardContent className="text-center py-12">
            <div className="p-4 bg-[#16250F] rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-[#F5F1E8]" />
            </div>
            <h3 className="text-xl font-semibold text-primary mb-2">No meal history yet</h3>
            <p className="text-primary/70">
              Start cooking meals and they'll appear here automatically!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">This Week (Nov 25-31)</h2>
          
          {mealHistory.map((meal) => (
            <Card key={meal.id} className="hover:shadow-lg transition-shadow border border-[#16250F]/10 bg-gradient-to-br from-white to-[#F5F1E8]/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  {/* Left side - Meal info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium text-primary/70">
                        {new Date(meal.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      {meal.inLibrary && (
                        <Badge variant="secondary" className="gap-1 bg-[#16250F] text-[#F5F1E8]">
                          <BookmarkPlus className="h-3 w-3" />
                          In Library
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-semibold text-primary mb-2">
                      {meal.mealName}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-primary/70 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-[#FF9500] text-[#FF9500]" />
                    <span className="font-medium">{meal.average_rating || meal.averageRating}</span>
                  </div>
                  <span>Made {meal.times_made || meal.timesMade || 1} {(meal.times_made || meal.timesMade || 1) === 1 ? 'time' : 'times'}</span>
                    </div>
                    
                    {meal.notes && (
                      <p className="text-sm text-primary/70 italic">
                        "{meal.notes}"
                      </p>
                    )}
                  </div>
                  
                  {/* Right side - Actions */}
                  <div className="flex flex-col gap-2">
                    <Button variant="outline" size="sm" className="border-[#16250F]/20 hover:border-[#FF9500]">
                    View Recipe
                  </Button>
                  
                  {!(meal.saved_to_library || meal.inLibrary) && (meal.average_rating || meal.averageRating) >= 3.0 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-2 border-[#16250F]/20 hover:border-[#FF9500]"
                        onClick={() => handleSaveToLibrary(meal.id)}
                      >
                        <BookmarkPlus className="h-4 w-4" />
                        Save to Library
                      </Button>
                    )}
                    
                    <Button variant="ghost" size="sm" className="hover:bg-[#F5F1E8]">
                      Add to This Week
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats Card */}
      <Card className="bg-gradient-to-br from-[#FF9500]/10 to-white border-[#FF9500]/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg text-primary">📊 Your Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {mealHistory.length}
              </div>
              <div className="text-xs text-primary/70">Meals Cooked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {mealHistory.filter(m => m.inLibrary).length}
              </div>
              <div className="text-xs text-primary/70">Saved Favorites</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {(mealHistory.reduce((sum, m) => sum + m.averageRating, 0) / mealHistory.length).toFixed(1)}★
              </div>
              <div className="text-xs text-primary/70">Avg Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

