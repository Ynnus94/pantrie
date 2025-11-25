import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog'
import { Button } from '../ui/button'
import { Textarea } from '../ui/textarea'
import { Input } from '../ui/input'
import { GlassCard } from '../ui/GlassCard'
import { generateMealPlan } from '../../lib/api'
import { saveMealPlanToDatabase } from '../../lib/mealPlansApi'
import { generateGroceryListFromMealPlan } from '../../lib/groceryListApi'
import { fetchImagesForMeals } from '../../services/imageService'
import { useMealPlan } from '../../context/MealPlanContext'
import { Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '../../lib/utils'

interface MealPlanGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// Get next Monday's date
function getNextMonday(): Date {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const diff = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek)
  const monday = new Date(today)
  monday.setDate(today.getDate() + diff)
  return monday
}

export function MealPlanGeneratorModal({ isOpen, onClose, onSuccess }: MealPlanGeneratorModalProps) {
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState('')
  
  // Essential settings only
  const [mealCount, setMealCount] = useState(7)
  const [familySize, setFamilySize] = useState(3)
  const [budget, setBudget] = useState(200)
  const [quickMealDays, setQuickMealDays] = useState<number[]>([0, 2, 4]) // Mon, Wed, Fri
  const [toddlerFriendly, setToddlerFriendly] = useState(true)
  const [adventureMeal, setAdventureMeal] = useState(true)
  const [specialRequests, setSpecialRequests] = useState('')
  
  const { setCurrentMealPlan } = useMealPlan()
  const weekStart = getNextMonday()
  const weekStartString = weekStart.toISOString().split('T')[0]

  const toggleQuickDay = (dayIndex: number) => {
    setQuickMealDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex) 
        : [...prev, dayIndex]
    )
  }

  // Build AI prompt
  const buildPrompt = () => {
    const quickDayNames = quickMealDays.map(i => FULL_DAYS[i]).join(', ')
    
    let prompt = `Generate ${mealCount} dinner recipes for ${familySize} people.

REQUIREMENTS:
- Budget: ~$${budget} CAD total
- Use diverse cuisines (Italian, Asian, Mexican, Mediterranean, etc.)
`

    if (quickMealDays.length > 0) {
      prompt += `- Quick meals (≤30 min) on: ${quickDayNames}
`
    }

    if (toddlerFriendly) {
      prompt += `- Make all meals toddler-friendly with modification notes
`
    }

    if (adventureMeal) {
      prompt += `- Include 1 adventure meal (unique cuisine or unusual ingredients)
`
    }

    if (specialRequests) {
      prompt += `
SPECIAL REQUESTS: ${specialRequests}
`
    }

    return prompt
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setProgress('Creating your personalized meal plan...')
    
    try {
      const customPrompt = buildPrompt()
      
      setProgress('🤖 AI is crafting your meals...')
      const plan = await generateMealPlan(weekStartString, customPrompt)
      
      setProgress('🖼️ Adding food photos...')
      const mealsWithImages = await fetchImagesForMeals(
        plan.meals.map((m: any) => ({ mealName: m.name, ...m }))
      )
      
      setProgress('💾 Saving...')
      const contextMealPlan = {
        id: Date.now().toString(),
        weekStarting: weekStartString,
        meals: plan.meals.slice(0, mealCount).map((meal: any, index: number) => ({
          id: `${Date.now()}-${index}`,
          day: index.toString(),
          dayOfWeek: FULL_DAYS[index],
          name: meal.name,
          description: meal.description,
          cookTime: meal.cookTime,
          isOfficeDayMeal: quickMealDays.includes(index),
          isAdventureMeal: meal.cuisine === 'Adventure' || false,
          ingredients: meal.ingredients,
          instructions: meal.instructions || [],
          toddlerModification: toddlerFriendly ? meal.toddlerModification : null,
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
      
      setCurrentMealPlan(contextMealPlan)
      
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
      
      setProgress('🛒 Creating grocery list...')
      try {
        await generateGroceryListFromMealPlan(contextMealPlan, 1)
      } catch (groceryError) {
        console.error('Failed to generate grocery list:', groceryError)
      }
      
      toast.success('Meal plan generated!', {
        description: `${mealCount} meals + grocery list ready`
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
      <DialogContent className="max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-[var(--accent-primary)]" />
            Generate Meal Plan
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Week - Non-editable */}
          <p className="text-sm text-muted">
            Week of {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          {/* Core Settings */}
          <GlassCard hover={false} className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-muted mb-1 block">Meals</label>
                <select 
                  value={mealCount}
                  onChange={(e) => setMealCount(Number(e.target.value))}
                  className="w-full h-9 px-2 rounded-lg glass-input bg-[var(--bg-glass)] border border-[var(--border-subtle)] text-sm"
                  disabled={generating}
                >
                  <option value={5}>5</option>
                  <option value={7}>7</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">People</label>
                <select 
                  value={familySize}
                  onChange={(e) => setFamilySize(Number(e.target.value))}
                  className="w-full h-9 px-2 rounded-lg glass-input bg-[var(--bg-glass)] border border-[var(--border-subtle)] text-sm"
                  disabled={generating}
                >
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted mb-1 block">Budget</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                  <Input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="glass-input h-9 pl-6 text-sm"
                    disabled={generating}
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Quick Days */}
          <div>
            <label className="text-sm font-medium text-primary mb-2 block">
              ⚡ Quick meals (≤30min) on:
            </label>
            <div className="flex gap-1.5">
              {DAYS.map((day, i) => (
                <button
                  key={i}
                  onClick={() => toggleQuickDay(i)}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all',
                    quickMealDays.includes(i)
                      ? 'bg-[var(--accent-primary)] text-white'
                      : 'glass-button hover:bg-[var(--accent-primary)]/10'
                  )}
                  disabled={generating}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences - Simple Checkboxes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-primary block">Preferences:</label>
            
            <label className="flex items-center gap-2.5 cursor-pointer py-1">
              <input 
                type="checkbox" 
                checked={toddlerFriendly}
                onChange={(e) => setToddlerFriendly(e.target.checked)}
                className="rounded border-[var(--border-medium)] w-4 h-4"
                disabled={generating}
              />
              <span className="text-sm text-secondary">Include toddler-friendly options</span>
            </label>
            
            <label className="flex items-center gap-2.5 cursor-pointer py-1">
              <input 
                type="checkbox" 
                checked={adventureMeal}
                onChange={(e) => setAdventureMeal(e.target.checked)}
                className="rounded border-[var(--border-medium)] w-4 h-4"
                disabled={generating}
              />
              <span className="text-sm text-secondary">Add 1 adventure meal</span>
            </label>
          </div>

          {/* Special Requests */}
          <div>
            <label className="text-sm font-medium text-primary mb-2 block">
              Special Requests <span className="text-muted font-normal">(Optional)</span>
            </label>
            <Textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              placeholder="e.g., 'Tuesday vegetarian' or 'No seafood this week'"
              className="glass-input h-20 resize-none text-sm"
              disabled={generating}
            />
          </div>

          {/* Progress */}
          {generating && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20">
              <Loader2 className="h-4 w-4 text-[var(--accent-primary)] animate-spin" />
              <span className="text-sm text-primary">{progress}</span>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2">
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
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
