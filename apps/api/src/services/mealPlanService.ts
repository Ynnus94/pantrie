import Anthropic from '@anthropic-ai/sdk'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy-load Anthropic client to ensure env vars are loaded first
let anthropicClient: Anthropic | null = null
function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not found. Check your .env file.')
    }
    anthropicClient = new Anthropic({ apiKey })
  }
  return anthropicClient
}

// Lazy-load Supabase client to ensure env vars are loaded first
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

const DEFAULT_PREFERENCES = {
  adults: ['Sunny', 'Audrey'],
  children: [{ name: 'daughter', age: 2, favorites: ['salmon', 'chicken', 'pasta'] }],
  office_days: ['Monday', 'Wednesday', 'Friday'],
  budget: { min: 150, max: 200 },
  location: 'Montreal, QC'
}

export async function generateMealPlan(weekStarting: string, preferences?: any) {
  let prompt: string
  
  // Check if preferences is a custom prompt string (from new modal)
  if (typeof preferences === 'string') {
    prompt = `You are a meal planning assistant for a family in Montreal, Quebec. 

${preferences}

Return the response as a JSON object with this structure:
{
  "weekStarting": "${weekStarting}",
  "meals": [
    {
      "name": "Meal Name",
      "description": "Brief description of the dish",
      "ingredients": ["ingredient1 with quantity", "ingredient2 with quantity"],
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "cookTime": 30,
      "toddlerModification": "How to adapt for toddler (if applicable)",
      "isOfficeDayMeal": true/false,
      "cuisine": "Korean/Thai/Italian/etc",
      "estimatedCost": 25.00
    }
  ],
  "weekSummary": {
    "totalEstimatedCost": 180,
    "cuisines": ["Korean", "Italian", "etc"],
    "prepDays": ["Sunday"]
  }
}

Important:
- Each meal should have detailed ingredients with quantities
- Include step-by-step instructions
- Estimate cost in CAD based on Quebec grocery prices
- Include diverse cuisines as requested`
  } else {
    // Use legacy preferences object
    const prefs = preferences || DEFAULT_PREFERENCES
    
    prompt = `You are a meal planning assistant for a family in Montreal, Quebec. Generate a weekly meal plan starting ${weekStarting}.

Family Details:
- Adults: ${prefs.adults?.join(', ') || 'Family members'}
- Children: ${prefs.children?.map((c: any) => `${c.name} (age ${c.age}) - favorites: ${c.favorites?.join(', ')}`).join('; ') || 'None'}
- Office days (need quick meals): ${prefs.office_days?.join(', ') || 'Monday, Wednesday, Friday'}
- Budget: $${prefs.budget?.min || 150}-$${prefs.budget?.max || 200} CAD per week
- Location: ${prefs.location || 'Montreal, QC'}

Requirements:
1. Create 7 dinner meals (one for each day)
2. For office days (${prefs.office_days?.join(', ') || 'Monday, Wednesday, Friday'}), suggest meals that take 30 minutes or less
3. For non-office days, you can suggest more adventurous meals (Korean, Thai, Indian, Middle Eastern, etc.)
4. Each meal should include:
   - Name
   - Description
   - Ingredients list with quantities
   - Step-by-step instructions
   - Cook time
   - Toddler modification (how to adapt for a 2-year-old)
   - Whether it's an office day meal
   - Estimated cost
5. Consider the child's favorites: ${prefs.children?.[0]?.favorites?.join(', ') || 'salmon, chicken, pasta'}
6. Include variety in cuisines and flavors
7. Stay within budget using Quebec grocery prices

Return the response as a JSON object with this structure:
{
  "weekStarting": "${weekStarting}",
  "meals": [
    {
      "name": "Meal Name",
      "description": "Description",
      "ingredients": ["ingredient1 with quantity", "ingredient2 with quantity"],
      "instructions": ["Step 1", "Step 2", "Step 3"],
      "cookTime": 30,
      "toddlerModification": "How to adapt for toddler",
      "isOfficeDayMeal": true/false,
      "cuisine": "Korean/Thai/etc",
      "estimatedCost": 25.00
    }
  ],
  "weekSummary": {
    "totalEstimatedCost": 180,
    "cuisines": ["Korean", "Italian"],
    "prepDays": ["Sunday"]
  }
}`
  }

  try {
    const anthropic = getAnthropic()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = message.content[0]
    if (content.type === 'text') {
      // Extract JSON from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const mealPlan = JSON.parse(jsonMatch[0])
        
        // Generate grocery list
        const groceryList = generateGroceryListFromMeals(mealPlan.meals)
        mealPlan.grocery_list = groceryList
        
        return mealPlan
      }
    }
    
    throw new Error('Failed to parse meal plan from Claude response')
  } catch (error: any) {
    console.error('Claude API error:', error)
    throw new Error(`Failed to generate meal plan: ${error.message}`)
  }
}

export async function quickFixMealPlan(mealPlan: any, fixRequest: string) {
  const prompt = `You have a meal plan that needs a quick fix. Here's the current plan:

${JSON.stringify(mealPlan, null, 2)}

User's fix request: "${fixRequest}"

Please update the meal plan according to the request. Return the complete updated meal plan in the same JSON format.`

  try {
    const anthropic = getAnthropic()
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const fixedMealPlan = JSON.parse(jsonMatch[0])
        // Regenerate grocery list
        fixedMealPlan.grocery_list = generateGroceryListFromMeals(fixedMealPlan.meals)
        return fixedMealPlan
      }
    }
    
    throw new Error('Failed to parse fixed meal plan from Claude response')
  } catch (error: any) {
    console.error('Claude API error:', error)
    throw new Error(`Failed to fix meal plan: ${error.message}`)
  }
}

export async function getMealPlans() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .order('week_starting', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function saveMealPlan(mealPlan: any) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('meal_plans')
    .insert({
      family_id: 1,
      week_starting: mealPlan.weekStarting,
      meals: mealPlan.meals,
      grocery_list: mealPlan.grocery_list,
      week_summary: mealPlan.weekSummary,
      status: 'approved'
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateMealPlan(id: number, mealPlan: any) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('meal_plans')
    .update({
      week_starting: mealPlan.weekStarting,
      meals: mealPlan.meals,
      grocery_list: mealPlan.grocery_list,
      week_summary: mealPlan.weekSummary,
      status: 'approved'
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteMealPlan(id: number) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('meal_plans')
    .delete()
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

function generateGroceryListFromMeals(meals: any[]) {
  const items: Record<string, { quantity: string, meals: string[] }> = {}
  
  meals.forEach(meal => {
    meal.ingredients?.forEach((ingredient: string) => {
      const normalized = ingredient.toLowerCase().trim()
      if (!items[normalized]) {
        items[normalized] = { quantity: '1', meals: [] }
      }
      items[normalized].meals.push(meal.name)
    })
  })
  
  return Object.entries(items).map(([item, data]) => ({
    item,
    quantity: data.quantity,
    meals: data.meals
  }))
}
