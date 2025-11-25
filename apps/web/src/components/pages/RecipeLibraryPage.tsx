import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { GlassCard } from '../ui/GlassCard'
import { getRecipes, deleteRecipe } from '../../lib/recipesApi'
import { RecipePlaceholder } from '../RecipePlaceholder'
import { Book, Search, Plus, Clock, Utensils, Star, Loader2, MoreVertical, Eye, Pencil, Calendar, Share2, Trash2, ImageIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { RecipeImportCard } from '../RecipeImportCard'
import { RefreshImageModal } from '../modals/RefreshImageModal'
import { updateRecipeImage } from '../../lib/recipesApi'
import { toast } from 'sonner'

interface Recipe {
  id: string | number
  title?: string
  name?: string
  description: string
  cuisine?: string
  cook_time?: number
  cookTime?: number
  ingredients: string[]
  instructions: string[]
  average_rating?: number
  rating?: number
  tags?: string[]
}

interface RecipeLibraryPageProps {
  onNavigate?: (page: string, recipeId?: string) => void
}

export function RecipeLibraryPage({ onNavigate }: RecipeLibraryPageProps = {}) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [loading, setLoading] = useState(true)
  const [refreshingRecipe, setRefreshingRecipe] = useState<Recipe | null>(null)

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    setLoading(true)
    try {
      console.log('📚 Loading recipes from database...')
      const data = await getRecipes()
      console.log('✅ Loaded recipes:', data)
      setRecipes(data)
    } catch (error) {
      console.error('❌ Failed to load recipes:', error)
      toast.error('Failed to load recipes')
    } finally {
      setLoading(false)
    }
  }

  const filteredRecipes = recipes.filter(recipe => {
    const recipeName = recipe.title || recipe.name || ''
    const recipeCuisine = recipe.cuisine || (recipe.tags && recipe.tags[0]) || ''
    return recipeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           recipeCuisine.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleRecipeImported = (recipe: any) => {
    // Recipe is already saved to database by RecipeImportCard
    // Just refresh the list
    console.log('Recipe imported, refreshing list:', recipe)
    loadRecipes()
  }

  const handleDelete = async (recipeId: string | number) => {
    if (!confirm('Are you sure you want to delete this recipe? This will remove it from your library and unlink it from any meal history.')) return
    
    try {
      console.log('🗑️ Deleting recipe:', recipeId)
      await deleteRecipe(typeof recipeId === 'string' ? parseInt(recipeId) : recipeId)
      toast.success('Recipe deleted successfully!')
      await loadRecipes()
    } catch (error: any) {
      console.error('❌ Failed to delete:', error)
      const errorMessage = error?.message || 'Failed to delete recipe'
      toast.error(errorMessage)
    }
  }

  const handleViewRecipe = (recipeId: string | number) => {
    if (onNavigate) {
      onNavigate('recipe-detail', String(recipeId))
    }
  }

  const handleRefreshImage = (recipe: Recipe) => {
    setRefreshingRecipe(recipe)
  }

  const handleImageSelected = async (newImageUrl: string) => {
    if (!refreshingRecipe) return
    
    try {
      // Update in database
      await updateRecipeImage(
        typeof refreshingRecipe.id === 'string' ? parseInt(refreshingRecipe.id) : refreshingRecipe.id,
        newImageUrl
      )
      
      // Update local state
      setRecipes(recipes.map(r => 
        r.id === refreshingRecipe.id 
          ? { ...r, image_url: newImageUrl, imageUrl: newImageUrl }
          : r
      ))
      
      setRefreshingRecipe(null)
    } catch (error) {
      console.error('Failed to update image:', error)
      toast.error('Failed to update image')
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-primary mb-2">Recipes</h1>
        <p className="text-lg text-secondary">
          Your curated collection of favorite recipes. Import from URLs or save from meal history.
        </p>
      </div>

      {/* Import Card - Primary Action */}
      <RecipeImportCard 
        onManualEntry={() => setShowAddDialog(true)}
        onRecipeImported={handleRecipeImported}
      />

      {/* Recipe Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary">
            Your Recipes ({recipes.length})
          </h2>
          {recipes.length > 0 && (
            <div className="flex gap-2">
              <Button variant="glass" size="sm">Filter</Button>
              <Button variant="glass" size="sm">Sort</Button>
            </div>
          )}
        </div>

        {/* Manual Entry Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="hidden" />
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Recipe</DialogTitle>
              <DialogDescription>
                Save a recipe to your library for easy access
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="recipe-name">Recipe Name</Label>
                <Input id="recipe-name" placeholder="e.g., Honey Garlic Salmon" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipe-cuisine">Cuisine</Label>
                <Input id="recipe-cuisine" placeholder="e.g., Asian, Italian" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cook-time">Cook Time (minutes)</Label>
                  <Input id="cook-time" type="number" placeholder="30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipe-description">Description</Label>
                <Textarea id="recipe-description" placeholder="Brief description of the recipe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ingredients">Ingredients (one per line)</Label>
                <Textarea id="ingredients" placeholder="1 lb salmon&#10;2 tbsp honey&#10;3 cloves garlic" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions (one per line)</Label>
                <Textarea id="instructions" placeholder="Step 1: Heat pan&#10;Step 2: Cook salmon" />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#FF9500] hover:bg-[#FF8500]">
                  Save Recipe
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

        {/* Search */}
        {recipes.length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search recipes by name or cuisine..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-primary placeholder:text-muted"
            />
          </div>
        )}

        {/* Empty State */}
        {filteredRecipes.length === 0 ? (
          <GlassCard hover={false}>
            <div className="py-8 text-center">
              <div className="p-4 bg-gradient-to-br from-honey to-honey-dark rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <Book className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-primary mb-3">
                {searchQuery ? 'No recipes match your search' : 'No recipes yet!'}
              </h3>
              <p className="text-secondary mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Import your first recipe by pasting a URL above'}
              </p>
              {!searchQuery && (
                <p className="text-sm text-muted">
                  Try recipes from AllRecipes, NYTimes Cooking, or any food blog
                </p>
              )}
            </div>
          </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => {
            const title = recipe.title || recipe.name || 'Untitled Recipe'
            const cookTime = recipe.cook_time || recipe.cookTime || 0
            const rating = recipe.average_rating || recipe.rating
            const cuisine = recipe.cuisine || (recipe.tags && recipe.tags[0]) || 'Other'
            const imageUrl = recipe.image_url || recipe.imageUrl
            
            return (
              <GlassCard key={recipe.id} padding="none" className="overflow-hidden">
                <div 
                  className="h-48 overflow-hidden bg-[var(--bg-glass-light)] relative cursor-pointer group"
                  onClick={() => handleViewRecipe(recipe.id)}
                >
                  {imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <RecipePlaceholder 
                      mealName={title}
                      className="w-full h-full"
                    />
                  )}
                  
                  {/* Refresh Image Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRefreshImage(recipe)
                    }}
                    className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 glass-button p-2 rounded-lg bg-white/80 hover:bg-white hover:scale-110 shadow-lg"
                    aria-label="Find better image"
                  >
                    <ImageIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-primary">{title}</h3>
                    {rating && rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-[#C19A6B] fill-[#C19A6B]" />
                        <span className="text-sm font-medium text-primary">{rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="border-[rgba(212,165,116,0.3)] text-xs bg-[rgba(212,165,116,0.1)] text-[#A67C52]">
                      {cuisine}
                    </Badge>
                    {cookTime > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted">
                        <Clock className="h-3 w-3" />
                        {cookTime} min
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-secondary mb-4 line-clamp-2">{recipe.description || 'No description available'}</p>
                  <div className="flex items-center gap-2 text-xs text-muted mb-4">
                    <Utensils className="h-3 w-3" />
                    {recipe.ingredients?.length || 0} ingredients
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="glass" 
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewRecipe(recipe.id)}
                    >
                      View Recipe
                    </Button>
                    
                    {/* Management menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="glass-button h-9 w-9 rounded-lg flex items-center justify-center">
                          <MoreVertical className="h-4 w-4 text-primary" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewRecipe(recipe.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Edit - coming soon!')}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Recipe
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info('Add to week - coming soon!')}>
                          <Calendar className="h-4 w-4 mr-2" />
                          Add to This Week
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.share?.({ title: title, url: window.location.href }).catch(() => toast.success('Link copied!'))}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDelete(recipe.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      )}

      {/* Refresh Image Modal */}
      <RefreshImageModal
        meal={refreshingRecipe ? { name: refreshingRecipe.title || refreshingRecipe.name, ...refreshingRecipe } : null}
        isOpen={!!refreshingRecipe}
        onClose={() => setRefreshingRecipe(null)}
        onImageSelected={handleImageSelected}
      />
    </div>
  )
}

