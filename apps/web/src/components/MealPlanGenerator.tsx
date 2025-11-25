import { useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { GlassCard } from './ui/GlassCard'
import { CalendarExport } from './CalendarExport'
import { generateMealPlan, quickFixMealPlan, saveMealPlan } from '../lib/api'
import { useMealPlan } from '../context/MealPlanContext'
import { saveMealPlanToDatabase } from '../lib/mealPlansApi'
import { fetchImagesForMeals } from '../services/imageService'
import { Sparkles, Check, Edit2, Clock, Utensils, ChefHat, DollarSign, Calendar, Zap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Meal {
  name: string
  description: string
  ingredients: string[]
  instructions?: string[]
  cookTime: number
  toddlerModification: string
  isOfficeDayMeal: boolean
  cuisine?: string
  estimatedCost?: number
  imageUrl?: string | null
}

// Helper function to get meal image URL
function getMealImageUrl(mealName: string, cuisine?: string): string {
  const searchTerm = encodeURIComponent(`${mealName} ${cuisine || 'food'}`)
  return `https://source.unsplash.com/600x400/?${searchTerm},food,dish`
}

interface MealPlan {
  weekStarting: string
  meals: Meal[]
  grocery_list: any[]
  weekSummary: {
    totalEstimatedCost: number
    cuisines: string[]
    prepDays?: string[]
  }
}

export function MealPlanGenerator() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [fixRequest, setFixRequest] = useState('')
  const [showQuickFix, setShowQuickFix] = useState(false)
  const [saved, setSaved] = useState(false)
  const { setCurrentMealPlan } = useMealPlan()

  const handleGenerate = async () => {
    setLoading(true)
    setSaved(false)
    toast.loading('Generating your personalized meal plan...', { id: 'generate' })
    try {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() + (1 - weekStart.getDay())) // Next Monday
      const weekStarting = weekStart.toISOString().split('T')[0]
      
      const plan = await generateMealPlan(weekStarting)
      
      // Fetch Unsplash images for all meals
      console.log('🖼️ Fetching Unsplash images for meals...')
      toast.loading('Adding beautiful food photos...', { id: 'generate' })
      const mealsWithImages = await fetchImagesForMeals(
        plan.meals.map((m: Meal) => ({ mealName: m.name, ...m }))
      )
      
      // Update plan with images
      const planWithImages = {
        ...plan,
        meals: mealsWithImages.map((meal, index) => ({
          ...plan.meals[index],
          imageUrl: meal.imageUrl
        }))
      }
      
      setMealPlan(planWithImages)
      toast.success('Meal plan generated with beautiful photos!', { id: 'generate' })
    } catch (error: any) {
      console.error('Failed to generate meal plan:', error)
      toast.error(error.message || 'Failed to generate meal plan. Please try again.', { id: 'generate' })
    } finally {
      setLoading(false)
    }
  }

  const handleQuickFix = async () => {
    if (!mealPlan || !fixRequest.trim()) return
    
    setLoading(true)
    toast.loading('Applying your changes...', { id: 'fix' })
    try {
      const fixed = await quickFixMealPlan(mealPlan, fixRequest)
      setMealPlan(fixed)
      setFixRequest('')
      setShowQuickFix(false)
      toast.success('Meal plan updated!', { id: 'fix' })
    } catch (error: any) {
      console.error('Failed to fix meal plan:', error)
      toast.error(error.message || 'Failed to update meal plan.', { id: 'fix' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!mealPlan) return
    
    setLoading(true)
    toast.loading('Saving meal plan...', { id: 'save' })
    try {
      // Save to old API for backward compatibility
      await saveMealPlan(mealPlan)
      
      // Prepare meal plan data for context and database
      const contextMealPlan = {
        id: Date.now().toString(),
        weekStarting: mealPlan.weekStarting,
        meals: mealPlan.meals.map((meal, index) => ({
          id: `${Date.now()}-${index}`,
          day: index.toString(),
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index],
          name: meal.name,
          description: meal.description,
          cookTime: meal.cookTime,
          isOfficeDayMeal: meal.isOfficeDayMeal,
          isAdventureMeal: meal.cuisine === 'Adventure' || false,
          ingredients: meal.ingredients,
          instructions: meal.instructions || [],
          toddlerModification: meal.toddlerModification,
          cuisine: meal.cuisine,
          difficulty: 'medium',
          estimatedCost: meal.estimatedCost,
          imageUrl: meal.imageUrl || undefined
        })),
        grocery_list: mealPlan.grocery_list,
        weekSummary: mealPlan.weekSummary,
        status: 'approved',
        generatedAt: new Date().toISOString()
      }
      
      // Save to context for immediate display
      setCurrentMealPlan(contextMealPlan)
      
      // Save to database for persistence
      try {
        await saveMealPlanToDatabase({
          weekStarting: contextMealPlan.weekStarting,
          meals: contextMealPlan.meals,
          grocery_list: contextMealPlan.grocery_list,
          weekSummary: contextMealPlan.weekSummary
        })
        console.log('✅ Meal plan saved to database!')
      } catch (dbError) {
        console.error('⚠️ Failed to save to database (will still work with context):', dbError)
      }
      
      setSaved(true)
      toast.success('Meal plan saved! View it in "This Week\'s Meals"', { id: 'save' })
    } catch (error: any) {
      console.error('Failed to save meal plan:', error)
      toast.error(error.message || 'Failed to save meal plan.', { id: 'save' })
    } finally {
      setLoading(false)
    }
  }

  const getDayName = (index: number) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    return days[index]
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Hero Generate Card */}
      <GlassCard hover={false}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary flex items-center gap-3">
              <div className="p-2.5 bg-[var(--accent-primary)] rounded-xl shadow-lg">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              Weekly Meal Plan Generator
            </h2>
            <p className="text-secondary max-w-2xl">
              Let AI create a personalized meal plan tailored to your family's preferences, dietary needs, and schedule
            </p>
          </div>
          <Button 
            onClick={handleGenerate} 
            disabled={loading}
            size="lg"
            className="w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5 mr-2" />
                Generate Meal Plan
              </>
            )}
          </Button>
        </div>
      </GlassCard>

      {/* Loading Skeleton */}
      {loading && !mealPlan && (
        <div className="space-y-6 animate-fade-in">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--accent-primary)]/10 mb-4">
              <Loader2 className="h-8 w-8 text-[var(--accent-primary)] animate-spin" />
            </div>
            <p className="text-lg font-medium text-primary mb-2">Creating your meal plan...</p>
            <p className="text-sm text-muted">This may take a few moments</p>
          </div>
          {[1, 2, 3].map((i) => (
            <GlassCard key={i} hover={false}>
              <Skeleton className="h-6 w-48 mb-4 rounded-md" />
              <Skeleton className="h-4 w-full mb-2 rounded-md" />
              <Skeleton className="h-4 w-3/4 mb-4 rounded-md" />
              <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-32 rounded-lg" />
                <Skeleton className="h-32 rounded-lg" />
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {mealPlan && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {/* Week Summary Card */}
          <GlassCard hover={false} className="week-summary-card">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-primary">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
                  Week of {new Date(mealPlan.weekStarting).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </h3>
                <p className="text-secondary">
                  {mealPlan.weekSummary.cuisines?.join(', ') || 'Variety of cuisines'}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                <div className="text-center p-4 rounded-xl bg-[var(--bg-glass-light)] border border-[var(--border-subtle)]">
                  <div className="flex items-center justify-center gap-2 text-sm text-muted mb-1">
                    <DollarSign className="h-4 w-4" />
                    Estimated Cost
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    ${mealPlan.weekSummary.totalEstimatedCost.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted">CAD</div>
                </div>
                <div className="flex gap-2">
                  <CalendarExport mealPlan={mealPlan} />
                  <Button 
                    onClick={handleSave} 
                    disabled={loading || saved}
                    variant={saved ? "glass" : "default"}
                  >
                    {saved ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Saved
                      </>
                    ) : (
                      'Save Plan'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quick Fix Dialog */}
          <Dialog open={showQuickFix} onOpenChange={setShowQuickFix}>
            <DialogTrigger asChild>
              <Button
                variant="glass"
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Quick Fix
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] glass-card-static">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-primary">
                  <Edit2 className="h-5 w-5" />
                  Quick Fix Meal Plan
                </DialogTitle>
                <DialogDescription>
                  Tell us what you'd like to change and we'll update your meal plan instantly.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fix-request">What would you like to change?</Label>
                  <Textarea
                    id="fix-request"
                    value={fixRequest}
                    onChange={(e) => setFixRequest(e.target.value)}
                    placeholder="e.g., Replace Tuesday's meal with something vegetarian, or Make Wednesday's meal take less than 20 minutes"
                    className="min-h-[120px] resize-none glass-input"
                  />
                  <p className="text-xs text-muted">
                    Be specific about which day and what changes you want
                  </p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="glass" 
                    onClick={() => {
                      setShowQuickFix(false)
                      setFixRequest('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleQuickFix} 
                    disabled={loading || !fixRequest.trim()}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Applying...
                      </>
                    ) : (
                      'Apply Fix'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Meals Grid */}
          <div className="grid gap-6">
            {mealPlan.meals.map((meal, index) => (
              <GlassCard 
                key={index} 
                hover={false}
                className={`animate-fade-in ${meal.isOfficeDayMeal ? 'border-[var(--info-border)] bg-[var(--info-bg)]' : ''}`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="grid md:grid-cols-[280px_1fr] gap-6 mb-6">
                  {/* Meal Image */}
                  <div className="relative group">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[var(--bg-glass-light)] relative shadow-lg">
                      <img
                        src={getMealImageUrl(meal.name, meal.cuisine)}
                        alt={meal.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop&q=80`
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {meal.isOfficeDayMeal && (
                          <Badge className="bg-[var(--info-bg)] text-[var(--info-text)] border-[var(--info-border)]">
                            <Zap className="h-3 w-3 mr-1" />
                            Quick
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3">
                        {meal.cuisine && (
                          <Badge variant="secondary">
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
                          ? 'bg-[var(--info-bg)] text-[var(--info-text)]' 
                          : 'bg-[var(--accent-primary)] text-white'
                      }`}>
                        <ChefHat className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-primary">
                        {getDayName(index)}: {meal.name}
                      </h3>
                    </div>
                    <p className="text-secondary mb-4 leading-relaxed">{meal.description}</p>
                    <div className="flex items-center gap-6 text-sm text-muted mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span className="font-medium">{meal.cookTime} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-primary" />
                        <span className="font-medium">{meal.ingredients.length} ingredients</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-[var(--accent-primary)]" />
                      Ingredients
                    </h4>
                    <ul className="space-y-1.5">
                      {meal.ingredients.map((ing, i) => (
                        <li key={i} className="text-sm text-secondary flex items-start gap-2">
                          <span className="text-[var(--accent-primary)] mt-1.5">•</span>
                          <span>{ing}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary flex items-center gap-2">
                      <span className="text-2xl">👶</span>
                      Toddler Modification
                    </h4>
                    <p className="text-sm text-secondary leading-relaxed bg-[var(--accent-primary)]/10 p-3 rounded-lg border border-[var(--accent-primary)]/25">
                      {meal.toddlerModification}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Grocery List Card */}
          {mealPlan.grocery_list && mealPlan.grocery_list.length > 0 && (
            <GlassCard hover={false}>
              <h3 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-[var(--accent-primary)] rounded-xl">
                  <Utensils className="h-6 w-6 text-white" />
                </div>
                Grocery List
              </h3>
              <p className="text-secondary mb-6">
                {mealPlan.grocery_list.length} items • Total: ${mealPlan.grocery_list.reduce((sum: number, item: any) => sum + (item.estimatedPrice || 0), 0).toFixed(2)} CAD
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {mealPlan.grocery_list.map((item: any, index: number) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-glass-light)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:shadow-md transition-all group"
                  >
                    <span className="font-medium text-primary group-hover:text-[var(--accent-primary)] transition-colors">
                      {item.item}
                    </span>
                    {item.estimatedPrice && (
                      <span className="text-sm font-semibold text-primary ml-2">
                        ${item.estimatedPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  )
}
