const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function generateMealPlan(weekStarting: string, preferences?: any) {
  const response = await fetch(`${API_URL}/api/meal-plan/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ weekStarting, preferences })
  })
  if (!response.ok) throw new Error('Failed to generate meal plan')
  return response.json()
}

export async function quickFixMealPlan(mealPlan: any, fixRequest: string) {
  const response = await fetch(`${API_URL}/api/meal-plan/quick-fix`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mealPlan, fixRequest })
  })
  if (!response.ok) throw new Error('Failed to fix meal plan')
  return response.json()
}

export async function saveMealPlan(mealPlan: any) {
  const response = await fetch(`${API_URL}/api/meal-plan/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mealPlan })
  })
  if (!response.ok) throw new Error('Failed to save meal plan')
  return response.json()
}

export async function getMealPlans() {
  const response = await fetch(`${API_URL}/api/meal-plan`)
  if (!response.ok) throw new Error('Failed to fetch meal plans')
  return response.json()
}

export async function updateMealPlan(id: number, mealPlan: any) {
  const response = await fetch(`${API_URL}/api/meal-plan/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mealPlan })
  })
  if (!response.ok) throw new Error('Failed to update meal plan')
  return response.json()
}

export async function deleteMealPlan(id: number) {
  const response = await fetch(`${API_URL}/api/meal-plan/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete meal plan')
  return response.json()
}

export async function getFoodTries() {
  const response = await fetch(`${API_URL}/api/toddler/tries`)
  if (!response.ok) throw new Error('Failed to fetch food tries')
  return response.json()
}

export async function addFoodTry(foodTry: any) {
  const response = await fetch(`${API_URL}/api/toddler/tries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(foodTry)
  })
  if (!response.ok) throw new Error('Failed to add food try')
  return response.json()
}

