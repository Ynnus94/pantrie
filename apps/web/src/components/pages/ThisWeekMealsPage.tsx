import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { CalendarExport } from '../CalendarExport'
import { getMealPlans } from '../../lib/api'
import { Calendar, Clock, Utensils, ChefHat, Zap, Loader2, Sparkles } from 'lucide-react'
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
  const [currentPlan, setCurrentPlan] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentWeekPlan()
  }, [])

  const fetchCurrentWeekPlan = async () => {
    setLoading(true)
    try {
      const plans = await getMealPlans()
      const weekStart = getCurrentWeekStart()
      
      // Find plan for current week
      const plan = plans.find((p: any) => {
        const planDate = new Date(p.week_starting)
        const currentDate = new Date(weekStart)
        return planDate.toISOString().split('T')[0] === currentDate.toISOString().split('T')[0]
      })
      
      setCurrentPlan(plan || null)
    } catch (error: any) {
      console.error('Failed to fetch meal plan:', error)
      toast.error('Failed to load this week\'s meals')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
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

  if (!currentPlan) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#16250F] mb-2">This Week's Meals</h1>
          <p className="text-[#16250F]/70">
            Week of {formatDate(getCurrentWeekStart())}
          </p>
        </div>
        
        <Card className="border border-[#16250F]/10">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="p-4 bg-[#16250F] rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Calendar className="h-10 w-10 text-[#F5F1E8]" />
            </div>
            <h3 className="text-2xl font-bold text-[#16250F] mb-3">No meal plan for this week</h3>
            <p className="text-[#16250F]/70 mb-6 max-w-md mx-auto">
              Generate a meal plan to see your meals for this week!
            </p>
            <Button 
              onClick={() => {
                // Navigate to meal planning page to generate
                if (onNavigate) {
                  onNavigate('planning')
                }
              }}
              className="bg-[#FF9500] hover:bg-[#FF8500] text-white font-semibold"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Meal Plan
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
            Week of {formatDate(currentPlan.week_starting)}
          </p>
        </div>
        <div className="flex gap-2">
          <CalendarExport mealPlan={{
            weekStarting: currentPlan.week_starting,
            meals: currentPlan.meals,
            grocery_list: currentPlan.grocery_list,
            weekSummary: currentPlan.week_summary
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
                {currentPlan.week_summary?.cuisines?.join(', ') || 'Variety of cuisines'}
              </CardDescription>
            </div>
            <div className="text-center bg-[#F5F1E8]/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-[#F5F1E8]/20">
              <div className="text-sm text-[#F5F1E8]/90 mb-1">Estimated Cost</div>
              <div className="text-2xl font-bold text-[#F5F1E8]">
                ${currentPlan.week_summary?.totalEstimatedCost?.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-[#F5F1E8]/70">CAD</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Meals */}
      <div className="space-y-4">
        {currentPlan.meals?.map((meal: any, index: number) => (
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
    </div>
  )
}

