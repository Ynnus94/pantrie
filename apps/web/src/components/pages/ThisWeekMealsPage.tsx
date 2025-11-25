import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Skeleton } from '../ui/skeleton'
import { GlassCard } from '../ui/GlassCard'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu'
import { CalendarExport } from '../CalendarExport'
import { PostMealRating } from '../PostMealRating'
import { RecipePlaceholder } from '../RecipePlaceholder'
import { ReplaceMealModal } from '../ReplaceMealModal'
import { MealPlanGeneratorModal } from '../modals/MealPlanGeneratorModal'
import { getMealPlans } from '../../lib/api'
import { useMealPlan } from '../../context/MealPlanContext'
import { 
  Calendar, Clock, Utensils, ChefHat, Zap, Loader2, Sparkles, Star, Flame,
  MoreVertical, Eye, RefreshCw, Check, Trash2, MessageSquare, BookOpen,
  AlertCircle, CheckCircle2, Plus
} from 'lucide-react'
import { toast } from 'sonner'

// All 7 days of the week
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Helper function to get meal image URL
function getMealImageUrl(mealName: string, cuisine?: string): string {
  const searchTerm = encodeURIComponent(`${mealName} ${cuisine || 'food'}`)
  return `https://source.unsplash.com/600x400/?${searchTerm},food,dish`
}

function getDayName(index: number) {
  return DAYS_OF_WEEK[index]
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
  const { currentMealPlan, setCurrentMealPlan, clearMealPlan } = useMealPlan()
  const [loading, setLoading] = useState(false)
  const [showRating, setShowRating] = useState(false)
  const [ratingMeal, setRatingMeal] = useState<any>(null)
  const [replacingMeal, setReplacingMeal] = useState<any>(null)
  const [cookedMeals, setCookedMeals] = useState<Set<string>>(new Set())
  const [ratedMeals, setRatedMeals] = useState<Record<string, number>>({})
  const [showGenerateModal, setShowGenerateModal] = useState(false)

  const familyMembers = [
    { id: 1, name: 'Sunny' },
    { id: 2, name: 'Audrey' },
    { id: 3, name: 'Daughter' }
  ]

  // Load cooked/rated status from localStorage
  useEffect(() => {
    const savedCooked = localStorage.getItem('cookedMeals')
    const savedRated = localStorage.getItem('ratedMeals')
    if (savedCooked) setCookedMeals(new Set(JSON.parse(savedCooked)))
    if (savedRated) setRatedMeals(JSON.parse(savedRated))
  }, [])

  // Save cooked/rated status to localStorage
  useEffect(() => {
    localStorage.setItem('cookedMeals', JSON.stringify([...cookedMeals]))
    localStorage.setItem('ratedMeals', JSON.stringify(ratedMeals))
  }, [cookedMeals, ratedMeals])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Calculate progress
  const totalMeals = currentMealPlan?.meals?.length || 0
  const cookedCount = currentMealPlan?.meals?.filter((m: any) => cookedMeals.has(m.id))?.length || 0

  // ============ ACTION HANDLERS ============

  const handleClearAll = () => {
    if (!confirm('Clear all meals this week? You can add meals from your Recipe Library or regenerate.')) {
      return
    }
    clearMealPlan()
    setCookedMeals(new Set())
    setRatedMeals({})
    toast.success('Week cleared! Ready for a fresh start.', {
      description: 'Generate a new plan or add meals from your library.'
    })
  }

  const handleRegenerateWeek = () => {
    if (currentMealPlan && currentMealPlan.meals.length > 0) {
      if (!confirm('Generate a new meal plan? Your current plan will be replaced.')) {
        return
      }
    }
    setShowGenerateModal(true)
  }

  const handleRemoveMeal = (meal: any) => {
    if (!confirm(`Remove "${meal.name}" from ${meal.dayOfWeek || 'this day'}?`)) {
      return
    }

    const updatedMeals = currentMealPlan!.meals.filter((m: any) => m.id !== meal.id)
    setCurrentMealPlan({
      ...currentMealPlan!,
      meals: updatedMeals
    })

    // Remove from cooked/rated tracking
    const newCooked = new Set(cookedMeals)
    newCooked.delete(meal.id)
    setCookedMeals(newCooked)

    const newRated = { ...ratedMeals }
    delete newRated[meal.id]
    setRatedMeals(newRated)

    toast.success(`Removed "${meal.name}"`, {
      description: 'You can add a new meal or leave the slot empty.'
    })
  }

  const handleMarkCooked = (meal: any) => {
    const newCooked = new Set(cookedMeals)
    if (cookedMeals.has(meal.id)) {
      newCooked.delete(meal.id)
      toast.info(`Unmarked "${meal.name}" as cooked`)
    } else {
      newCooked.add(meal.id)
      toast.success(`"${meal.name}" marked as cooked! 🍳`, {
        description: 'Rate this meal to help us learn your preferences.'
      })
    }
    setCookedMeals(newCooked)
  }

  const handleRateMeal = (meal: any) => {
    setRatingMeal(meal)
    setShowRating(true)
  }

  const handleRateComplete = (data: any) => {
    if (ratingMeal) {
      // Mark as cooked if not already
      const newCooked = new Set(cookedMeals)
      newCooked.add(ratingMeal.id)
      setCookedMeals(newCooked)

      // Save rating
      const avgRating = Object.values(data.ratings).reduce((a: number, b: any) => a + b, 0) / Object.keys(data.ratings).length
      setRatedMeals(prev => ({ ...prev, [ratingMeal.id]: avgRating }))

      toast.success(data.saveToLibrary ? 'Meal rated and saved to library!' : 'Meal rated successfully!', {
        description: `Average rating: ${avgRating.toFixed(1)} stars`
      })
    }
    setShowRating(false)
    setRatingMeal(null)
  }

  const handleReplaceMeal = (meal: any) => {
    setReplacingMeal(meal)
  }

  const handleReplaceComplete = (newMeal: any) => {
    if (replacingMeal && currentMealPlan) {
      const updatedMeals = currentMealPlan.meals.map((m: any) => 
        m.id === replacingMeal.id 
          ? { ...newMeal, id: replacingMeal.id, dayOfWeek: replacingMeal.dayOfWeek, day: replacingMeal.day }
          : m
      )
      setCurrentMealPlan({
        ...currentMealPlan,
        meals: updatedMeals
      })
      toast.success(`Replaced with "${newMeal.name}"!`)
    }
    setReplacingMeal(null)
  }

  const handleViewRecipe = (meal: any) => {
    // For now, show a toast with recipe details
    // In a full implementation, this would navigate to a recipe detail page
    toast.info(`Recipe: ${meal.name}`, {
      description: `${meal.ingredients?.length || 0} ingredients • ${meal.cookTime} min`,
      duration: 5000
    })
  }

  const handleAddMealToDay = (dayIndex: number) => {
    // Navigate to recipes page or show a modal to add meal
    toast.info(`Adding meal for ${getDayName(dayIndex)}`, {
      description: 'This feature coming soon! Navigate to Recipes to add.'
    })
    if (onNavigate) {
      onNavigate('recipes')
    }
  }

  const handleGenerateSingleMeal = (dayIndex: number) => {
    toast.info(`Generating meal for ${getDayName(dayIndex)}`, {
      description: 'This feature coming soon!'
    })
  }

  // ============ LOADING STATE ============

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

  // ============ EMPTY STATE ============

  if (!currentMealPlan || !currentMealPlan.meals || currentMealPlan.meals.length === 0) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">This Week's Meals</h1>
          <p className="text-[#4a4a4a]">
            {new Date().toLocaleDateString('en-US', { 
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        
        <GlassCard hover={false} className="border-2 border-dashed border-white/50 max-w-2xl mx-auto">
          <div className="py-12 text-center">
            <div className="p-6 bg-gradient-to-br from-honey to-honey-dark rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg animate-float">
              <Calendar className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#1a1a1a] mb-3">Ready to plan your week?</h3>
            <p className="text-[#4a4a4a] mb-8 max-w-md mx-auto">
              Generate a personalized weekly meal plan based on your family's preferences, schedule, and budget.
            </p>
            
            <div className="space-y-4">
              <Button 
                size="lg"
                onClick={() => setShowGenerateModal(true)}
                className="gap-2 min-w-[240px]"
              >
                <Sparkles className="h-5 w-5" />
                Generate Meal Plan
              </Button>
              
              <p className="text-xs text-[#737373]">
                Takes about 30 seconds • Based on your family profiles
              </p>
            </div>
            
            {/* Alternative actions */}
            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-sm text-[#737373] mb-3">Or add meals manually</p>
              <div className="flex gap-2 justify-center flex-wrap">
                <Button 
                  variant="glass" 
                  size="sm"
                  onClick={() => onNavigate && onNavigate('recipes')}
                  className="gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Add from Library
                </Button>
                <Button 
                  variant="glass" 
                  size="sm"
                  className="gap-2"
                  onClick={() => toast.info('Custom meal entry coming soon!')}
                >
                  <Plus className="h-4 w-4" />
                  Add Custom Meal
                </Button>
              </div>
            </div>
          </div>
        </GlassCard>
        
        {/* Generate Modal */}
        <MealPlanGeneratorModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
        />
      </div>
    )
  }

  // ============ MAIN VIEW WITH MEALS ============

  // Get meals by day index for displaying
  const getMealForDay = (dayIndex: number) => {
    return currentMealPlan.meals.find((m: any, i: number) => i === dayIndex)
  }

  return (
    <div className="p-8 space-y-6">
      {/* ============ HEADER ACTION BAR ============ */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">This Week's Meals</h1>
          <p className="text-[#4a4a4a]">
            Week of {new Date(currentMealPlan.weekStarting).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <CalendarExport mealPlan={{
            weekStarting: currentMealPlan.weekStarting,
            meals: currentMealPlan.meals,
            grocery_list: currentMealPlan.grocery_list || [],
            weekSummary: currentMealPlan.weekSummary || { totalEstimatedCost: 0 }
          }} />
          
          <Button 
            variant="glass" 
            className="gap-2"
            onClick={() => toast.info('Quick Fix AI Chat coming soon!', { description: 'Ask AI to modify your meal plan.' })}
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Quick Fix</span>
          </Button>
          
          <Button 
            variant="glass" 
            className="gap-2"
            onClick={handleRegenerateWeek}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Regenerate</span>
          </Button>
          
          <Button 
            variant="glass"
            className="gap-2 text-red-600 hover:text-red-700"
            onClick={handleClearAll}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear All</span>
          </Button>
        </div>
      </div>

      {/* ============ WEEK SUMMARY ============ */}
      <GlassCard hover={false} className="bg-gradient-to-br from-honey/90 to-honey-dark/90 text-white border-honey/30">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">
              Week Summary
            </h2>
            <p className="text-white/80 mb-4">
              {currentMealPlan.weekSummary?.cuisines?.join(', ') || 'Variety of cuisines'}
            </p>
            
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/90">Progress</span>
                <span className="text-white font-medium">{cookedCount}/{totalMeals} meals cooked</span>
              </div>
              <div className="flex gap-1.5">
                {DAYS_OF_WEEK.slice(0, totalMeals).map((_, i) => {
                  const meal = getMealForDay(i)
                  const isCooked = meal && cookedMeals.has(meal.id)
                  return (
                    <div 
                      key={i}
                      className={`h-2.5 flex-1 rounded-full transition-colors ${
                        isCooked 
                          ? 'bg-green-400' 
                          : 'bg-white/20'
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/20">
              <div className="text-sm text-white/90 mb-1">Estimated Cost</div>
              <div className="text-2xl font-bold text-white">
                ${currentMealPlan.weekSummary?.totalEstimatedCost?.toFixed(2) || '0.00'}
              </div>
              <div className="text-xs text-white/70">CAD</div>
            </div>
            
            <Button 
              className="bg-white text-[#A67C52] hover:bg-white/90 gap-2 font-semibold"
              onClick={() => onNavigate && onNavigate('grocery')}
            >
              <Utensils className="h-4 w-4" />
              Shopping List
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* ============ MEALS GRID ============ */}
      <div className="space-y-4">
        {currentMealPlan.meals?.map((meal: any, index: number) => {
          const isCooked = cookedMeals.has(meal.id)
          const rating = ratedMeals[meal.id]
          
          return (
            <GlassCard 
              key={meal.id || index}
              className={`${
                isCooked 
                  ? 'border-green-300/50 bg-green-50/30'
                  : meal.isOfficeDayMeal 
                    ? 'border-blue-300/50 bg-blue-50/30' 
                    : ''
              }`}
            >
              <div className="">
                <div className="grid md:grid-cols-[280px_1fr] gap-6">
                  {/* Meal Image */}
                  <div className="relative group">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-[#16250F]/10 to-[#FF9500]/10 relative shadow-lg">
                      {meal.imageUrl ? (
                        <img
                          src={meal.imageUrl}
                          alt={meal.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <RecipePlaceholder 
                          mealName={meal.name}
                          className="w-full h-full"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      
                      {/* Top badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex gap-2">
                          {isCooked && (
                            <Badge className="bg-green-500/90 text-white border-0 backdrop-blur-sm shadow-md">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Cooked
                            </Badge>
                          )}
                          {rating && (
                            <Badge className="bg-yellow-500/90 text-white border-0 backdrop-blur-sm shadow-md">
                              <Star className="h-3 w-3 mr-1 fill-white" />
                              {rating.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                        {meal.isOfficeDayMeal && !isCooked && (
                          <Badge className="bg-blue-500/90 text-white border-0 backdrop-blur-sm shadow-md">
                            <Zap className="h-3 w-3 mr-1" />
                            Quick
                          </Badge>
                        )}
                      </div>
                      
                      {/* Bottom cuisine badge */}
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
                    {/* Header with title and menu */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`p-2 rounded-xl flex-shrink-0 ${
                          isCooked
                            ? 'bg-green-100 text-green-600'
                            : meal.isOfficeDayMeal 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-[rgba(212,165,116,0.2)] text-[#A67C52]'
                        }`}>
                          <ChefHat className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">
                          {getDayName(index)}: {meal.name}
                        </h3>
                      </div>
                      
                      {/* 3-dot Action Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="glass-button h-8 w-8 rounded-lg flex items-center justify-center shrink-0">
                            <MoreVertical className="h-4 w-4 text-[#1a1a1a]" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewRecipe(meal)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Full Recipe
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleReplaceMeal(meal)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Replace This Meal
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleMarkCooked(meal)}>
                            <Check className="h-4 w-4 mr-2" />
                            {isCooked ? 'Unmark as Cooked' : 'Mark as Cooked'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRateMeal(meal)}>
                            <Star className="h-4 w-4 mr-2" />
                            Rate This Meal
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRemoveMeal(meal)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove from Week
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    
                    <p className="text-[#4a4a4a] mb-4 leading-relaxed">{meal.description}</p>
                    
                    <div className="flex items-center gap-6 text-sm text-[#737373] mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[#C19A6B]" />
                        <span className="font-medium">{meal.cookTime} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-[#C19A6B]" />
                        <span className="font-medium">{meal.ingredients?.length || 0} ingredients</span>
                      </div>
                    </div>
                    
                    {meal.toddlerModification && (
                      <div className="bg-[rgba(212,165,116,0.1)] p-3 rounded-lg border border-[rgba(212,165,116,0.25)] mb-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">👶 Toddler Modification:</span> {meal.toddlerModification}
                        </p>
                      </div>
                    )}
                    
                    {/* Quick Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button 
                        variant="glass" 
                        size="sm"
                        onClick={() => handleViewRecipe(meal)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Recipe
                      </Button>
                      <Button 
                        variant="glass" 
                        size="sm"
                        onClick={() => handleReplaceMeal(meal)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Replace
                      </Button>
                      {!isCooked ? (
                        <Button 
                          size="sm"
                          onClick={() => handleRateMeal(meal)}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Rate
                        </Button>
                      ) : !rating ? (
                        <Button 
                          size="sm"
                          onClick={() => handleRateMeal(meal)}
                        >
                          <Star className="h-4 w-4 mr-1" />
                          Rate
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          )
        })}

        {/* ============ EMPTY SLOT PLACEHOLDERS ============ */}
        {currentMealPlan.meals.length < 7 && (
          Array.from({ length: 7 - currentMealPlan.meals.length }).map((_, i) => {
            const dayIndex = currentMealPlan.meals.length + i
            return (
              <GlassCard key={`empty-${dayIndex}`} hover={false} className="border-2 border-dashed border-white/50">
                <div className="py-6 text-center">
                  <div className="p-4 bg-white/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="h-8 w-8 text-[#737373]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1">{getDayName(dayIndex)}</h3>
                  <p className="text-sm text-[#737373] mb-4">No meal planned</p>
                  <div className="flex gap-2 justify-center">
                    <Button 
                      variant="glass"
                      size="sm"
                      onClick={() => handleAddMealToDay(dayIndex)}
                    >
                      <BookOpen className="h-4 w-4 mr-1" />
                      Add from Library
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleGenerateSingleMeal(dayIndex)}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Generate Meal
                    </Button>
                  </div>
                </div>
              </GlassCard>
            )
          })
        )}
      </div>

      {/* ============ POST-MEAL RATING MODAL ============ */}
      {showRating && ratingMeal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
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
        </div>
      )}

      {/* ============ REPLACE MEAL MODAL ============ */}
      {replacingMeal && (
        <ReplaceMealModal
          meal={replacingMeal}
          isOpen={!!replacingMeal}
          onClose={() => setReplacingMeal(null)}
          onReplace={handleReplaceComplete}
          onNavigateToRecipes={() => onNavigate && onNavigate('recipes')}
        />
      )}

      {/* ============ GENERATE MEAL PLAN MODAL ============ */}
      <MealPlanGeneratorModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
      />
    </div>
  )
}
