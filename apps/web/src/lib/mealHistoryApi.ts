import { supabase } from './supabase'

export interface SaveMealRatingData {
  meal: any
  ratings: Record<number, number>
  notes: string
  saveToLibrary: boolean
}

export async function saveMealRating(ratingData: SaveMealRatingData) {
  try {
    console.log('💾 Saving meal rating:', ratingData)
    
    const averageRating = Object.values(ratingData.ratings).reduce((a, b) => a + b, 0) / Object.keys(ratingData.ratings).length

    // Ensure we have required fields
    const mealName = ratingData.meal.name || ratingData.meal.mealName || 'Unnamed Meal'
    const ingredients = Array.isArray(ratingData.meal.ingredients) ? ratingData.meal.ingredients : []
    const instructions = Array.isArray(ratingData.meal.instructions) ? ratingData.meal.instructions : []

    console.log('📝 Meal data:', { mealName, ingredients, instructions })

    // 1. Create meal history entry
    const { data: mealHistory, error: historyError } = await supabase
      .from('meal_history')
      .insert({
        family_id: 1,
        cooked_date: new Date().toISOString().split('T')[0],
        day_of_week: ratingData.meal.dayOfWeek || new Date().toLocaleDateString('en-US', { weekday: 'long' }),
        meal_name: mealName,
        was_from_meal_plan: true,
        recipe_snapshot: {
          name: mealName,
          ingredients: ingredients,
          instructions: instructions,
          description: ratingData.meal.description || '',
          cookTime: ratingData.meal.cookTime || 0,
          cuisine: ratingData.meal.cuisine
        },
        average_rating: averageRating,
        notes: ratingData.notes,
        saved_to_library: ratingData.saveToLibrary
      })
      .select()
      .single()

    if (historyError) {
      console.error('❌ Meal history error:', historyError)
      throw historyError
    }
    
    console.log('✅ Meal history saved:', mealHistory)

    // 2. Save individual ratings
    const ratingsToInsert = Object.entries(ratingData.ratings).map(([memberId, rating]) => ({
      meal_history_id: mealHistory.id,
      family_member_id: parseInt(memberId),
      rating: rating
    }))

    console.log('⭐ Saving ratings:', ratingsToInsert)

    const { error: ratingsError } = await supabase
      .from('meal_history_ratings')
      .insert(ratingsToInsert)

    if (ratingsError) {
      console.error('❌ Ratings error:', ratingsError)
      throw ratingsError
    }
    
    console.log('✅ Ratings saved')

    // 3. If save to library, create recipe
    if (ratingData.saveToLibrary) {
      console.log('📚 Saving to library...')
      
      const { data: recipe, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          family_id: 1,
          title: mealName,
          description: ratingData.meal.description || '',
          source_type: 'meal-history',
          source_meal_history_id: mealHistory.id,
          ingredients: ingredients,
          instructions: instructions,
          cook_time: ratingData.meal.cookTime || 0,
          difficulty: ratingData.meal.difficulty || 'medium',
          image_url: ratingData.meal.imageUrl || null,
          times_made: 1,
          average_rating: averageRating,
          last_made: new Date().toISOString().split('T')[0],
          tags: ratingData.meal.cuisine ? [ratingData.meal.cuisine] : []
        })
        .select()
        .single()

      if (recipeError) {
        console.error('❌ Recipe error:', recipeError)
        throw recipeError
      }
      
      console.log('✅ Recipe saved:', recipe)

      // Update meal history with library recipe id
      const { error: updateError } = await supabase
        .from('meal_history')
        .update({ library_recipe_id: recipe.id })
        .eq('id', mealHistory.id)
        
      if (updateError) {
        console.error('❌ Update error:', updateError)
        throw updateError
      }
      
      console.log('✅ Recipe linked to meal history')
    }

    console.log('🎉 All done! Rating saved successfully')
    return mealHistory
  } catch (error) {
    console.error('❌ Error saving meal rating:', error)
    throw error
  }
}

export async function getMealHistory(limit = 20) {
  try {
    const { data, error } = await supabase
      .from('meal_history')
      .select(`
        *,
        ratings:meal_history_ratings(
          rating,
          family_member:family_members(name)
        )
      `)
      .order('cooked_date', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error loading meal history:', error)
    return []
  }
}

export async function saveHistoryToLibrary(mealHistoryId: number) {
  try {
    // 1. Get meal history entry
    const { data: mealHistory, error: historyError } = await supabase
      .from('meal_history')
      .select('*')
      .eq('id', mealHistoryId)
      .single()

    if (historyError) throw historyError

    // 2. Create recipe
    const recipeSnapshot = mealHistory.recipe_snapshot as any
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        family_id: 1,
        title: mealHistory.meal_name,
        description: recipeSnapshot.description || '',
        source_type: 'meal-history',
        source_meal_history_id: mealHistoryId,
        ingredients: recipeSnapshot.ingredients || [],
        instructions: recipeSnapshot.instructions || [],
        cook_time: recipeSnapshot.cookTime || 0,
        average_rating: mealHistory.average_rating,
        times_made: 1,
        last_made: mealHistory.cooked_date,
        tags: recipeSnapshot.cuisine ? [recipeSnapshot.cuisine] : []
      })
      .select()
      .single()

    if (recipeError) throw recipeError

    // 3. Update meal history
    await supabase
      .from('meal_history')
      .update({ 
        saved_to_library: true,
        library_recipe_id: recipe.id 
      })
      .eq('id', mealHistoryId)

    return recipe
  } catch (error) {
    console.error('Error saving to library:', error)
    throw error
  }
}

