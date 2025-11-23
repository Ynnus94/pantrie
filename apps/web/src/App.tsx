import { useState } from 'react'
import { MainLayout } from './components/layout/MainLayout'
import { Dashboard } from './components/pages/Dashboard'
import { MealPlanGenerator } from './components/MealPlanGenerator'
import { HistoryPage } from './components/pages/HistoryPage'
import { FamilyProfilesPage } from './components/pages/FamilyProfilesPage'
import { ThisWeekMealsPage } from './components/pages/ThisWeekMealsPage'
import { GroceryListsPage } from './components/pages/GroceryListsPage'
import { RecipeLibraryPage } from './components/pages/RecipeLibraryPage'
import { InsightsPage } from './components/pages/InsightsPage'
import { SettingsPage } from './components/pages/SettingsPage'
import { Toaster } from './components/ui/sonner'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  
  // Navigation handler
  const handleNavigate = (page: string) => {
    setCurrentPage(page)
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
        return <HistoryPage />
      
      case 'family':
        return <FamilyProfilesPage />
      
      case 'thisweek':
        return <ThisWeekMealsPage onNavigate={handleNavigate} />
      
      case 'grocery':
        return <GroceryListsPage />
      
      case 'recipes':
        return <RecipeLibraryPage />
      
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
    <>
      <MainLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {renderPage()}
      </MainLayout>
      <Toaster position="top-right" richColors />
    </>
  )
}

export default App
