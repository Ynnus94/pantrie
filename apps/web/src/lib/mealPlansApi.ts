import { supabase } from './supabase'

export interface SaveMealPlanData {
  weekStarting: string
  meals: any[]
  grocery_list?: any[]
  weekSummary?: {
    totalEstimatedCost: number
    cuisines?: string[]
    prepDays?: string[]
  }
}

export async function saveMealPlanToDatabase(mealPlanData: SaveMealPlanData) {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .insert({
        family_id: 1,
        week_starting: mealPlanData.weekStarting,
        meals: mealPlanData.meals,
        grocery_list: mealPlanData.grocery_list || [],
        week_summary: mealPlanData.weekSummary || {},
        status: 'approved'
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error saving meal plan to database:', error)
    throw error
  }
}

export async function getCurrentMealPlanFromDatabase() {
  try {
    const { data, error} = await supabase
      .from('meal_plans')
      .select('*')
      .eq('status', 'approved')
      .order('week_starting', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      // If no meal plan found, return null instead of throwing
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Error loading meal plan from database:', error)
    return null
  }
}

export async function getAllMealPlansFromDatabase(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .order('week_starting', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error loading meal plans:', error)
    return []
  }
}

