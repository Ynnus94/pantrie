import { supabase } from './supabase'

export interface GroceryItem {
  id: string
  family_id: number
  meal_plan_id?: number
  item_name: string
  quantity?: number
  unit?: string
  category: string
  aisle?: string
  is_checked: boolean
  source_type: 'meal-plan' | 'manual' | 'recipe'
  source_id?: string
  estimated_price?: number
  notes?: string
  created_at?: string
  updated_at?: string
}

// Get grocery list for family (optionally filtered by meal plan)
export async function getGroceryList(familyId: number = 1, mealPlanId?: number): Promise<GroceryItem[]> {
  try {
    let query = supabase
      .from('grocery_list_items')
      .select('*')
      .eq('family_id', familyId)
      .order('category')
      .order('item_name')

    if (mealPlanId) {
      query = query.eq('meal_plan_id', mealPlanId)
    }

    const { data, error } = await query

    if (error) throw error
    return data as GroceryItem[]
  } catch (error) {
    console.error('Error fetching grocery list:', error)
    return []
  }
}

// Add a new grocery item
export async function addGroceryItem(item: Omit<GroceryItem, 'id' | 'created_at' | 'updated_at'>): Promise<GroceryItem | null> {
  try {
    const { data, error } = await supabase
      .from('grocery_list_items')
      .insert([{
        family_id: item.family_id || 1,
        meal_plan_id: item.meal_plan_id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category || 'Other',
        aisle: item.aisle,
        is_checked: false,
        source_type: item.source_type || 'manual',
        source_id: item.source_id,
        estimated_price: item.estimated_price,
        notes: item.notes
      }])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error adding grocery item:', error)
    throw error
  }
}

// Update a grocery item
export async function updateGroceryItem(id: string, updates: Partial<GroceryItem>): Promise<GroceryItem | null> {
  try {
    const { data, error } = await supabase
      .from('grocery_list_items')
      .update({
        item_name: updates.item_name,
        quantity: updates.quantity,
        unit: updates.unit,
        category: updates.category,
        aisle: updates.aisle,
        is_checked: updates.is_checked,
        estimated_price: updates.estimated_price,
        notes: updates.notes
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error updating grocery item:', error)
    throw error
  }
}

// Delete a grocery item
export async function deleteGroceryItem(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('grocery_list_items')
      .delete()
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting grocery item:', error)
    throw error
  }
}

// Toggle checked status
export async function toggleGroceryItem(id: string, isChecked: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from('grocery_list_items')
      .update({ is_checked: !isChecked })
      .eq('id', id)

    if (error) throw error
  } catch (error) {
    console.error('Error toggling grocery item:', error)
    throw error
  }
}

// Clear all checked items
export async function clearCheckedItems(familyId: number = 1): Promise<void> {
  try {
    const { error } = await supabase
      .from('grocery_list_items')
      .delete()
      .eq('family_id', familyId)
      .eq('is_checked', true)

    if (error) throw error
  } catch (error) {
    console.error('Error clearing checked items:', error)
    throw error
  }
}

// Clear all items for a family
export async function clearAllItems(familyId: number = 1): Promise<void> {
  try {
    const { error } = await supabase
      .from('grocery_list_items')
      .delete()
      .eq('family_id', familyId)

    if (error) throw error
  } catch (error) {
    console.error('Error clearing all items:', error)
    throw error
  }
}

// Delete items by meal plan (used when meal plan is deleted)
export async function deleteItemsByMealPlan(mealPlanId: number): Promise<void> {
  try {
    const { error } = await supabase
      .from('grocery_list_items')
      .delete()
      .eq('meal_plan_id', mealPlanId)

    if (error) throw error
  } catch (error) {
    console.error('Error deleting items by meal plan:', error)
    throw error
  }
}

// Helper: Categorize ingredient by name
function categorizeIngredient(itemName: string): string {
  const categories: Record<string, string[]> = {
    'Produce': ['lettuce', 'tomato', 'onion', 'garlic', 'pepper', 'carrot', 'broccoli', 'spinach', 
                'celery', 'cucumber', 'zucchini', 'mushroom', 'potato', 'sweet potato', 'corn',
                'avocado', 'lemon', 'lime', 'apple', 'banana', 'orange', 'berry', 'fruit', 'vegetable',
                'herb', 'cilantro', 'parsley', 'basil', 'ginger', 'scallion', 'green onion'],
    'Meat': ['chicken', 'beef', 'pork', 'salmon', 'fish', 'shrimp', 'turkey', 'bacon', 'sausage',
             'ground', 'steak', 'lamb', 'meat', 'protein'],
    'Dairy': ['milk', 'cheese', 'butter', 'yogurt', 'cream', 'egg', 'sour cream', 'cottage'],
    'Pantry': ['rice', 'pasta', 'flour', 'sugar', 'oil', 'salt', 'pepper', 'spice', 'sauce',
               'soy sauce', 'vinegar', 'honey', 'maple', 'broth', 'stock', 'can', 'bean', 'lentil',
               'noodle', 'bread crumb', 'panko'],
    'Frozen': ['frozen', 'ice cream'],
    'Bakery': ['bread', 'bun', 'tortilla', 'pita', 'naan', 'roll', 'bagel', 'croissant'],
    'Beverages': ['juice', 'soda', 'water', 'tea', 'coffee', 'drink'],
    'Snacks': ['chip', 'cracker', 'cookie', 'snack', 'nut', 'seed']
  }

  const lowerName = itemName.toLowerCase()
  
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => lowerName.includes(keyword))) {
      return category
    }
  }
  
  return 'Other'
}

// Generate grocery list from meal plan ingredients
export async function generateGroceryListFromMealPlan(
  mealPlan: any, 
  familyId: number = 1
): Promise<GroceryItem[]> {
  try {
    // Clear any existing meal-plan sourced items for this family
    // (Don't try to match by meal_plan_id since local plans don't have DB IDs)
    try {
      const { error } = await supabase
        .from('grocery_list_items')
        .delete()
        .eq('family_id', familyId)
        .eq('source_type', 'meal-plan')
      
      if (error) console.warn('Could not clear old meal plan items:', error)
    } catch (e) {
      console.warn('Error clearing old items:', e)
    }

    const itemsMap = new Map<string, {
      item_name: string
      quantity: number
      unit: string
      category: string
      source_ids: string[]
      estimated_price: number
    }>()

    // Extract ingredients from all meals
    for (const meal of mealPlan.meals || []) {
      if (meal.ingredients) {
        for (const ingredient of meal.ingredients) {
          // Parse ingredient string (e.g., "2 cups rice" or "1 lb chicken breast")
          const parsed = parseIngredient(typeof ingredient === 'string' ? ingredient : ingredient.name)
          const key = `${parsed.name.toLowerCase()}-${parsed.unit}`
          
          if (itemsMap.has(key)) {
            const existing = itemsMap.get(key)!
            existing.quantity += parsed.quantity
            existing.source_ids.push(meal.id)
          } else {
            itemsMap.set(key, {
              item_name: parsed.name,
              quantity: parsed.quantity,
              unit: parsed.unit,
              category: categorizeIngredient(parsed.name),
              source_ids: [meal.id],
              estimated_price: 0
            })
          }
        }
      }
    }

    // Insert all items (don't include meal_plan_id since local plans don't have DB IDs)
    const items: Omit<GroceryItem, 'id' | 'created_at' | 'updated_at'>[] = Array.from(itemsMap.values()).map(item => ({
      family_id: familyId,
      // meal_plan_id is omitted - local meal plans don't have database IDs
      item_name: item.item_name,
      quantity: item.quantity || undefined,
      unit: item.unit || undefined,
      category: item.category,
      is_checked: false,
      source_type: 'meal-plan' as const,
      source_id: item.source_ids.join(','),
      estimated_price: item.estimated_price || undefined
    }))

    // Batch insert
    if (items.length > 0) {
      const { data, error } = await supabase
        .from('grocery_list_items')
        .insert(items)
        .select()

      if (error) throw error
      return data as GroceryItem[]
    }

    return []
  } catch (error) {
    console.error('Error generating grocery list from meal plan:', error)
    throw error
  }
}

// Helper: Parse ingredient string into components
function parseIngredient(ingredient: string): { name: string; quantity: number; unit: string } {
  // Common patterns:
  // "2 cups rice"
  // "1 lb chicken breast"
  // "3 large eggs"
  // "salt and pepper to taste"
  // "1/2 cup olive oil"
  
  const quantityRegex = /^(\d+(?:\/\d+)?(?:\.\d+)?)\s*/
  const unitRegex = /^(cups?|tbsp|tsp|oz|lb|lbs|pound|pounds|g|kg|ml|l|bunch|cloves?|pieces?|large|medium|small|cans?|package|pkg)\s+/i

  let remaining = ingredient.trim()
  let quantity = 1
  let unit = ''

  // Extract quantity
  const qMatch = remaining.match(quantityRegex)
  if (qMatch) {
    // Handle fractions like "1/2"
    if (qMatch[1].includes('/')) {
      const [num, denom] = qMatch[1].split('/')
      quantity = parseInt(num) / parseInt(denom)
    } else {
      quantity = parseFloat(qMatch[1])
    }
    remaining = remaining.slice(qMatch[0].length)
  }

  // Extract unit
  const uMatch = remaining.match(unitRegex)
  if (uMatch) {
    unit = uMatch[1].toLowerCase()
    remaining = remaining.slice(uMatch[0].length)
  }

  return {
    name: remaining.trim() || ingredient,
    quantity,
    unit
  }
}

// Category icons mapping
export const CATEGORY_ICONS: Record<string, string> = {
  'Produce': '🥬',
  'Meat': '🥩',
  'Dairy': '🧀',
  'Pantry': '🏺',
  'Frozen': '🧊',
  'Bakery': '🍞',
  'Beverages': '🥤',
  'Snacks': '🍪',
  'Other': '🛒'
}

// Category order for display
export const CATEGORY_ORDER = [
  'Produce',
  'Meat',
  'Dairy',
  'Bakery',
  'Pantry',
  'Frozen',
  'Beverages',
  'Snacks',
  'Other'
]

