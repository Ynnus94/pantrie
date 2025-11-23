import { Router } from 'express'
import { generateGroceryList, getPriceData } from '../services/groceryService.js'

const router = Router()

// Generate grocery list from meal plan
router.post('/list', async (req, res) => {
  try {
    const { mealPlan } = req.body
    const groceryList = await generateGroceryList(mealPlan)
    res.json(groceryList)
  } catch (error: any) {
    console.error('Error generating grocery list:', error)
    res.status(500).json({ error: error.message || 'Failed to generate grocery list' })
  }
})

// Get price data for items
router.get('/prices', async (req, res) => {
  try {
    const { items } = req.query
    const itemArray = typeof items === 'string' ? items.split(',') : []
    const prices = await getPriceData(itemArray)
    res.json(prices)
  } catch (error: any) {
    console.error('Error fetching prices:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch prices' })
  }
})

export { router as groceryRoutes }

