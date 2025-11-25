import { useState } from 'react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Calendar, Zap, Check, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useMealPlan } from '../../context/MealPlanContext'
import { useSettings } from '../../context/SettingsContext'
import { getOrderedDayNames } from '../../lib/weekUtils'

interface AddToWeekDropdownProps {
  recipe: {
    id: string | number
    title: string
    description?: string
    ingredients?: string[]
    instructions?: string[]
    cookTime?: number
    imageUrl?: string
  }
  quickDays?: number[] // Days that need quick meals (0-6)
}

export function AddToWeekDropdown({ recipe, quickDays = [] }: AddToWeekDropdownProps) {
  const [adding, setAdding] = useState(false)
  const { currentMealPlan, setCurrentMealPlan } = useMealPlan()
  const { weekStartDay } = useSettings()
  
  const orderedDayNames = getOrderedDayNames(weekStartDay)

  // Check which days already have this recipe
  const daysWithRecipe = new Set(
    currentMealPlan?.meals
      ?.filter(meal => meal.name === recipe.title || meal.recipeId === recipe.id)
      ?.map(meal => meal.dayOfWeek) || []
  )

  const handleAddToDay = async (dayName: string, dayIndex: number) => {
    if (daysWithRecipe.has(dayName)) {
      toast.info(`"${recipe.title}" is already on ${dayName}`)
      return
    }

    setAdding(true)
    try {
      // Create a new meal from the recipe
      const newMeal = {
        id: `${Date.now()}-${dayIndex}`,
        day: dayIndex.toString(),
        dayOfWeek: dayName,
        name: recipe.title,
        description: recipe.description || '',
        cookTime: recipe.cookTime || 30,
        isOfficeDayMeal: quickDays.includes(dayIndex),
        isAdventureMeal: false,
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || [],
        toddlerModification: '',
        cuisine: '',
        difficulty: 'medium',
        imageUrl: recipe.imageUrl,
        recipeId: typeof recipe.id === 'string' ? parseInt(recipe.id) : recipe.id
      }

      // Update the meal plan
      if (currentMealPlan) {
        // Check if there's already a meal for this day
        const existingMealIndex = currentMealPlan.meals.findIndex(
          m => m.dayOfWeek === dayName
        )

        let updatedMeals
        if (existingMealIndex >= 0) {
          // Replace existing meal
          updatedMeals = [...currentMealPlan.meals]
          updatedMeals[existingMealIndex] = newMeal
        } else {
          // Add new meal
          updatedMeals = [...currentMealPlan.meals, newMeal]
        }

        setCurrentMealPlan({
          ...currentMealPlan,
          meals: updatedMeals
        })
      } else {
        // Create new meal plan with this meal
        setCurrentMealPlan({
          id: Date.now().toString(),
          weekStarting: new Date().toISOString().split('T')[0],
          meals: [newMeal],
          grocery_list: [],
          weekSummary: {
            totalEstimatedCost: 0,
            cuisines: [],
            prepDays: []
          },
          status: 'draft',
          generatedAt: new Date().toISOString()
        })
      }

      toast.success(`Added "${recipe.title}" to ${dayName}!`, {
        action: {
          label: 'View Week',
          onClick: () => {
            // Navigate to this week page - this would need a navigation prop
            window.location.hash = 'thisweek'
          }
        }
      })
    } catch (error) {
      console.error('Failed to add to week:', error)
      toast.error('Failed to add recipe to meal plan')
    } finally {
      setAdding(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="w-full gap-2" disabled={adding}>
          <Calendar className="h-4 w-4" />
          Add to This Week
          <ChevronDown className="h-4 w-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {orderedDayNames.map((dayName, index) => {
          const hasRecipe = daysWithRecipe.has(dayName)
          const isQuickDay = quickDays.includes(index)
          
          return (
            <DropdownMenuItem
              key={dayName}
              onClick={() => handleAddToDay(dayName, index)}
              disabled={hasRecipe}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                {hasRecipe && <Check className="h-4 w-4 text-green-500" />}
                <span className={hasRecipe ? 'text-muted' : ''}>{dayName}</span>
              </div>
              {isQuickDay && (
                <div className="flex items-center gap-1 text-xs text-[var(--accent-primary)]">
                  <Zap className="h-3 w-3" />
                  Quick
                </div>
              )}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

