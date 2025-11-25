import { createContext, useContext, useState, ReactNode } from 'react'

interface Meal {
  id: string
  day: string
  dayOfWeek: string
  name: string
  description: string
  cookTime: number
  difficulty?: string
  estimatedCost?: number
  isOfficeDayMeal?: boolean
  isAdventureMeal?: boolean
  ingredients: string[]
  instructions?: string[]
  toddlerModification?: string
  imageUrl?: string
  cuisine?: string
}

interface MealPlan {
  id: string
  weekStarting: string
  meals: Meal[]
  grocery_list?: any[]
  weekSummary?: {
    totalEstimatedCost: number
    cuisines?: string[]
    prepDays?: string[]
  }
  status?: string
  generatedAt: string
}

interface MealPlanContextType {
  currentMealPlan: MealPlan | null
  setCurrentMealPlan: (plan: MealPlan) => void
  clearMealPlan: () => void
  getMealForDay: (day: string) => Meal | undefined
  weekStartDay: number // 0=Sunday, 1=Monday, etc.
  setWeekStartDay: (day: number) => void
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined)

export function MealPlanProvider({ children }: { children: ReactNode }) {
  // Initialize meal plan from localStorage
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(() => {
    try {
      const saved = localStorage.getItem('currentMealPlan')
      return saved ? JSON.parse(saved) : null
    } catch (error) {
      console.error('Error loading meal plan from localStorage:', error)
      return null
    }
  })

  // Initialize week start day from localStorage (default to Saturday = 6)
  const [weekStartDay, setWeekStartDayState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('weekStartDay')
      return saved ? parseInt(saved, 10) : 6 // Default to Saturday
    } catch (error) {
      return 6 // Default to Saturday
    }
  })

  // Save meal plan to localStorage whenever it changes
  const updateMealPlan = (plan: MealPlan | null) => {
    setCurrentMealPlan(plan)
    if (plan) {
      try {
        localStorage.setItem('currentMealPlan', JSON.stringify(plan))
      } catch (error) {
        console.error('Error saving meal plan to localStorage:', error)
      }
    } else {
      localStorage.removeItem('currentMealPlan')
    }
  }

  // Save week start day to localStorage
  const setWeekStartDay = (day: number) => {
    setWeekStartDayState(day)
    try {
      localStorage.setItem('weekStartDay', day.toString())
    } catch (error) {
      console.error('Error saving week start day:', error)
    }
  }

  const clearMealPlan = () => {
    updateMealPlan(null)
  }

  const getMealForDay = (day: string) => {
    return currentMealPlan?.meals.find(meal => meal.day === day || meal.dayOfWeek === day)
  }

  return (
    <MealPlanContext.Provider
      value={{
        currentMealPlan,
        setCurrentMealPlan: updateMealPlan,
        clearMealPlan,
        getMealForDay,
        weekStartDay,
        setWeekStartDay
      }}
    >
      {children}
    </MealPlanContext.Provider>
  )
}

export function useMealPlan() {
  const context = useContext(MealPlanContext)
  if (context === undefined) {
    throw new Error('useMealPlan must be used within a MealPlanProvider')
  }
  return context
}
