import { Router } from 'express'
import { getFoodTries, addFoodTry } from '../services/toddlerService.js'

const router = Router()

// Get all food tries
router.get('/tries', async (req, res) => {
  try {
    const tries = await getFoodTries()
    res.json(tries)
  } catch (error: any) {
    console.error('Error fetching food tries:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch food tries' })
  }
})

// Add a new food try
router.post('/tries', async (req, res) => {
  try {
    const foodTry = await addFoodTry(req.body)
    res.json(foodTry)
  } catch (error: any) {
    console.error('Error adding food try:', error)
    res.status(500).json({ error: error.message || 'Failed to add food try' })
  }
})

export { router as toddlerRoutes }

