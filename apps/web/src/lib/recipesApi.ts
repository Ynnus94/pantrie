import { supabase } from './supabase'

export interface SaveRecipeData {
  title: string
  description?: string
  sourceType?: string
  sourceUrl?: string
  source?: string
  author?: string
  ingredients: string[]
  instructions: string[]
  prepTime?: number
  cookTime?: number
  totalTime?: number
  servings?: number
  difficulty?: string
  imageUrl?: string
  tags?: string[]
}

export async function saveRecipe(recipeData: SaveRecipeData) {
  try {
    console.log('💾 Saving recipe to Supabase:', {
      title: recipeData.title,
      ingredientsCount: recipeData.ingredients?.length,
      instructionsCount: recipeData.instructions?.length
    })
    
    const { data, error } = await supabase
      .from('recipes')
      .insert({
        family_id: 1,
        title: recipeData.title,
        description: recipeData.description || '',
        source_type: recipeData.sourceType || 'url-import',
        source_url: recipeData.sourceUrl,
        source: recipeData.source,
        author: recipeData.author,
        ingredients: recipeData.ingredients,
        instructions: recipeData.instructions,
        prep_time: recipeData.prepTime,
        cook_time: recipeData.cookTime,
        total_time: recipeData.totalTime,
        servings: recipeData.servings,
        difficulty: recipeData.difficulty,
        image_url: recipeData.imageUrl,
        tags: recipeData.tags || []
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase insert error:', error)
      throw error
    }
    
    console.log('✅ Recipe saved to DB successfully:', data)
    return data
  } catch (error) {
    console.error('❌ Error saving recipe:', error)
    throw error
  }
}

export async function getRecipes() {
  try {
    console.log('🔍 Fetching recipes from Supabase...')
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Supabase error:', error)
      throw error
    }
    console.log('✅ Recipes fetched:', data?.length || 0, 'recipes')
    return data || []
  } catch (error) {
    console.error('❌ Error loading recipes:', error)
    return []
  }
}

export async function getRecipeById(id: number) {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error loading recipe:', error)
    return null
  }
}

export async function updateRecipeImage(id: number, imageUrl: string) {
  try {
    console.log('🖼️ Updating recipe image:', id)
    
    const { error } = await supabase
      .from('recipes')
      .update({ 
        image_url: imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) {
      console.error('❌ Error updating recipe image:', error)
      throw error
    }
    
    console.log('✅ Recipe image updated successfully')
  } catch (error) {
    console.error('❌ Error updating recipe image:', error)
    throw error
  }
}

export async function deleteRecipe(id: number) {
  try {
    console.log('🗑️ Attempting to delete recipe:', id)
    
    // First, check if this recipe is referenced in meal_history
    const { data: historyRefs, error: checkError } = await supabase
      .from('meal_history')
      .select('id')
      .eq('library_recipe_id', id)
      .limit(1)
    
    if (checkError) {
      console.error('❌ Error checking meal history:', checkError)
      throw checkError
    }
    
    // If recipe is in meal history, we need to handle it
    if (historyRefs && historyRefs.length > 0) {
      console.log('⚠️ Recipe is referenced in meal history, unlinking...')
      
      // Option 1: Set library_recipe_id to NULL for all meal history entries
      const { error: unlinkError } = await supabase
        .from('meal_history')
        .update({ library_recipe_id: null, saved_to_library: false })
        .eq('library_recipe_id', id)
      
      if (unlinkError) {
        console.error('❌ Error unlinking from meal history:', unlinkError)
        throw unlinkError
      }
      
      console.log('✅ Unlinked recipe from meal history')
    }
    
    // Now safe to delete the recipe
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Error deleting recipe:', error)
      throw error
    }
    
    console.log('✅ Recipe deleted successfully')
  } catch (error) {
    console.error('❌ Error deleting recipe:', error)
    throw error
  }
}

