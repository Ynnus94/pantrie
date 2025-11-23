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

export async function getFoodTries() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('food_tries')
    .select('*')
    .order('tried_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

export async function addFoodTry(foodTry: any) {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('food_tries')
    .insert({
      family_id: 1,
      child_name: foodTry.child_name || 'daughter',
      food_item: foodTry.food_item,
      reaction: foodTry.reaction,
      meal_context: foodTry.meal_context || '',
      notes: foodTry.notes || ''
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

