import { Router } from 'express'
import { extractRecipeFromUrl } from '../services/recipeService.js'

const router = Router()

// POST /api/recipes/import
router.post('/import', async (req, res) => {
  try {
    const { url } = req.body
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' })
    }
    
    // Validate URL format
    try {
      new URL(url)
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' })
    }
    
    console.log('Importing recipe from:', url)
    
    // Extract recipe using Claude AI
    const recipeData = await extractRecipeFromUrl(url)
    
    // TODO: Save to database (Supabase)
    // const savedRecipe = await saveRecipe(recipeData)
    
    // Return recipe data
    res.json(recipeData)
    
  } catch (error: any) {
    console.error('Recipe import error:', error)
    res.status(500).json({ 
      error: 'Failed to import recipe',
      details: error.message 
    })
  }
})

export { router as recipeRoutes }

