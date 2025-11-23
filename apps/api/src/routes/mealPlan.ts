import { Router } from 'express'
import { generateMealPlan, quickFixMealPlan, getMealPlans, saveMealPlan, updateMealPlan, deleteMealPlan } from '../services/mealPlanService.js'

const router = Router()

// Generate a new meal plan
router.post('/generate', async (req, res) => {
  try {
    const { weekStarting, preferences } = req.body
    const mealPlan = await generateMealPlan(weekStarting, preferences)
    res.json(mealPlan)
  } catch (error: any) {
    console.error('Error generating meal plan:', error)
    res.status(500).json({ error: error.message || 'Failed to generate meal plan' })
  }
})

// Quick fix a meal plan
router.post('/quick-fix', async (req, res) => {
  try {
    const { mealPlan, fixRequest } = req.body
    const fixedMealPlan = await quickFixMealPlan(mealPlan, fixRequest)
    res.json(fixedMealPlan)
  } catch (error: any) {
    console.error('Error fixing meal plan:', error)
    res.status(500).json({ error: error.message || 'Failed to fix meal plan' })
  }
})

// Get all meal plans
router.get('/', async (req, res) => {
  try {
    const mealPlans = await getMealPlans()
    res.json(mealPlans)
  } catch (error: any) {
    console.error('Error fetching meal plans:', error)
    res.status(500).json({ error: error.message || 'Failed to fetch meal plans' })
  }
})

// Save/approve a meal plan
router.post('/save', async (req, res) => {
  try {
    const { mealPlan } = req.body
    const saved = await saveMealPlan(mealPlan)
    res.json(saved)
  } catch (error: any) {
    console.error('Error saving meal plan:', error)
    res.status(500).json({ error: error.message || 'Failed to save meal plan' })
  }
})

// Update a meal plan
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { mealPlan } = req.body
    const updated = await updateMealPlan(parseInt(id), mealPlan)
    res.json(updated)
  } catch (error: any) {
    console.error('Error updating meal plan:', error)
    res.status(500).json({ error: error.message || 'Failed to update meal plan' })
  }
})

// Delete a meal plan
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await deleteMealPlan(parseInt(id))
    res.json(deleted)
  } catch (error: any) {
    console.error('Error deleting meal plan:', error)
    res.status(500).json({ error: error.message || 'Failed to delete meal plan' })
  }
})

export { router as mealPlanRoutes }

