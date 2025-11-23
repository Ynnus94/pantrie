import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy-load Supabase client
let supabaseClient: SupabaseClient | null = null
function getSupabase(): SupabaseClient {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_ANON_KEY
    if (!url || !key) {
      throw new Error('Supabase credentials not found. Check your .env file.')
    }
    supabaseClient = createClient(url, key)
  }
  return supabaseClient
}

export async function generateGroceryList(mealPlan: any) {
  // Extract all ingredients from meals
  const items: Record<string, { quantity: string, meals: string[], estimatedPrice?: number }> = {}
  
  mealPlan.meals?.forEach((meal: any) => {
    meal.ingredients?.forEach((ingredient: string) => {
      const normalized = ingredient.toLowerCase().trim()
      if (!items[normalized]) {
        items[normalized] = { quantity: '1', meals: [] }
      }
      items[normalized].meals.push(meal.name)
    })
  })
  
  // Look up prices for items
  const itemNames = Object.keys(items)
  const prices = await getPriceData(itemNames)
  
  // Match prices to items
  const groceryList = Object.entries(items).map(([item, data]) => {
    const priceInfo = prices.find((p: any) => 
      p.item_name.toLowerCase().includes(item) || 
      item.includes(p.item_name.toLowerCase())
    )
    
    return {
      item,
      quantity: data.quantity,
      meals: data.meals,
      estimatedPrice: priceInfo?.price || null,
      unit: priceInfo?.unit || null
    }
  })
  
  const totalEstimated = groceryList.reduce((sum, item) => 
    sum + (item.estimatedPrice || 0), 0
  )
  
  return {
    items: groceryList,
    totalEstimatedCost: totalEstimated,
    generatedAt: new Date().toISOString()
  }
}

export async function getPriceData(items: string[]) {
  const supabase = getSupabase()
  if (!items || items.length === 0) {
    // Return all baseline prices
    const { data, error } = await supabase
      .from('price_data')
      .select('*')
      .eq('source', 'metro_baseline')
      .order('item_name')
    
    if (error) throw error
    return data || []
  }
  
  // Search for specific items (fuzzy match)
  const { data, error } = await supabase
    .from('price_data')
    .select('*')
    .in('item_name', items)
    .order('recorded_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

