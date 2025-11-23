import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables FIRST, before any other imports
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// .env is in apps/api/, and we're in apps/api/src/, so go up one level
dotenv.config({ path: join(__dirname, '../.env') })

import express from 'express'
import cors from 'cors'
import { mealPlanRoutes } from './routes/mealPlan.js'
import { toddlerRoutes } from './routes/toddler.js'
import { groceryRoutes } from './routes/grocery.js'
import { recipeRoutes } from './routes/recipes.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pantrie API is running' })
})

// API routes
app.use('/api/meal-plan', mealPlanRoutes)
app.use('/api/toddler', toddlerRoutes)
app.use('/api/grocery', groceryRoutes)
app.use('/api/recipes', recipeRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Pantrie API server running on http://localhost:${PORT}`)
})

