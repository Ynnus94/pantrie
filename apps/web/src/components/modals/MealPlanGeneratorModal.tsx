import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { GlassCard } from '../ui/GlassCard'
import { generateMealPlan } from '../../lib/api'
import { saveMealPlanToDatabase } from '../../lib/mealPlansApi'
import { generateGroceryListFromMealPlan } from '../../lib/groceryListApi'
import { fetchImagesForMeals } from '../../services/imageService'
import { useMealPlan } from '../../context/MealPlanContext'
import { Sparkles, Loader2, Calendar, Users, DollarSign, Utensils, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface MealPlanGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function MealPlanGeneratorModal({ isOpen, onClose, onSuccess }: MealPlanGeneratorModalProps) {
  const [generating, setGenerating] = useState(false)
  const [specialRequests, setSpecialRequests] = useState('')
  const [progress, setProgress] = useState('')
  const { setCurrentMealPlan } = useMealPlan()
  
  const [weekStartDate] = useState(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    return monday.toISOString().split('T')[0]
  })

  const handleGenerate = async () => {
    setGenerating(true)
    setProgress('Creating your personalized meal plan...')
    
    try {
      // Step 1: Generate meal plan with AI
      setProgress('🤖 AI is crafting your meals...')
      const plan = await generateMealPlan(weekStartDate)
      
      // Step 2: Fetch images
      setProgress('🖼️ Adding beautiful food photos...')
      const mealsWithImages = await fetchImagesForMeals(
        plan.meals.map((m: any) => ({ mealName: m.name, ...m }))
      )
      
      // Step 3: Prepare the final plan
      setProgress('💾 Saving your meal plan...')
      const contextMealPlan = {
        id: Date.now().toString(),
        weekStarting: weekStartDate,
        meals: plan.meals.map((meal: any, index: number) => ({
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
          imageUrl: mealsWithImages[index]?.imageUrl || undefined
        })),
        grocery_list: plan.grocery_list,
        weekSummary: plan.weekSummary,
        status: 'approved',
        generatedAt: new Date().toISOString()
      }
      
      // Save to context for immediate display
      setCurrentMealPlan(contextMealPlan)
      
      // Save to database
      try {
        await saveMealPlanToDatabase({
          weekStarting: contextMealPlan.weekStarting,
          meals: contextMealPlan.meals,
          grocery_list: contextMealPlan.grocery_list,
          weekSummary: contextMealPlan.weekSummary
        })
      } catch (dbError) {
        console.error('Failed to save to database:', dbError)
      }
      
      // Generate grocery list from meal plan
      setProgress('🛒 Creating your grocery list...')
      try {
        await generateGroceryListFromMealPlan(contextMealPlan, 1)
      } catch (groceryError) {
        console.error('Failed to generate grocery list:', groceryError)
        // Don't fail the whole process for grocery list
      }
      
      toast.success('Meal plan generated!', {
        description: '7 meals + grocery list ready for your week'
      })
      
      onClose()
      onSuccess?.()
      
    } catch (error: any) {
      console.error('Failed to generate meal plan:', error)
      toast.error('Failed to generate meal plan', {
        description: error.message || 'Please try again'
      })
    } finally {
      setGenerating(false)
      setProgress('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-2 bg-[var(--accent-primary)] rounded-xl">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            Generate Weekly Meal Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Week Info */}
          <GlassCard hover={false} className="week-summary-card">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-[var(--accent-primary)]" />
              <div>
                <p className="font-semibold text-primary">
                  Week of {new Date(weekStartDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-sm text-secondary">7 dinners will be planned</p>
              </div>
            </div>
          </GlassCard>

          {/* Family Preferences Summary */}
          <div>
            <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--accent-primary)]" />
              Based on your family
            </h3>
            <GlassCard hover={false}>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-secondary">
                  <span className="text-lg">👨‍👩‍👧</span>
                  <span>3 family members</span>
                </div>
                <div className="flex items-center gap-2 text-secondary">
                  <span className="text-lg">👶</span>
                  <span>Toddler-friendly options</span>
                </div>
                <div className="flex items-center gap-2 text-secondary">
                  <Clock className="h-4 w-4 text-muted" />
                  <span>Quick meals on office days</span>
                </div>
                <div className="flex items-center gap-2 text-secondary">
                  <Sparkles className="h-4 w-4 text-muted" />
                  <span>1 adventure meal</span>
                </div>
                <div className="flex items-center gap-2 text-secondary">
                  <DollarSign className="h-4 w-4 text-muted" />
                  <span>~$200 weekly budget</span>
                </div>
                <div className="flex items-center gap-2 text-secondary">
                  <Utensils className="h-4 w-4 text-muted" />
                  <span>Diverse cuisines</span>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Special Requests */}
          <div>
            <Label htmlFor="special-requests" className="text-primary font-semibold mb-2 block">
              Special Requests (Optional)
            </Label>
            <Textarea
              id="special-requests"
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g., 'Make Tuesday vegetarian' or 'Include a slow cooker meal' or 'No seafood this week'"
              className="glass-input min-h-[100px] resize-none"
              disabled={generating}
            />
            <p className="text-xs text-muted mt-2">
              💡 The AI will consider your family preferences automatically
            </p>
          </div>

          {/* Progress indicator */}
          {generating && (
            <GlassCard hover={false} className="bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/20">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-[var(--accent-primary)] animate-spin" />
                <div>
                  <p className="font-medium text-primary">{progress}</p>
                  <p className="text-sm text-secondary">This usually takes 20-30 seconds</p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="glass"
              onClick={onClose}
              disabled={generating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="min-w-[160px]"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Plan
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
