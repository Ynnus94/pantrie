import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { CalendarExport } from '../CalendarExport'
import { PostMealRating } from '../PostMealRating'
import { getMealPlans } from '../../lib/api'
import { useMealPlan } from '../../context/MealPlanContext'
import { Calendar, Clock, Utensils, ChefHat, Zap, Loader2, Sparkles, Star, Flame } from 'lucide-react'
import { toast } from 'sonner'

// Helper function to get meal image URL
function getMealImageUrl(mealName: string, cuisine?: string): string {
  const searchTerm = encodeURIComponent(`${mealName} ${cuisine || 'food'}`)
  return `https://source.unsplash.com/600x400/?${searchTerm},food,dish`
}

function getDayName(index: number) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  return days[index]
}

function getCurrentWeekStart(): string {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // If Sunday, go back 6 days; otherwise go to Monday
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().split('T')[0]
}

interface ThisWeekMealsPageProps {
  onNavigate?: (page: string) => void
}

export function ThisWeekMealsPage({ onNavigate }: ThisWeekMealsPageProps = {}) {
  const { currentMealPlan } = useMealPlan()
  const [loading, setLoading] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [ratingMeal, setRatingMeal] = useState<any>(null)

  const familyMembers = [
    { id: 1, name: 'Sunny' },
    { id: 2, name: 'Audrey' },
    { id: 3, name: 'Daughter' }
  ]


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const handleRateComplete = (data: any) => {
    console.log('Rating submitted:', data)
    toast.success(data.saveToLibrary ? 'Meal rated and saved to library!' : 'Meal rated successfully!')
    setShowRating(false)
    setRatingMeal(null)
    // TODO: Save to database
  }

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!currentMealPlan || !currentMealPlan.meals || currentMealPlan.meals.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#16250F] mb-2">This Week's Meals</h1>
          <p className="text-[#16250F]/70">
            {new Date().toLocaleDateString('en-US', { 
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        
        <Card className="border border-[#16250F]/10">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="p-4 bg-[#16250F] rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-[#F5F1E8]" />
            </div>
            <h3 className="text-2xl font-bold text-[#16250F] mb-3">No Meal Plan Yet</h3>
            <p className="text-[#16250F]/70 mb-6 max-w-md mx-auto">
              Let AI create a personalized weekly meal plan tailored to your family's preferences
            </p>
            <Button 
              size="lg"
              onClick={() => {
                if (onNavigate) {
                  onNavigate('planning')
                }
              }}
              className="gap-2 bg-[#FF9500] hover:bg-[#FF8500] text-white font-semibold shadow-lg"
            >
              <Sparkles className="h-5 w-5" />
              Generate This Week's Meals
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#16250F] mb-2">This Week's Meals</h1>
          <p className="text-[#16250F]/70">
            Week of {new Date(currentMealPlan.weekStarting).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <CalendarExport mealPlan={{
            weekStarting: currentMealPlan.weekStarting,
            meals: currentMealPlan.meals,
            grocery_list: currentMealPlan.grocery_list || [],
            weekSummary: currentMealPlan.weekSummary || { totalEstimatedCost: 0 }
          }} />
        </div>
      </div>

      {/* Week Summary */}
      <Card className="border border-[#16250F]/10 bg-gradient-to-br from-[#16250F] to-[#1a2f12] text-[#F5F1E8]">
        <CardHeader className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-[#F5F1E8] mb-2">
                Week Summary
              </CardTitle>
              <CardDescription className="text-[#F5F1E8]/80">
                {currentMealPlan.weekSummary?.cuisines?.join(', ') || 'Variety of cuisines'}
              </CardDescription>
            </div>
            <div className="text-center bg-[#F5F1E8]/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#F5F1E8]/20">
              <div className="text-sm text-[#F5F1E8]/90 mb-1">Estimated Cost</div>
              <div className="text-2xl font-bold text-[#F5F1E8]">
                ${currentMealPlan.weekSummary?.totalEstimatedCost?.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-[#F5F1E8]/70">CAD</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Meals */}
      <div className="space-y-4">
        {currentMealPlan.meals?.map((meal: any, index: number) => (
          <Card 
            key={index}
            className={`border-2 ${
              meal.isOfficeDayMeal 
                ? 'border-blue-200 bg-gradient-to-br from-blue-50/80 to-white' 
                : 'border-[#16250F]/10 bg-gradient-to-br from-white to-[#F5F1E8]/30'
            } card-hover`}
          >
            <CardContent className="p-6">
              <div className="grid md:grid-cols-[280px_1fr] gap-6">
                {/* Meal Image */}
                <div className="relative group">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-[#16250F]/10 to-[#FF9500]/10 relative shadow-lg">
                    <img
                      src={getMealImageUrl(meal.name, meal.cuisine)}
                      alt={meal.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80`
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      {meal.isOfficeDayMeal && (
                        <Badge className="bg-blue-500/90 text-white border-0 backdrop-blur-sm shadow-md">
                          <Zap className="h-3 w-3 mr-1" />
                          Quick
                        </Badge>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      {meal.cuisine && (
                        <Badge className="bg-[#16250F]/80 text-white border-0 backdrop-blur-sm">
                          {meal.cuisine}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meal Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      meal.isOfficeDayMeal 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'bg-[#16250F] text-[#F5F1E8]'
                    }`}>
                      <ChefHat className="h-5 w-5" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                      {getDayName(index)}: {meal.name}
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-4 leading-relaxed">{meal.description}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#16250F]" />
                      <span className="font-medium">{meal.cookTime} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-[#16250F]" />
                      <span className="font-medium">{meal.ingredients?.length || 0} ingredients</span>
                    </div>
                  </div>
                  {meal.toddlerModification && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">👶 Toddler Modification:</span> {meal.toddlerModification}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post-Meal Rating */}
      {showRating && ratingMeal && (
        <div className="mt-6">
          <PostMealRating
            meal={ratingMeal}
            mealName={ratingMeal.name || 'Meal'}
            mealDate={new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}
            familyMembers={familyMembers}
            onComplete={handleRateComplete}
          />
        </div>
      )}

      {/* Rate Last Meal Button */}
      {!showRating && currentMealPlan.meals && currentMealPlan.meals.length > 0 && (
        <Card className="border-2 border-dashed border-[#FF9500]/30 bg-gradient-to-br from-[#FF9500]/5 to-white">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#16250F] mb-1">How was your meal?</h3>
                <p className="text-sm text-[#16250F]/70">
                  Rate your last meal and help us learn what your family loves
                </p>
              </div>
              <Button 
                className="gap-2 bg-[#FF9500] hover:bg-[#FF8500] text-white"
                onClick={() => {
                  // Pass the full meal object, not just the name
                  setRatingMeal(currentMealPlan.meals[0])
                  setShowRating(true)
                }}
              >
                <Star className="h-4 w-4" />
                Rate Last Meal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

