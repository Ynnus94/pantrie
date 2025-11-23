import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
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
    
    try {
      const response = await fetch(`${API_URL}/api/recipes/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to import recipe' }))
        throw new Error(errorData.error || 'Failed to import recipe')
      }
      
      const recipe = await response.json()
      
      // Show success
      toast.success('Recipe imported successfully!', {
        description: recipe.title || 'Recipe has been added to your library'
      })
      
      setUrl('')
      
      // Callback to parent component
      if (onRecipeImported) {
        onRecipeImported(recipe)
      }
      
    } catch (err: any) {
      const errorMessage = err.message || 'Could not import recipe. Please check the URL and try again.'
      setError(errorMessage)
      toast.error('Import failed', {
        description: errorMessage
      })
      console.error('Import error:', err)
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
    <Card className="border-2 border-dashed border-[#FF9500]/30 bg-gradient-to-br from-[#FF9500]/5 to-white shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-[#16250F]">
          <Link2 className="h-5 w-5 text-[#FF9500]" />
          Import Recipe from URL
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Paste recipe URL here (AllRecipes, NYTimes, any blog...)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isImporting}
            className="flex-1 border-[#16250F]/10 focus-visible:ring-[#FF9500]"
          />
          <Button 
            onClick={handleImport} 
            disabled={!url.trim() || isImporting}
            className="bg-[#FF9500] hover:bg-[#FF8500] text-white"
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
        
        <div className="flex items-center justify-between text-sm text-[#16250F]/70">
          <span>Supports: AllRecipes, NYTimes, Bon Appétit, and most food blogs</span>
          {onManualEntry && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-[#16250F]/70 hover:text-[#FF9500]"
              onClick={onManualEntry}
            >
              <Plus className="h-4 w-4" />
              Manual Entry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

