import { useState } from 'react'
import { MainLayout } from './components/layout/MainLayout'
import { Dashboard } from './components/pages/Dashboard'
import { MealPlanGenerator } from './components/MealPlanGenerator'
import { MealHistory } from './components/pages/MealHistory'
import { FamilyProfilesPage } from './components/pages/FamilyProfilesPage'
import { ThisWeekMealsPage } from './components/pages/ThisWeekMealsPage'
import { GroceryListsPage } from './components/pages/GroceryListsPage'
import { RecipeLibraryPage } from './components/pages/RecipeLibraryPage'
import { RecipeDetail } from './components/pages/RecipeDetail'
import { InsightsPage } from './components/pages/InsightsPage'
import { SettingsPage } from './components/pages/SettingsPage'
import { Toaster } from './components/ui/sonner'
import { MealPlanProvider } from './context/MealPlanContext'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null)
  
  // Navigation handler
  const handleNavigate = (page: string, recipeId?: string) => {
    setCurrentPage(page)
    if (recipeId) {
      setSelectedRecipeId(recipeId)
    } else {
      setSelectedRecipeId(null)
    }
  }

  // Render current page content
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />
      
      case 'planning':
        // Show meal planning page (accessed from Generate button)
        return (
          <div className="p-8">
            <MealPlanGenerator />
          </div>
        )
      
      case 'history':
        return <MealHistory onNavigate={handleNavigate} />
      
      case 'family':
        return <FamilyProfilesPage />
      
      case 'thisweek':
        return <ThisWeekMealsPage onNavigate={handleNavigate} />
      
      case 'grocery':
        return <GroceryListsPage />
      
      case 'recipes':
        return <RecipeLibraryPage onNavigate={handleNavigate} />
      
      case 'recipe-detail':
        if (!selectedRecipeId) {
          setCurrentPage('recipes')
          return null
        }
        return <RecipeDetail recipeId={selectedRecipeId} onNavigate={handleNavigate} />
      
      case 'insights':
        return <InsightsPage />
      
      case 'settings':
        return <SettingsPage />
      
      // Quick actions
      case 'generate':
        // Navigate to This Week's Meals page
        setCurrentPage('thisweek')
        return null
      
      case 'add-recipe':
        // Navigate to recipes page
        setCurrentPage('recipes')
        return null
      
      case 'rate-meal':
        // Navigate to this week's meals
        setCurrentPage('thisweek')
        return null
      
      default:
        return <Dashboard onNavigate={handleNavigate} />
    }
  }

  return (
    <MealPlanProvider>
      <MainLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {renderPage()}
      </MainLayout>
      <Toaster position="top-right" richColors />
    </MealPlanProvider>
  )
}

export default App
