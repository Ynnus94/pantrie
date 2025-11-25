import { useState } from 'react'
import { Button } from './ui/button'
import { GlassCard } from './ui/GlassCard'
import { saveRecipe } from '../lib/recipesApi'
import { Link2, Loader2, Plus, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from './ui/alert'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface RecipeImportCardProps {
  onManualEntry?: () => void
  onRecipeImported?: (recipe: any) => void
}

export function RecipeImportCard({ onManualEntry, onRecipeImported }: RecipeImportCardProps) {
  const [url, setUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    if (!url.trim()) return
    
    setIsImporting(true)
    setError(null)
    toast.loading('Importing recipe...', { id: 'recipe-import' })
    
    try {
      console.log('🔗 Importing recipe from:', url)
      
      // Step 1: Extract recipe from URL using AI
      const response = await fetch(`${API_URL}/api/recipes/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to import recipe' }))
        console.error('❌ API Error:', errorData)
        throw new Error(errorData.error || 'Failed to import recipe')
      }
      
      const recipe = await response.json()
      console.log('🍳 Recipe extracted:', recipe)
      
      // Validate required fields
      if (!recipe.title) {
        throw new Error('Recipe title is missing')
      }
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        throw new Error('Recipe ingredients are missing')
      }
      if (!recipe.instructions || recipe.instructions.length === 0) {
        throw new Error('Recipe instructions are missing')
      }
      
      console.log('💾 Saving to database...')
      
      // Step 2: Save to database
      const savedRecipe = await saveRecipe({
        title: recipe.title,
        description: recipe.description || '',
        sourceType: 'url-import',
        sourceUrl: url,
        source: recipe.source || new URL(url).hostname,
        author: recipe.author,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        totalTime: recipe.totalTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        imageUrl: recipe.imageUrl,
        tags: recipe.tags || []
      })
      
      console.log('✅ Recipe saved to DB:', savedRecipe)
      
      // Show success
      toast.success('Recipe imported and saved!', {
        id: 'recipe-import',
        description: recipe.title || 'Recipe has been added to your library'
      })
      
      setUrl('')
      
      // Callback to parent component
      if (onRecipeImported) {
        onRecipeImported(savedRecipe)
      }
      
    } catch (err: any) {
      console.error('❌ Import error:', err)
      const errorMessage = err.message || 'Could not import recipe. Please check the URL and try again.'
      setError(errorMessage)
      toast.error('Import failed', {
        id: 'recipe-import',
        description: errorMessage
      })
    } finally {
      setIsImporting(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isImporting && url.trim()) {
      handleImport()
    }
  }

  return (
    <GlassCard hover={false} className="border-2 border-dashed border-honey/30 bg-gradient-to-br from-honey/10 to-transparent">
      <div className="flex items-center gap-2 text-lg font-semibold text-[#1a1a1a] mb-4">
        <div className="p-2 bg-[rgba(212,165,116,0.2)] rounded-xl">
          <Link2 className="h-5 w-5 text-[#C19A6B]" />
        </div>
        Import Recipe from URL
      </div>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="Paste recipe URL here (AllRecipes, NYTimes, any blog...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isImporting}
            className="glass-input flex-1 px-4 py-2.5 rounded-xl text-sm text-[#1a1a1a] placeholder:text-[#737373]"
          />
          <Button 
            onClick={handleImport} 
            disabled={!url.trim() || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              'Import'
            )}
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between text-sm text-[#737373]">
          <span>Supports: AllRecipes, NYTimes, Bon Appétit, and most food blogs</span>
          {onManualEntry && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-[#737373] hover:text-[#C19A6B]"
              onClick={onManualEntry}
            >
              <Plus className="h-4 w-4" />
              Manual Entry
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

